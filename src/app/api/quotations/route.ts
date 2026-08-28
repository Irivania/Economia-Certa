import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { quotations, quotationItems } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface QuotationItemInput {
  productId: string;
  supplierId: string;
  requestedQuantity?: number;
  unitPrice?: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'companyId é obrigatório' }, { status: 400 });
    }

    // Busca as cotações da empresa
    const quotationList = await db
      .select()
      .from(quotations)
      .where(eq(quotations.companyId, companyId));

    // Busca os itens de todas elas para montar no front-end
    const allItems = await db.select().from(quotationItems);

    const data = quotationList.map((q) => ({
      ...q,
      items: allItems.filter((item) => item.quotationId === q.id),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar cotações:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar cotações' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, title, items } = body;

    if (!companyId || !title) {
      return NextResponse.json({ error: 'companyId e title são obrigatórios' }, { status: 400 });
    }

    const [newQuotation] = await db.insert(quotations).values({
      companyId,
      title,
      status: 'OPEN',
    }).returning();

    if (items && Array.isArray(items) && items.length > 0) {
      const itemsToInsert = items.map((item: QuotationItemInput) => ({
        quotationId: newQuotation.id,
        productId: item.productId,
        supplierId: item.supplierId,
        requestedQuantity: String(item.requestedQuantity || 1),
        unitPrice: String(item.unitPrice || 0),
      }));

      await db.insert(quotationItems).values(itemsToInsert);
    }

    return NextResponse.json({ 
      success: true, 
      quotationId: newQuotation.id,
      message: 'Cotação criada com sucesso!' 
    });
  } catch (error) {
    console.error('Erro ao criar cotação:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar cotação' }, { status: 500 });
  }
}