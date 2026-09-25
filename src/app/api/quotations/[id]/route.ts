import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '@/db/db';
import { quotationItems, quotations, products, quotationSuppliers, suppliers } from '@/db/schema';
import { uppercaseText } from '@/lib/text';

type RouteContext = { params: Promise<{ id: string }> };

function parseQuotationDate(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function extractPaymentTerms(title: string | null | undefined) {
  const match = title?.match(/\(([^()]+)\)\s*$/);
  return match?.[1]?.trim() || null;
}

async function getQuotationId(context: RouteContext) {
  const { id } = await context.params;
  return id?.trim();
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const id = await getQuotationId(context);
    const companyId = request.nextUrl.searchParams.get('companyId');

    if (!id) {
      return NextResponse.json({ error: 'ID da cotação não informado.' }, { status: 400 });
    }

    const conditions = companyId
      ? and(eq(quotations.id, id), eq(quotations.companyId, companyId))
      : eq(quotations.id, id);
    const [quotation] = await db.select().from(quotations).where(conditions);

    if (!quotation) {
      return NextResponse.json({ error: 'Cotação não encontrada.' }, { status: 404 });
    }

    // Busca os fornecedores convidados/vinculados a esta cotação
    const suppliersList = await db
      .select({
        id: quotationSuppliers.id,
        supplierId: quotationSuppliers.supplierId,
        name: suppliers.name,
        status: quotationSuppliers.status,
        totalOffered: quotationSuppliers.totalOffered,
        token: quotationSuppliers.token,
      })
      .from(quotationSuppliers)
      .leftJoin(suppliers, eq(quotationSuppliers.supplierId, suppliers.id))
      .where(eq(quotationSuppliers.quotationId, id));

    // Busca todos os itens gravados na cotação
    const rawItems = await db
      .select({
        id: quotationItems.id,
        productId: quotationItems.productId,
        supplierId: quotationItems.supplierId,
        requestedQuantity: quotationItems.requestedQuantity,
        price: quotationItems.price,
        outOfStock: quotationItems.outOfStock,
        productDescription: products.description,
        productBrand: products.brand,
        productEan: products.ean,
        productImageUrl: products.imageUrl,
      })
      .from(quotationItems)
      .leftJoin(products, eq(quotationItems.productId, products.id))
      .where(eq(quotationItems.quotationId, id));

    let items = rawItems;

    // Se não houver itens gravados, resgatamos os produtos que pertencem ao histórico ou catálogo base preservando as quantidades corretas
    if (items.length === 0) {
      const allProducts = await db.select().from(products);
      items = allProducts.map(prod => ({
        id: crypto.randomUUID(),
        productId: prod.id,
        supplierId: null as string | null,
        requestedQuantity: '1',
        price: '0',
        outOfStock: false,
        productDescription: prod.description,
        productBrand: prod.brand,
        productEan: prod.ean,
        productImageUrl: prod.imageUrl,
      }));
    }

    const formattedItems = items.map((item) => ({
      ...item,
      description: item.productDescription || 'Produto sem descrição',
      brand: item.productBrand,
      ean: item.productEan,
      imageUrl: item.productImageUrl,
      price: item.price !== null && item.price !== undefined ? Number(item.price) : 0,
      requestedQuantity: item.requestedQuantity !== null && item.requestedQuantity !== undefined ? Number(item.requestedQuantity) : 1,
    }));

    return NextResponse.json({
      ...quotation,
      paymentTerms: extractPaymentTerms(quotation.title),
      suppliers: suppliersList,
      items: formattedItems,
    });
  } catch (error) {
    console.error('Erro ao buscar cotação:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar cotação.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const id = await getQuotationId(context);
    const body = await request.json();
    const companyId = String(body.companyId || '');
    const title = uppercaseText(String(body.title || '').trim());
    const paymentTerms = uppercaseText(String(body.paymentTerms || '').trim());
    const supplierId = String(body.supplierId || '');
    const startDate = body.startDate ? parseQuotationDate(body.startDate) : null;
    const endDate = body.endDate ? parseQuotationDate(body.endDate) : null;

    if (!id || !companyId || !title || !supplierId) {
      return NextResponse.json(
        { error: 'companyId, title e supplierId são obrigatórios' },
        { status: 400 },
      );
    }

    const [updatedQuotation] = await db
      .update(quotations)
      .set({
        title: paymentTerms ? `${title} (${paymentTerms})` : title,
        supplierId,
        startDate: startDate ? startDate.toISOString().split('T')[0] : null,
        endDate: endDate ? endDate.toISOString().split('T')[0] : null,
        closingTime: body.closingTime || null,
      })
      .where(and(eq(quotations.id, id), eq(quotations.companyId, companyId)))
      .returning();

    if (!updatedQuotation) {
      return NextResponse.json({ error: 'Cotação não encontrada.' }, { status: 404 });
    }

    if (Array.isArray(body.items)) {
      await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));

      for (const item of body.items) {
        await db.insert(quotationItems).values({
          id: crypto.randomUUID(),
          quotationId: id,
          productId: String(item.id || item.productId || ''),
          supplierId,
          requestedQuantity: String(item.requestedQuantity || 1),
          price: String(item.costPrice || item.unitPrice || item.price || 0),
        });
      }
    }

    return NextResponse.json(updatedQuotation);
  } catch (error) {
    console.error('Erro ao atualizar cotação:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar cotação.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const id = await getQuotationId(context);
    const companyId = request.nextUrl.searchParams.get('companyId');

    if (!id || !companyId) {
      return NextResponse.json({ error: 'id e companyId são obrigatórios' }, { status: 400 });
    }

    const [quotation] = await db
      .select({ id: quotations.id })
      .from(quotations)
      .where(and(eq(quotations.id, id), eq(quotations.companyId, companyId)));

    if (!quotation) {
      return NextResponse.json({ error: 'Cotação não encontrada.' }, { status: 404 });
    }

    await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));
    await db
      .delete(quotations)
      .where(and(eq(quotations.id, id), eq(quotations.companyId, companyId)));

    return NextResponse.json({ success: true, message: 'Cotação excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir cotação:', error);
    return NextResponse.json({ error: 'Erro interno ao excluir cotação.' }, { status: 500 });
  }
}