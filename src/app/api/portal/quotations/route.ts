import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotationSuppliers, quotations, companies, quotationItems, products, suppliers } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

type QuotationItemPayload = {
  id: string;
  quotationId: string;
  productId: string;
  requestedQuantity: string;
  price: string | null;
  outOfStock: boolean | null;
  description: string | null;
  unit: string | null;
  ean: string | null;
  imageUrl: string | null;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');

    const query = db
      .select({
        quotationSupplierId: quotationSuppliers.id,
        quotationId: quotationSuppliers.quotationId,
        status: quotationSuppliers.status,
        totalOffered: quotationSuppliers.totalOffered,
        token: quotationSuppliers.token,
        title: quotations.title,
        startDate: quotations.startDate,
        endDate: quotations.endDate,
        closingTime: quotations.closingTime,
        companyId: quotations.companyId,
        brandId: quotations.brandId,
        storeName: quotations.storeName,
        companyName: companies.name,
        itemId: quotationItems.id,
        itemQuotationId: quotationItems.quotationId,
        itemProductId: quotationItems.productId,
        requestedQuantity: quotationItems.requestedQuantity,
        price: quotationItems.price,
        outOfStock: quotationItems.outOfStock,
        description: products.description,
        unit: products.unit,
        ean: products.ean,
        imageUrl: products.imageUrl,
      })
      .from(quotationSuppliers)
      .leftJoin(quotations, eq(quotationSuppliers.quotationId, quotations.id))
      .leftJoin(companies, eq(quotations.companyId, companies.id))
      .leftJoin(quotationItems, eq(quotations.id, quotationItems.quotationId))
      .leftJoin(products, eq(quotationItems.productId, products.id));

    let records;
    if (supplierId) {
      const [sessionSupplier] = await db
        .select({ email: suppliers.email })
        .from(suppliers)
        .where(eq(suppliers.id, supplierId));

      const supplierIds = sessionSupplier?.email
        ? (await db
            .select({ id: suppliers.id })
            .from(suppliers)
            .where(eq(suppliers.email, sessionSupplier.email)))
            .map((supplier) => supplier.id)
        : [supplierId];

      records = await query.where(inArray(quotationSuppliers.supplierId, supplierIds));
    } else {
      records = await query;
    }

    const groupedRecords = new Map<string, {
      quotationSupplierId: string;
      quotationId: string;
      status: string;
      totalOffered: number;
      token: string | null;
      title: string | null;
      startDate: string | null;
      endDate: string | null;
      closingTime: string | null;
      companyId: string | null;
      brandId: string | null;
      storeName: string | null;
      companyName: string;
      items: QuotationItemPayload[];
    }>();

    for (const record of records) {
      const existing = groupedRecords.get(record.quotationId);
      const quotation = existing ?? {
        quotationSupplierId: record.quotationSupplierId,
        quotationId: record.quotationId,
        status: record.status,
        totalOffered: Number(record.totalOffered || 0),
        token: record.token,
        title: record.title,
        startDate: record.startDate,
        endDate: record.endDate,
        closingTime: record.closingTime,
        companyId: record.companyId,
        brandId: record.brandId,
        storeName: record.storeName,
        companyName: record.companyName || 'Loja Parceira',
        items: [],
      };

      if (
        record.itemId &&
        record.itemQuotationId &&
        record.itemProductId &&
        record.requestedQuantity !== null &&
        !quotation.items.some((item) => item.id === record.itemId)
      ) {
        quotation.items.push({
          id: record.itemId,
          quotationId: record.itemQuotationId,
          productId: record.itemProductId,
          requestedQuantity: record.requestedQuantity,
          price: record.price,
          outOfStock: record.outOfStock,
          description: record.description,
          unit: record.unit,
          ean: record.ean,
          imageUrl: record.imageUrl,
        });
      }

      groupedRecords.set(record.quotationId, quotation);
    }

    const formattedRecords = Array.from(groupedRecords.values()).map((quotation) => ({
      ...quotation,
      totalOffered: quotation.totalOffered || quotation.items.reduce((total, item) => (
        item.outOfStock ? total : total + Number(item.price || 0) * Number(item.requestedQuantity || 1)
      ), 0),
    }));

    return NextResponse.json(formattedRecords);
  } catch (error) {
    console.error('Erro ao buscar cotações do portal:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar cotações.' }, { status: 500 });
  }
}