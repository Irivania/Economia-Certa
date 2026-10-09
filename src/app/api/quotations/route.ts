import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotations, quotationItems, quotationSuppliers, suppliers } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import crypto from 'crypto';
import { uppercaseText } from '@/lib/text';
import { formatQuotationDate, parseOptionalQuotationDate } from '@/lib/quotationDates';
import { getActiveB2BSuppliers, saveQuotationItems, linkQuotationSuppliers } from '@/services/quotationService';
import { requireCompanySession } from '@/lib/authServer';

export async function GET(request: NextRequest) {
  try {
    // 1. Validação estrita da sessão no servidor (Elimina IDOR e dependência de query params)
    const session = requireCompanySession(request);
    const companyId = session.companyId;

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
  } catch (error) {
    console.error('Erro ao buscar cotações:', error);
    return NextResponse.json({ error: 'Acesso não autorizado ou sessão inválida.' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validação estrita da sessão no servidor
    const session = requireCompanySession(request);
    const companyId = session.companyId;

    const body = await request.json() as Record<string, unknown>;
    const title = uppercaseText(String(body.title || '').trim());
    const paymentTerms = uppercaseText(String(body.paymentTerms || 'Boleto 28 Dias').trim());
    const supplierIds = body.supplierIds;
    const startDate = parseOptionalQuotationDate(body, 'startDate');
    const endDate = parseOptionalQuotationDate(body, 'endDate');
    const closingTime = body.closingTime ? String(body.closingTime) : null;
    const items = body.items;

    if (!title) {
      return NextResponse.json({ error: 'O título da cotação é obrigatório' }, { status: 400 });
    }

    const connectedSupplierIds = await getActiveB2BSuppliers(companyId);
    const explicitSupplierIds = Array.isArray(supplierIds) ? supplierIds.map(String) : [];
    const combinedSupplierIds = Array.from(new Set([...explicitSupplierIds, ...connectedSupplierIds]));

    if (combinedSupplierIds.length === 0) {
      return NextResponse.json({ error: 'Selecione ao menos um fornecedor ou estabeleça parcerias B2B ativas.' }, { status: 400 });
    }

    const [newQuotation] = await db
      .insert(quotations)
      .values({
        id: crypto.randomUUID(),
        companyId, // Derivado de forma segura do servidor
        title,
        paymentTerms,
        storeName: 'Melo Perfumaria',
        startDate,
        endDate,
        closingTime,
        status: 'OPEN',
      })
      .returning();

    await saveQuotationItems(newQuotation.id, items as unknown[]);
    const createdQuotations = await linkQuotationSuppliers(newQuotation.id, combinedSupplierIds);

    return NextResponse.json({
      success: true,
      quotationId: newQuotation.id,
      createdQuotations,
      message: 'Cotação criada e sincronizada automaticamente com os parceiros B2B!',
    });
  } catch (error) {
    console.error('Erro ao criar cotação:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar cotação' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 1. Validação estrita da sessão no servidor
    const session = requireCompanySession(request);
    const companyId = session.companyId;

    const body = await request.json() as Record<string, unknown>;
    const id = String(body.id || '');
    const title = uppercaseText(String(body.title || '').trim());
    const paymentTerms = uppercaseText(String(body.paymentTerms || '').trim());
    const supplierIds = body.supplierIds;
    const startDate = parseOptionalQuotationDate(body, 'startDate');
    const endDate = parseOptionalQuotationDate(body, 'endDate');
    const closingTime = body.closingTime ? String(body.closingTime) : null;
    const items = body.items;

    if (!id || !title) {
      return NextResponse.json({ error: 'id e title são obrigatórios' }, { status: 400 });
    }

    // 2. Atualização garantindo ownership da empresa (Prevenção de IDOR)
    const [updatedQuotation] = await db
      .update(quotations)
      .set({ title, paymentTerms, startDate, endDate, closingTime })
      .where(and(eq(quotations.id, id), eq(quotations.companyId, companyId)))
      .returning();

    if (!updatedQuotation) {
      return NextResponse.json({ error: 'Cotação não encontrada ou sem permissão' }, { status: 404 });
    }

    if (items) {
      await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));
      await saveQuotationItems(id, items as unknown[]);
    }

    const connectedSupplierIds = await getActiveB2BSuppliers(companyId);
    const explicitSupplierIds = Array.isArray(supplierIds) ? supplierIds.map(String) : [];
    const combinedSupplierIds = Array.from(new Set([...explicitSupplierIds, ...connectedSupplierIds]));

    if (combinedSupplierIds.length > 0) {
      const existingRelations = await db.select().from(quotationSuppliers).where(eq(quotationSuppliers.quotationId, id));
      const existingSupplierIds = existingRelations.map((relation) => relation.supplierId);

      for (const relation of existingRelations) {
        if (!combinedSupplierIds.includes(relation.supplierId)) {
          await db.delete(quotationSuppliers).where(eq(quotationSuppliers.id, relation.id));
        }
      }

      for (const supplierId of combinedSupplierIds) {
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
    // 1. Validação estrita da sessão no servidor
    const session = requireCompanySession(request);
    const companyId = session.companyId;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
    }

    // 2. Exclusão restrita ao tenant validado (Prevenção de IDOR)
    await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));
    await db.delete(quotationSuppliers).where(eq(quotationSuppliers.quotationId, id));
    await db.delete(quotations).where(and(eq(quotations.id, id), eq(quotations.companyId, companyId)));

    return NextResponse.json({ success: true, message: 'Cotação excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir cotação:', error);
    return NextResponse.json({ error: 'Erro interno ao excluir cotação' }, { status: 500 });
  }
}