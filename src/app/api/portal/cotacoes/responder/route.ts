import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotationSuppliers, quotationItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, prices, outOfStock, observation } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido.' }, { status: 400 });
    }

    const supplierRecords = await db
      .select()
      .from(quotationSuppliers)
      .where(eq(quotationSuppliers.token, token));

    const supplierRecord = supplierRecords?.[0];

    if (!supplierRecord) {
      return NextResponse.json({ error: 'Fornecedor ou cotação não encontrados.' }, { status: 404 });
    }

    const quotationId = supplierRecord.quotationId;
    const supplierId = supplierRecord.supplierId;

    const items = await db
      .select()
      .from(quotationItems)
      .where(eq(quotationItems.quotationId, quotationId));

    let calculatedTotal = 0;

    for (const item of items) {
      const itemId = item.id;
      const productId = item.productId;
      const isUnavailable = outOfStock?.[productId] || outOfStock?.[itemId] || false;
      const unitPrice = prices?.[productId] !== undefined ? Number(prices[productId]) : (prices?.[itemId] !== undefined ? Number(prices[itemId]) : 0);
      const finalPrice = isUnavailable ? 0 : unitPrice;

      // Soma ao total oferecido usando a propriedade correta requestedQuantity
      const requestedQty = Number(item.requestedQuantity || 1);
      if (!isUnavailable) {
        calculatedTotal += finalPrice * requestedQty;
      }

      await db
        .update(quotationItems)
        .set({
          price: String(finalPrice),
          supplierId: supplierId,
          outOfStock: isUnavailable,
        } as Record<string, unknown>)
        .where(
          and(
            eq(quotationItems.quotationId, quotationId),
            eq(quotationItems.productId, productId)
          )
        );
    }

    const updateData: Record<string, unknown> = {
      status: 'responded',
      totalOffered: calculatedTotal,
    };

    if (observation) {
      updateData.observation = observation;
    }

    await db
      .update(quotationSuppliers)
      .set(updateData)
      .where(eq(quotationSuppliers.token, token));

    return NextResponse.json({ success: true, message: 'Proposta enviada com sucesso!' });
  } catch (error) {
    console.error('❌ [API Responder] Erro crítico:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar resposta da cotação.' }, { status: 500 });
  }
}