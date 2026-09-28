import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotationSuppliers, quotationItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, prices, outOfStock } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido.' }, { status: 400 });
    }

    // 1. Localiza o fornecedor pelo token
    const supplierRecords = await db
      .select()
      .from(quotationSuppliers)
      .where(eq(quotationSuppliers.token, token));

    const supplierRecord = supplierRecords?.[0];

    if (!supplierRecord) {
      return NextResponse.json({ error: 'Fornecedor ou cotação não encontrados.' }, { status: 404 });
    }

    const quotationId = supplierRecord.quotationId;

    // 2. Busca os itens da cotação
    const items = await db
      .select()
      .from(quotationItems)
      .where(eq(quotationItems.quotationId, quotationId));

    // 3. Atualiza cada item com segurança usando o Drizzle ORM
    for (const item of items) {
      const itemId = item.id;
      const isUnavailable = outOfStock?.[itemId] || false;
      const unitPrice = prices?.[itemId] !== undefined ? Number(prices[itemId]) : 0;
      const finalPrice = isUnavailable ? 0 : unitPrice;

      try {
        await db
          .update(quotationItems)
          .set({
            unitPrice: finalPrice,
          } as Record<string, unknown>)
          .where(
            and(
              eq(quotationItems.id, itemId),
              eq(quotationItems.quotationId, quotationId)
            )
          );
      } catch (err) {
        console.error(`Erro ao atualizar item ${itemId}:`, err);
      }
    }

    // 4. Marca o fornecedor como respondido
    await db
      .update(quotationSuppliers)
      .set({
        status: 'responded',
      } as Record<string, unknown>)
      .where(eq(quotationSuppliers.token, token));

    return NextResponse.json({ success: true, message: 'Proposta enviada com sucesso!' });
  } catch (error) {
    console.error('Erro crítico ao responder cotação:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar resposta da cotação.' }, { status: 500 });
  }
}