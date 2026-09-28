import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { quotations, companies, quotationSuppliers } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allQuotations = await db
      .select({
        quotationSupplierId: quotationSuppliers.id,
        quotationId: quotations.id,
        title: quotations.title,
        startDate: quotations.startDate,
        endDate: quotations.endDate,
        closingTime: quotations.closingTime,
        status: quotationSuppliers.status,
        token: quotationSuppliers.token,
        companyName: companies.name,
      })
      .from(quotations)
      .innerJoin(companies, eq(quotations.companyId, companies.id))
      .leftJoin(quotationSuppliers, eq(quotations.id, quotationSuppliers.quotationId))
      .orderBy(desc(quotations.startDate));

    // Se a base de dados estiver vazia, retorna uma cotação de exemplo para teste imediato no portal
    if (!allQuotations || allQuotations.length === 0) {
      return NextResponse.json([
        {
          quotationSupplierId: 'mock-sup-1',
          quotationId: '913e6817-104f-4f29-a8e2-fe7533c4d0eb',
          title: 'COTAÇÃO DE REPOSIÇÃO - SETEMBRO',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          closingTime: '23:59',
          status: 'PENDING',
          totalOffered: 0,
          token: '913e6817-104f-4f29-a8e2-fe7533c4d0eb',
          companyName: 'Melo Perfumaria',
        },
      ]);
    }

    const formatted = allQuotations.map((q) => ({
      quotationSupplierId: q.quotationSupplierId || `sup-${q.quotationId}`,
      quotationId: q.quotationId,
      title: q.title || 'Cotação de Reposição',
      startDate: q.startDate,
      endDate: q.endDate,
      closingTime: q.closingTime,
      status: q.status || 'PENDING',
      totalOffered: 0,
      token: q.token || q.quotationId,
      companyName: q.companyName || 'Melo Perfumaria',
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar cotações do portal:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar cotações.' }, { status: 500 });
  }
}