import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotations, quotationItems, suppliers } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import crypto from 'crypto';
import { uppercaseText } from '@/lib/text';

function parseQuotationDate(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

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

      const quotationDateRows = await db.execute(sql`
        SELECT id, start_date, end_date
        FROM quotations
        WHERE company_id = ${companyId}
      `);
      const quotationDates = new Map(
        quotationDateRows.rows.map((row) => [
          String(row.id),
          {
            startDate: row.start_date,
            endDate: row.end_date,
          },
        ]),
      );

      const allItems = await db.select().from(quotationItems);
      const supplierList = await db
        .select({ id: suppliers.id, name: suppliers.name })
        .from(suppliers)
        .where(eq(suppliers.companyId, companyId));
      const supplierNames = new Map(supplierList.map((supplier) => [supplier.id, supplier.name]));

      const data = quotationList.map((q) => {
        const storedDates = quotationDates.get(q.id);
        let safeStartDate = '';
        let safeEndDate = '';

        if (storedDates?.startDate) {
          const d = new Date(storedDates.startDate as string | Date);
          if (!isNaN(d.getTime())) {
            safeStartDate = d.toISOString().split('T')[0];
          }
        }

        if (storedDates?.endDate) {
          const d = new Date(storedDates.endDate as string | Date);
          if (!isNaN(d.getTime())) {
            safeEndDate = d.toISOString().split('T')[0];
          }
        }

        return {
          ...q,
          supplierName: q.supplierId ? supplierNames.get(q.supplierId) || 'Fornecedor não encontrado' : 'Não informado',
          startDate: safeStartDate,
          endDate: safeEndDate,
          items: allItems.filter((item) => item.quotationId === q.id),
        };
      });

      return NextResponse.json(data);
    } catch (error: unknown) {
      const err = error as Error;
      console.warn(`Tentativa falhou (${retries} restantes). Erro:`, err.message);
      retries--;
      if (retries === 0) {
        console.error('Erro ao buscar cotações:', err);
        return NextResponse.json({ error: 'Erro ao buscar cotações.' }, { status: 500 });
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
    const title = uppercaseText(String(body.title || '').trim());
    const paymentTerms = uppercaseText(String(body.paymentTerms || 'Boleto 28 Dias').trim());
    const supplierIds = body.supplierIds;
    const startDate = body.startDate ? parseQuotationDate(body.startDate) : null;
    const endDate = body.endDate ? parseQuotationDate(body.endDate) : null;
    const closingTime = body.closingTime || null;
    const items = body.items;

    if (!companyId || !title) {
      return NextResponse.json({ error: 'companyId e title são obrigatórios' }, { status: 400 });
    }

    if (!supplierIds || !Array.isArray(supplierIds) || supplierIds.length === 0) {
      return NextResponse.json({ error: 'Selecione ao menos um fornecedor.' }, { status: 400 });
    }

    if ((body.startDate && !startDate) || (body.endDate && !endDate)) {
      return NextResponse.json({ error: 'As datas devem estar no formato YYYY-MM-DD.' }, { status: 400 });
    }

    const storeName = 'Melo Perfumaria';
    const createdQuotations = [];
    const fullTitle = paymentTerms ? `${title} (${paymentTerms})` : title;

    for (const supplierId of supplierIds) {
      const quotationId = crypto.randomUUID();
      const token = crypto.randomUUID();

      const insertValues = {
        id: quotationId,
        companyId,
        title: fullTitle,
        supplierId,
        storeName,
        startDate,
        endDate,
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
    const title = uppercaseText(String(body.title || '').trim());
    const paymentTerms = uppercaseText(String(body.paymentTerms || '').trim());
    const supplierId = String(body.supplierId || '');
    const startDate = body.startDate ? parseQuotationDate(body.startDate) : null;
    const endDate = body.endDate ? parseQuotationDate(body.endDate) : null;
    const closingTime = body.closingTime || null;
    const items = body.items;

    if (!id || !companyId || !title || !supplierId) {
      return NextResponse.json(
        { error: 'id, companyId, title e supplierId são obrigatórios' },
        { status: 400 },
      );
    }

    if ((body.startDate && !startDate) || (body.endDate && !endDate)) {
      return NextResponse.json({ error: 'As datas devem estar no formato YYYY-MM-DD.' }, { status: 400 });
    }

    const fullTitle = paymentTerms ? `${title} (${paymentTerms})` : title;

    const [updatedQuotation] = await db
      .update(quotations)
      .set({
        title: fullTitle,
        supplierId,
        startDate,
        endDate,
        closingTime,
      })
      .where(and(eq(quotations.id, id), eq(quotations.companyId, companyId)))
      .returning();

    if (!updatedQuotation) {
      return NextResponse.json({ error: 'Cotação não encontrada' }, { status: 404 });
    }

    if (items && Array.isArray(items)) {
      await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));

      for (const item of items) {
        const itemValues = {
          id: crypto.randomUUID(),
          quotationId: id,
          productId: String(item.id || item.productId || ''),
          supplierId: String(supplierId),
          requestedQuantity: String(item.requestedQuantity || 1),
          price: String(item.costPrice || item.unitPrice || 0),
        };

        await db.insert(quotationItems).values(itemValues);
      }
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

    await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));

    await db
      .delete(quotations)
      .where(and(eq(quotations.id, id), eq(quotations.companyId, companyId)));

    return NextResponse.json({ success: true, message: 'Cotação excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir cotação:', error);
    return NextResponse.json({ error: 'Erro interno ao excluir cotação' }, { status: 500 });
  }
}