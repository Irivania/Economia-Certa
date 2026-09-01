import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotationItems, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, quotationId } = body;

    if (!companyId || !quotationId) {
      return NextResponse.json(
        { error: 'O ID da empresa e o ID da cotação são obrigatórios.' },
        { status: 400 }
      );
    }

    // 1. Busca todos os itens da cotação
    const items = await db
      .select({
        productId: quotationItems.productId,
        price: quotationItems.price,
      })
      .from(quotationItems)
      .where(eq(quotationItems.quotationId, quotationId));

    if (items.length === 0) {
      return NextResponse.json({ error: 'Nenhum item encontrado nesta cotação.' }, { status: 404 });
    }

    // 2. Descobre o menor preço ofertado para cada produto dentro desta cotação
    const lowestPricesMap: { [productId: string]: number } = {};
    items.forEach((item) => {
      const priceVal = Number(item.price) || 0;
      if (!lowestPricesMap[item.productId] || priceVal < lowestPricesMap[item.productId]) {
        lowestPricesMap[item.productId] = priceVal;
      }
    });

    // 3. Atualiza o preço de custo (costPrice) dos produtos no catálogo
    let updatedCount = 0;
    for (const [productId, bestPrice] of Object.entries(lowestPricesMap)) {
      await db
        .update(products)
        .set({ costPrice: bestPrice.toString() }) // ou number, dependendo do schema
        .where(and(eq(products.id, productId), eq(products.companyId, companyId)));
      
      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Preços de custo de ${updatedCount} produtos atualizados com sucesso com base na cotação!`,
    });
  } catch (error) {
    console.error('Erro ao atualizar preços de custo:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar custos dos produtos.' }, { status: 500 });
  }
}