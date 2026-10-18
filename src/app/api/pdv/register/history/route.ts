import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { cashRegisters } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID não informado.' }, { status: 400 });
    }

    // Buscar todos os turnos de caixa ordenados do mais recente para o mais antigo
    const registers = await db
      .select()
      .from(cashRegisters)
      .where(eq(cashRegisters.companyId, companyId))
      .orderBy(desc(cashRegisters.openedAt));

    return NextResponse.json({ success: true, registers });
  } catch (error) {
    console.error('Erro ao buscar histórico de turnos:', error);
    return NextResponse.json({ error: 'Erro interno ao consultar histórico.' }, { status: 500 });
  }
}