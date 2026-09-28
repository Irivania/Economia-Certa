import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { quotations, companies, quotationSuppliers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Busca todas as cotações ativas com leftJoin para nunca ocultar dados se faltar o supplier record
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
      .leftJoin(quotationSuppliers, eq(quotations.id, quotationSuppliers.quotationId));

    const formatted = allQuotations.map((q) => ({
      quotationSupplierId: q.quotationSupplierId || `sup-${q.quotationId}`,
      quotationId: q.quotationId,
      title: q.title || 'Cotação de Reposição',
      startDate: q.startDate,
      endDate: q.endDate,
      closingTime: q.closingTime,
      status: q.status || 'PENDING',
      totalOffered: 0,
      token: q.token || q.quotationId, // Garante que o token ou quotationId vai preenchido
      companyName: q.companyName || 'Melo Perfumaria',
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar cotações do portal:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar cotações.' }, { status: 500 });
  }
}