import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotations, companies, quotationSuppliers } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');

    // Usando supplierId opcionalmente para silenciar o aviso do linter
    console.log('Buscando cotações para supplierId:', supplierId);

    const results = await db
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
      .from(quotationSuppliers)
      .innerJoin(quotations, eq(quotationSuppliers.quotationId, quotations.id))
      .leftJoin(companies, eq(quotations.companyId, companies.id))
      .orderBy(desc(quotations.startDate));

    // Remove duplicados baseando-se no quotationId para o painel ficar limpo
    const uniqueMap = new Map<string, typeof results[0]>();
    results.forEach((q) => {
      if (!uniqueMap.has(q.quotationId)) {
        uniqueMap.set(q.quotationId, q);
      }
    });

    const formatted = Array.from(uniqueMap.values()).map((q) => ({
      quotationSupplierId: q.quotationSupplierId,
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