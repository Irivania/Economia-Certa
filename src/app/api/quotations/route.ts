import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotations, quotationItems, quotationSuppliers, suppliers } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import crypto from 'crypto';
import { uppercaseText } from '@/lib/text';

function parseQuotationDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const datePart = value.trim().split('T')[0];
  const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return datePart;
}

function formatQuotationDate(value: Date | string | null | undefined) {
  if (!value) return '';

  if (typeof value === 'string') {
    const datePart = value.trim().split('T')[0];
    return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : '';
  }

  if (Number.isNaN(value.getTime())) return '';

  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, '0');
  const day = String(value.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseOptionalQuotationDate(body: Record<string, unknown>, field: string) {
  if (body[field] === undefined || body[field] === null || body[field] === '') {
    return null;
  }

  return parseQuotationDate(body[field]);
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

      const allItems = await db.select().from(quotationItems);
      const allSuppliersLinks = await db
        .select({
          id: quotationSuppliers.id,
          quotationId: quotationSuppliers.quotationId,
          supplierId: quotationSuppliers.supplierId,
          status: quotationSuppliers.status,
          token: quotationSuppliers.token,
          name: suppliers.name,
        })
        .from(quotationSuppliers)
        .leftJoin(suppliers, eq(quotationSuppliers.supplierId, suppliers.id));

      const data = quotationList.map((quotation) => ({
        ...quotation,
        paymentTerms: quotation.paymentTerms || '',
        startDate: formatQuotationDate(quotation.startDate),
        endDate: formatQuotationDate(quotation.endDate),
        items: allItems.filter((item) => item.quotationId === quotation.id),
        suppliers: allSuppliersLinks
          .filter((supplier) => supplier.quotationId === quotation.id)
          .map((supplier) => ({
            id: supplier.supplierId,
            name: supplier.name || 'Fornecedor',
            status: supplier.status,
            token: supplier.token,
          })),
      }));

      return NextResponse.json(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Tentativa falhou (${retries} restantes). Erro:`, message);
      retries--;

      if (retries === 0) {
        console.error('Erro ao buscar cotações:', error);
        return NextResponse.json({ error: 'Erro ao buscar cotações.' }, { status: 500 });
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return NextResponse.json([]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const companyId = String(body.companyId || '');
    const title = uppercaseText(String(body.title || '').trim());
    const paymentTerms = uppercaseText(String(body.paymentTerms || 'Boleto 28 Dias').trim());
    const supplierIds = body.supplierIds;
    const startDate = parseOptionalQuotationDate(body, 'startDate');
    const endDate = parseOptionalQuotationDate(body, 'endDate');
    const closingTime = body.closingTime ? String(body.closingTime) : null;
    const items = body.items;

    if (!companyId || !title) {
      return NextResponse.json({ error: 'companyId e title são obrigatórios' }, { status: 400 });
    }

    if (!supplierIds || !Array.isArray(supplierIds) || supplierIds.length === 0) {
      return NextResponse.json({ error: 'Selecione ao menos um fornecedor.' }, { status: 400 });
    }

    if (
      (body.startDate !== undefined && body.startDate !== null && body.startDate !== '' && !startDate) ||
      (body.endDate !== undefined && body.endDate !== null && body.endDate !== '' && !endDate)
    ) {
      return NextResponse.json({ error: 'As datas devem estar no formato YYYY-MM-DD.' }, { status: 400 });
    }

    const [newQuotation] = await db
      .insert(quotations)
      .values({
        id: crypto.randomUUID(),
        companyId,
        title,
        paymentTerms,
        storeName: 'Melo Perfumaria',
        startDate,
        endDate,
        closingTime,
        status: 'OPEN',
      })
      .returning();

    if (items && Array.isArray(items)) {
      for (const item of items) {
        const itemObj = item as Record<string, unknown>;
        const pId = String(itemObj.productId || itemObj.id || '');
        const qQty = Number(itemObj.requestedQuantity || itemObj.quantity || 0);

        if (!pId) continue;

        await db.insert(quotationItems).values({
          id: crypto.randomUUID(),
          quotationId: newQuotation.id,
          productId: pId,
          requestedQuantity: String(qQty),
          price: String(itemObj.costPrice || itemObj.unitPrice || 0),
        });
      }
    }

    const createdQuotations = [];
    for (const supplierId of supplierIds) {
      const supplierToken = crypto.randomUUID();
      await db.insert(quotationSuppliers).values({
        id: crypto.randomUUID(),
        quotationId: newQuotation.id,
        supplierId: String(supplierId),
        token: supplierToken,
        status: 'PENDING',
      });
      createdQuotations.push({ supplierId, token: supplierToken });
    }

    return NextResponse.json({
      success: true,
      quotationId: newQuotation.id,
      createdQuotations,
      message: 'Cotação unificada criada com tokens individuais para os fornecedores!',
    });
  } catch (error) {
    console.error('Erro ao criar cotação:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar cotação' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const id = String(body.id || '');
    const companyId = String(body.companyId || '');
    const title = uppercaseText(String(body.title || '').trim());
    const paymentTerms = uppercaseText(String(body.paymentTerms || '').trim());
    const supplierIds = body.supplierIds;
    const startDate = parseOptionalQuotationDate(body, 'startDate');
    const endDate = parseOptionalQuotationDate(body, 'endDate');
    const closingTime = body.closingTime ? String(body.closingTime) : null;
    const items = body.items;

    if (!id || !companyId || !title) {
      return NextResponse.json({ error: 'id, companyId e title são obrigatórios' }, { status: 400 });
    }

    if (
      (body.startDate !== undefined && body.startDate !== null && body.startDate !== '' && !startDate) ||
      (body.endDate !== undefined && body.endDate !== null && body.endDate !== '' && !endDate)
    ) {
      return NextResponse.json({ error: 'As datas devem estar no formato YYYY-MM-DD.' }, { status: 400 });
    }

    const [updatedQuotation] = await db
      .update(quotations)
      .set({
        title,
        paymentTerms,
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
        const itemObj = item as Record<string, unknown>;
        const pId = String(itemObj.productId || itemObj.id || '');
        const qQty = Number(itemObj.requestedQuantity || itemObj.quantity || 0);

        if (!pId) continue;

        await db.insert(quotationItems).values({
          id: crypto.randomUUID(),
          quotationId: id,
          productId: pId,
          requestedQuantity: String(qQty),
          price: String(itemObj.costPrice || itemObj.unitPrice || 0),
        });
      }
    }

    if (supplierIds && Array.isArray(supplierIds)) {
      const existingRelations = await db
        .select()
        .from(quotationSuppliers)
        .where(eq(quotationSuppliers.quotationId, id));
      const existingSupplierIds = existingRelations.map((relation) => relation.supplierId);

      for (const relation of existingRelations) {
        if (!supplierIds.includes(relation.supplierId)) {
          await db.delete(quotationSuppliers).where(eq(quotationSuppliers.id, relation.id));
        }
      }

      for (const supplierId of supplierIds) {
        if (!existingSupplierIds.includes(supplierId)) {
          await db.insert(quotationSuppliers).values({
            id: crypto.randomUUID(),
            quotationId: id,
            supplierId: String(supplierId),
            token: crypto.randomUUID(),
            status: 'PENDING',
          });
        }
      }
    }

    return NextResponse.json({ success: true, updatedQuotation });
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
    await db.delete(quotationSuppliers).where(eq(quotationSuppliers.quotationId, id));
    await db.delete(quotations).where(and(eq(quotations.id, id), eq(quotations.companyId, companyId)));

    return NextResponse.json({ success: true, message: 'Cotação excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir cotação:', error);
    return NextResponse.json({ error: 'Erro interno ao excluir cotação' }, { status: 500 });
  }
}