import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotationSuppliers, quotations, companies, quotationItems } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');

    // Constrói a consulta base filtrando estritamente pelo supplierId logado se fornecido
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
        companyName: companies.name,
      })
      .from(quotationSuppliers)
      .leftJoin(quotations, eq(quotationSuppliers.quotationId, quotations.id))
      .leftJoin(companies, eq(quotations.companyId, companies.id));

    const records = supplierId
      ? await query.where(eq(quotationSuppliers.supplierId, supplierId))
      : await query;

    const formattedRecords = [];
    for (const record of records) {
      let total = Number(record.totalOffered || 0);

      if (total === 0 && record.quotationId) {
        const items = await db
          .select()
          .from(quotationItems)
          .where(eq(quotationItems.quotationId, record.quotationId));

        for (const item of items) {
          if (!item.outOfStock) {
            const price = Number(item.price || 0);
            const qty = Number(item.requestedQuantity || 1);
            total += price * qty;
          }
        }
      }

      formattedRecords.push({
        ...record,
        companyName: record.companyName || 'Melo Perfumaria',
        totalOffered: total,
      });
    }

    return NextResponse.json(formattedRecords);
  } catch (error) {
    console.error('Erro ao buscar cotações do portal:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar cotações.' }, { status: 500 });
  }
}