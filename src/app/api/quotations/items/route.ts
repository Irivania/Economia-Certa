import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { quotationItems } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quotationId, productId, requestedQuantity } = body;

    // Campos obrigatórios ajustados para o modelo correto da tabela quotationItems
    if (!quotationId || !productId) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    const [newItem] = await db.insert(quotationItems).values({
      quotationId,
      productId,
      requestedQuantity: String(requestedQuantity || 1),
    }).returning();

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error('Erro ao adicionar item à cotação:', error);
    return NextResponse.json({ error: 'Erro interno ao adicionar item.' }, { status: 500 });
  }
}