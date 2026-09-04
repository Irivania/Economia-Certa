import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotations, quotationItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) {
    return NextResponse.json({ error: 'companyId é obrigatório' }, { status: 400 });
  }

  let retries = 2;
  while (retries > 0) {
    try {
      const quotationList = await db
        .select()
        .from(quotations)
        .where(eq(quotations.companyId, companyId));

      const allItems = await db.select().from(quotationItems);

      const data = quotationList.map((q) => ({
        ...q,
        items: allItems.filter((item) => item.quotationId === q.id),
      }));

      return NextResponse.json(data);
    } catch (error: unknown) {
      const err = error as Error;
      console.warn(`Tentativa falhou (${retries} restantes). Erro:`, err.message);
      retries--;
      if (retries === 0) {
        console.error('Erro ao buscar cotações:', err);
        return NextResponse.json([]);
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return NextResponse.json([]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const companyId = String(body.companyId || '');
    const title = String(body.title || '');
    const supplierIds = body.supplierIds;
    const startDate = body.startDate || null;
    const endDate = body.endDate || null;
    const closingTime = body.closingTime || null;
    const items = body.items;

    if (!companyId || !title) {
      return NextResponse.json({ error: 'companyId e title são obrigatórios' }, { status: 400 });
    }

    if (!supplierIds || !Array.isArray(supplierIds) || supplierIds.length === 0) {
      return NextResponse.json({ error: 'Selecione ao menos um fornecedor.' }, { status: 400 });
    }

    const storeName = 'Melo Perfumaria';
    const createdQuotations = [];

    for (const supplierId of supplierIds) {
      const quotationId = crypto.randomUUID();
      const token = crypto.randomUUID();

      const insertValues = {
        id: quotationId,
        companyId,
        title,
        supplierId,
        storeName,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        closingTime,
        token,
        status: 'OPEN',
      };

      const [newQuotation] = await db.insert(quotations).values(insertValues).returning();

      if (items && Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          const itemValues = {
            id: crypto.randomUUID(),
            quotationId: newQuotation.id,
            productId: String(item.id || item.productId || ''),
            supplierId: String(supplierId),
            requestedQuantity: String(item.requestedQuantity || 1),
            price: String(item.costPrice || item.unitPrice || 0),
          };

          await db.insert(quotationItems).values(itemValues);
        }
      }

      createdQuotations.push({ quotationId, token, supplierId });
    }

    return NextResponse.json({ 
      success: true, 
      createdQuotations,
      message: 'Cotações criadas e enviadas com sucesso para os fornecedores!' 
    });
  } catch (error) {
    console.error('Erro ao criar cotação:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar cotação' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = String(body.id || '');
    const companyId = String(body.companyId || '');
    const title = String(body.title || '').trim();
    const supplierId = String(body.supplierId || '');
    const startDate = body.startDate || null;
    const endDate = body.endDate || null;
    const closingTime = body.closingTime || null;

    if (!id || !companyId || !title || !supplierId) {
      return NextResponse.json(
        { error: 'id, companyId, title e supplierId são obrigatórios' },
        { status: 400 },
      );
    }

    const [updatedQuotation] = await db
      .update(quotations)
      .set({
        title,
        supplierId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        closingTime,
      })
      .where(and(eq(quotations.id, id), eq(quotations.companyId, companyId)))
      .returning();

    if (!updatedQuotation) {
      return NextResponse.json({ error: 'Cotação não encontrada' }, { status: 404 });
    }

    return NextResponse.json(updatedQuotation);
  } catch (error) {
    console.error('Erro ao atualizar cotação:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar cotação' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const companyId = searchParams.get('companyId');

    if (!id || !companyId) {
      return NextResponse.json({ error: 'id e companyId são obrigatórios' }, { status: 400 });
    }

    // Remove os itens vinculados à cotação primeiro para manter a integridade referencial
    await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));

    // Remove a cotação correspondente
    await db
      .delete(quotations)
      .where(and(eq(quotations.id, id), eq(quotations.companyId, companyId)));

    return NextResponse.json({ success: true, message: 'Cotação excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir cotação:', error);
    return NextResponse.json({ error: 'Erro interno ao excluir cotação' }, { status: 500 });
  }
}