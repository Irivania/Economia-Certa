import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { accountsPayable } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID não informado.' }, { status: 400 });
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Data daqui a 7 dias
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    // 1. Buscar boletos pendentes que vencem nos próximos 7 dias
    const upcomingPayables = await db
      .select()
      .from(accountsPayable)
      .where(
        and(
          eq(accountsPayable.companyId, companyId),
          eq(accountsPayable.status, 'PENDING'),
          gte(accountsPayable.dueDate, todayStr),
          lte(accountsPayable.dueDate, nextWeekStr)
        )
      );

    const totalPayable7Days = upcomingPayables.reduce(
      (acc, curr) => acc + Number(curr.amount || 0),
      0
    );

    // Simulação de Recebíveis / Vendas Estimadas para os próximos 7 dias (baseado no fluxo operacional ou média)
    // No futuro, pode ser ligado a uma tabela de faturamento ou PDV
    const estimatedReceivables7Days = 12500.00; 

    const projectedBalance = estimatedReceivables7Days - totalPayable7Days;

    return NextResponse.json({
      success: true,
      metrics: {
        totalPayable7Days,
        estimatedReceivables7Days,
        projectedBalance,
        upcomingCount: upcomingPayables.length,
      },
    });
  } catch (error: unknown) {
    console.error('Erro ao calcular fluxo de caixa:', error);
    const msg = error instanceof Error ? error.message : 'Erro interno.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}