import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, companyId, salePrice } = body;

    if (!productId || !companyId || salePrice === undefined) {
      return NextResponse.json({ error: 'Parâmetros insuficientes para atualização.' }, { status: 400 });
    }

    await db
      .update(products)
      .set({
        salePrice: String(salePrice),
      })
      .where(and(eq(products.id, productId), eq(products.companyId, companyId)));

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Erro ao atualizar preço de venda:', error);
    const msg = error instanceof Error ? error.message : 'Erro interno.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}