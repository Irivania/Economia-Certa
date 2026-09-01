import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotations, quotationItems, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const quotationId = searchParams.get('quotationId');

    if (!companyId || !quotationId) {
      return NextResponse.json(
        { error: 'O ID da empresa e o ID da cotação são obrigatórios.' },
        { status: 400 }
      );
    }

    // 1. Busca a cotação
    const [quotation] = await db
      .select()
      .from(quotations)
      .where(and(eq(quotations.id, quotationId), eq(quotations.companyId, companyId)));

    if (!quotation) {
      return NextResponse.json({ error: 'Cotação não encontrada.' }, { status: 404 });
    }

    // 2. Busca os itens da cotação com os preços cadastrados dos produtos e preço ofertado
    const items = await db
      .select({
        itemId: quotationItems.id,
        productId: products.id,
        description: products.description,
        currentCostPrice: products.costPrice,
        offeredPrice: quotationItems.price,
        requestedQuantity: quotationItems.requestedQuantity, // Ajustado para requestedQuantity
      })
      .from(quotationItems)
      .innerJoin(quotations, eq(quotationItems.quotationId, quotations.id))
      .innerJoin(products, eq(quotationItems.productId, products.id))
      .where(eq(quotationItems.quotationId, quotationId));

    let totalOriginalCost = 0;
    let totalOptimizedCost = 0;

    const savingsDetails = items.map((item) => {
      const qty = Number(item.requestedQuantity) || 0; // Ajustado para usar requestedQuantity
      const currentCost = item.currentCostPrice ? Number(item.currentCostPrice) : 0;
      const offered = item.offeredPrice ? Number(item.offeredPrice) : currentCost;

      const originalTotal = currentCost * qty;
      const optimizedTotal = offered * qty;

      totalOriginalCost += originalTotal;
      totalOptimizedCost += optimizedTotal;

      const diff = originalTotal - optimizedTotal;

      return {
        productId: item.productId,
        description: item.description,
        quantity: qty,
        currentCost,
        offeredPrice: offered,
        originalTotal,
        optimizedTotal,
        saving: diff,
      };
    });

    const totalSavings = totalOriginalCost - totalOptimizedCost;
    const savingsPercentage = totalOriginalCost > 0 ? (totalSavings / totalOriginalCost) * 100 : 0;

    return NextResponse.json({
      quotationId,
      summary: {
        totalOriginalCost,
        totalOptimizedCost,
        totalSavings,
        savingsPercentage,
      },
      details: savingsDetails,
    });
  } catch (error) {
    console.error('Erro ao calcular relatório de economia:', error);
    return NextResponse.json({ error: 'Erro interno ao gerar relatório de economia.' }, { status: 500 });
  }
}