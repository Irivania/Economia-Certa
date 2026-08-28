import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { quotationItems } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quotationId, productId, supplierId, requestedQuantity, unitPrice } = body;

    if (!quotationId || !productId || !supplierId) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    const [newItem] = await db.insert(quotationItems).values({
      quotationId,
      productId,
      supplierId,
      requestedQuantity: String(requestedQuantity || 1),
      unitPrice: String(unitPrice || 0),
    }).returning();

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error('Erro ao adicionar item à cotação:', error);
    return NextResponse.json({ error: 'Erro interno ao adicionar item.' }, { status: 500 });
  }
}