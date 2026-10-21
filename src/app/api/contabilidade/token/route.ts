import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { sales, accountsPayable, accountsReceivable } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const activeTokens = new Map<string, { companyId: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json();
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID obrigatório.' }, { status: 400 });
    }

    // Correção da sintaxe do token seguro
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = Date.now() + 15 * 24 * 60 * 60 * 1000;

    activeTokens.set(token, { companyId, expiresAt });

    const secureUrl = `${request.nextUrl.origin}/contador/${token}`;
    return NextResponse.json({ success: true, secureUrl, token });
  } catch (error) {
    console.error('Erro ao gerar token contábil:', error);
    return NextResponse.json({ error: 'Erro interno ao gerar link seguro.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);

    if (!token || !activeTokens.has(token)) {
      return NextResponse.json({ error: 'Link de acesso inválido ou expirado.' }, { status: 401 });
    }

    const tokenData = activeTokens.get(token)!;
    if (Date.now() > tokenData.expiresAt) {
      activeTokens.delete(token);
      return NextResponse.json({ error: 'Este link seguro expirou.' }, { status: 401 });
    }

    const companyId = tokenData.companyId;

    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const [year, m] = month.split('-').map(Number);
    const lastDay = new Date(year, m, 0).getDate();
    const endDate = new Date(`${month}-${lastDay}T23:59:59.999Z`);

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

    const periodPayables = await db.select().from(accountsPayable).where(eq(accountsPayable.companyId, companyId));
    const periodReceivables = await db.select().from(accountsReceivable).where(eq(accountsReceivable.companyId, companyId));

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
    console.error('Erro ao validar token contábil:', error);
    return NextResponse.json({ error: 'Erro interno ao carregar dados.' }, { status: 500 });
  }
}