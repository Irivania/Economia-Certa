import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { sales, accountsPayable, accountsReceivable } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const month = searchParams.get('month'); // Formato "YYYY-MM" (ex: "2026-10")

    if (!companyId || !month) {
      return NextResponse.json({ error: 'Company ID e mês de competência são obrigatórios.' }, { status: 400 });
    }

    // Definir o intervalo de datas como objetos Date para o Drizzle ORM
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const [year, m] = month.split('-').map(Number);
    const lastDay = new Date(year, m, 0).getDate();
    const endDate = new Date(`${month}-${lastDay}T23:59:59.999Z`);

    // 1. Buscar vendas concluídas no período
    const periodSales = await db
      .select()
      .from(sales)
      .where(
        and(
          eq(sales.companyId, companyId),
          eq(sales.status, 'COMPLETED'),
          gte(sales.createdAt, startDate),
          lte(sales.createdAt, endDate)
        )
      );

    let totalRevenuePeriod = 0;
    periodSales.forEach((s) => {
      totalRevenuePeriod += Number(s.total || 0);
    });

    // 2. Buscar Contas a Pagar
    const periodPayables = await db
      .select()
      .from(accountsPayable)
      .where(eq(accountsPayable.companyId, companyId));

    // 3. Buscar Contas a Receber
    const periodReceivables = await db
      .select()
      .from(accountsReceivable)
      .where(eq(accountsReceivable.companyId, companyId));

    return NextResponse.json({
      success: true,
      competenceMonth: month,
      summary: {
        totalSalesCount: periodSales.length,
        totalRevenuePeriod,
        totalPayablesCount: periodPayables.length,
        totalReceivablesCount: periodReceivables.length,
      },
      sales: periodSales,
      payables: periodPayables,
      receivables: periodReceivables,
    });
  } catch (error) {
    console.error('Erro ao gerar exportação contábil:', error);
    return NextResponse.json({ error: 'Erro interno ao gerar dados contábeis.' }, { status: 500 });
  }
}