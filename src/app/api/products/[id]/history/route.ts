import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { products, productCostHistory } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Busca o produto
    const productList = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (productList.length === 0) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }
    const product = productList[0];

    // 2. Busca o histórico de custos ordenado do mais recente para o mais antigo
    const historyList = await db
      .select()
      .from(productCostHistory)
      .where(eq(productCostHistory.productId, id))
      .orderBy(desc(productCostHistory.createdAt));

    return NextResponse.json({
      success: true,
      product,
      history: historyList,
    });
  } catch (error: unknown) {
    console.error('Erro ao carregar histórico de custos:', error);
    const msg = error instanceof Error ? error.message : 'Erro interno.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}