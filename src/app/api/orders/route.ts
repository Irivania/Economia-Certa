import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { quotations, quotationItems, products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { quotationId, companyId } = await request.json();

    if (!quotationId || !companyId) {
      return NextResponse.json({ error: 'quotationId e companyId são obrigatórios' }, { status: 400 });
    }

    // Busca os itens da cotação
    const items = await db
      .select()
      .from(quotationItems)
      .where(eq(quotationItems.quotationId, quotationId));

    if (items.length === 0) {
      return NextResponse.json({ error: 'A cotação não possui itens para gerar pedido.' }, { status: 400 });
    }

    // Validação ou iteração dos produtos correspondentes se necessário
    for (const item of items) {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId));

      if (product) {
        // Lógica de estoque ou manipulação adicional por item
      }
    }

    // Atualiza status da cotação para APROVADA
    await db
      .update(quotations)
      .set({ status: 'APPROVED' })
      .where(eq(quotations.id, quotationId));

    return NextResponse.json({ 
      success: true, 
      message: 'Pedido de compra gerado e status atualizado com sucesso!' 
    });
  } catch (error) {
    console.error('Erro ao gerar pedido de compra:', error);
    return NextResponse.json({ error: 'Erro interno ao gerar pedido' }, { status: 500 });
  }
}