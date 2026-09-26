import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotations, quotationSuppliers, companies } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');

    if (!supplierId) {
      return NextResponse.json({ error: 'supplierId é obrigatório' }, { status: 400 });
    }

    // Busca todas as relações de cotação para este fornecedor, unindo com cotações e empresas lojistas
    const results = await db
      .select({
        quotationSupplierId: quotationSuppliers.id,
        quotationId: quotations.id,
        title: quotations.title,
        startDate: quotations.startDate,
        endDate: quotations.endDate,
        closingTime: quotations.closingTime,
        status: quotationSuppliers.status,
        totalOffered: quotationSuppliers.totalOffered,
        token: quotationSuppliers.token,
        companyName: companies.name,
      })
      .from(quotationSuppliers)
      .innerJoin(quotations, eq(quotationSuppliers.quotationId, quotations.id))
      .innerJoin(companies, eq(quotations.companyId, companies.id))
      .where(eq(quotationSuppliers.supplierId, supplierId));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Erro ao buscar cotações do fornecedor:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar cotações.' }, { status: 500 });
  }
}