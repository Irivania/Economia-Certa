import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { sales, saleItems, products } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const period = searchParams.get('period') || 'today'; // 'today', 'week', 'month', 'year', 'custom'
    const customStart = searchParams.get('start');
    const customEnd = searchParams.get('end');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID não informado.' }, { status: 400 });
    }

    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      const firstDay = now.getDate() - now.getDay();
      startDate = new Date(now.setDate(firstDay));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      // Mês inteiro atual
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'year') {
      // Ano todo atual
      startDate = new Date(now.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'custom' && customStart && customEnd) {
      // De tal dia a tal dia personalizado
      startDate = new Date(customStart + 'T00:00:00');
      endDate = new Date(customEnd + 'T23:59:59');
    }

    // Buscar vendas concluídas no intervalo
    const periodSales = await db
      .select()
      .from(sales)
      .where(
        and(
          eq(sales.companyId, companyId),
          eq(sales.status, 'COMPLETED'),
          gte(sales.createdAt, startDate),
          lte(sales.createdAt, endDate)
        )
      );

    let grossRevenue = 0;
    let totalCostOfGoods = 0;
    let cardFees = 0;
    const paymentBreakdown: Record<string, number> = { CASH: 0, PIX: 0, CREDIT_CARD: 0, DEBIT_CARD: 0, CONVENIO: 0 };

    for (const sale of periodSales) {
      const saleTotal = Number(sale.total);
      grossRevenue += saleTotal;
      paymentBreakdown[sale.paymentMethod] = (paymentBreakdown[sale.paymentMethod] || 0) + saleTotal;

      if (sale.paymentMethod === 'CREDIT_CARD') {
        cardFees += saleTotal * 0.025;
      } else if (sale.paymentMethod === 'DEBIT_CARD') {
        cardFees += saleTotal * 0.012;
      }
    }

    if (periodSales.length > 0) {
      for (const sale of periodSales) {
        const items = await db
          .select({
            quantity: saleItems.quantity,
            productId: saleItems.productId,
          })
          .from(saleItems)
          .where(eq(saleItems.saleId, sale.id));

        for (const item of items) {
          const [prod] = await db
            .select({ costPrice: products.costPrice })
            .from(products)
            .where(eq(products.id, item.productId))
            .limit(1);

          const unitCost = Number(prod?.costPrice || 0);
          totalCostOfGoods += unitCost * Number(item.quantity);
        }
      }
    }

    const estimatedTaxes = grossRevenue * 0.04;
    const grossProfit = grossRevenue - totalCostOfGoods;
    const netProfit = grossProfit - cardFees - estimatedTaxes;
    const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    return NextResponse.json({
      success: true,
      period,
      metrics: {
        grossRevenue,
        totalCostOfGoods,
        grossProfit,
        cardFees,
        estimatedTaxes,
        netProfit,
        profitMargin,
        salesCount: periodSales.length,
        paymentBreakdown,
      },
    });
  } catch (error) {
    console.error('Erro ao calcular relatório de lucratividade:', error);
    return NextResponse.json({ error: 'Erro interno ao gerar relatório financeiro.' }, { status: 500 });
  }
}