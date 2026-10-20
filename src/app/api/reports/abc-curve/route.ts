import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { products, saleItems, sales } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID não informado.' }, { status: 400 });
    }

    const allProducts = await db
      .select()
      .from(products)
      .where(eq(products.companyId, companyId));

    const productSalesMap: Record<string, { totalRevenue: number; totalQuantity: number; description: string; stockCurrent: number; salePrice: string | null }> = {};

    allProducts.forEach((p) => {
      productSalesMap[p.id] = {
        totalRevenue: 0,
        totalQuantity: 0,
        description: p.description,
        stockCurrent: p.stockCurrent,
        salePrice: p.salePrice,
      };
    });

    const completedSales = await db
      .select({ id: sales.id })
      .from(sales)
      .where(and(eq(sales.companyId, companyId), eq(sales.status, 'COMPLETED')));

    for (const sale of completedSales) {
      const items = await db
        .select()
        .from(saleItems)
        .where(eq(saleItems.saleId, sale.id));

      for (const item of items) {
        if (productSalesMap[item.productId]) {
          const rev = Number(item.subtotal || 0);
          const qty = Number(item.quantity || 0);
          productSalesMap[item.productId].totalRevenue += rev;
          productSalesMap[item.productId].totalQuantity += qty;
        }
      }
    }

    const rankedProducts = Object.entries(productSalesMap).map(([id, data]) => ({
      id,
      ...data,
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);

    const grandTotalRevenue = rankedProducts.reduce((acc, curr) => acc + curr.totalRevenue, 0);

    let accumulatedRevenue = 0;
    const classifiedProducts = rankedProducts.map((item) => {
      accumulatedRevenue += item.totalRevenue;
      const percentage = grandTotalRevenue > 0 ? (accumulatedRevenue / grandTotalRevenue) * 100 : 100;

      let classification: 'A' | 'B' | 'C' = 'C';
      if (percentage <= 70) {
        classification = 'A';
      } else if (percentage <= 90) {
        classification = 'B';
      } else {
        classification = 'C';
      }

      const revenueShare = grandTotalRevenue > 0 ? (item.totalRevenue / grandTotalRevenue) * 100 : 0;

      return {
        ...item,
        revenueShare,
        classification,
      };
    });

    return NextResponse.json({
      success: true,
      grandTotalRevenue,
      products: classifiedProducts,
    });
  } catch (error) {
    console.error('Erro ao calcular Curva ABC:', error);
    return NextResponse.json({ error: 'Erro interno ao gerar relatório Curva ABC.' }, { status: 500 });
  }
}