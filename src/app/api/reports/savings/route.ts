import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotations, quotationItems, quotationSuppliers, quotationSupplierItems, products } from '@/db/schema';
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

    // 2. Busca os itens solicitados na cotação com os preços cadastrados dos produtos
    const items = await db
      .select({
        itemId: quotationItems.id,
        productId: products.id,
        description: products.description,
        currentCostPrice: products.costPrice,
        requestedQuantity: quotationItems.requestedQuantity,
      })
      .from(quotationItems)
      .innerJoin(quotations, eq(quotationItems.quotationId, quotations.id))
      .innerJoin(products, eq(quotationItems.productId, products.id))
      .where(eq(quotationItems.quotationId, quotationId));

    // 3. Busca as ofertas de preços enviadas pelos fornecedores para esta cotação
    const supplierOffers = await db
      .select({
        productId: quotationSupplierItems.productId,
        price: quotationSupplierItems.price,
        outOfStock: quotationSupplierItems.outOfStock,
      })
      .from(quotationSupplierItems)
      .innerJoin(
        quotationSuppliers,
        eq(quotationSupplierItems.quotationSupplierId, quotationSuppliers.id)
      )
      .where(eq(quotationSuppliers.quotationId, quotationId));

    // Mapeia o menor preço ofertado por produto nesta cotação
    const bestPricesMap: Record<string, number> = {};
    supplierOffers.forEach((offer) => {
      if (offer.outOfStock || offer.price === null) return;
      const priceVal = Number(offer.price) || 0;
      if (priceVal > 0) {
        if (!bestPricesMap[offer.productId] || priceVal < bestPricesMap[offer.productId]) {
          bestPricesMap[offer.productId] = priceVal;
        }
      }
    });

    let totalOriginalCost = 0;
    let totalOptimizedCost = 0;

    const savingsDetails = items.map((item) => {
      const qty = Number(item.requestedQuantity) || 0;
      const currentCost = item.currentCostPrice ? Number(item.currentCostPrice) : 0;
      
      // Utiliza o melhor preço ofertado encontrado ou o custo atual se não houver oferta válida
      const offered = bestPricesMap[item.productId] !== undefined 
        ? bestPricesMap[item.productId] 
        : currentCost;

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