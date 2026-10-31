import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { cashRegisters } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, pause } = body;

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID não informado.' }, { status: 400 });
    }

    const [activeRegister] = await db
      .select()
      .from(cashRegisters)
      .where(
        and(
          eq(cashRegisters.companyId, companyId),
          or(eq(cashRegisters.status, 'OPEN'), eq(cashRegisters.status, 'PAUSED'))
        )
      )
      .limit(1);

    if (!activeRegister) {
      return NextResponse.json({ error: 'Nenhum turno de caixa encontrado.' }, { status: 400 });
    }

    const newStatus = pause ? 'PAUSED' : 'OPEN';
    
    const updateData = {
      status: newStatus,
      pausedAt: pause ? new Date() : null,
    };

    await db
      .update(cashRegisters)
      .set(updateData)
      .where(eq(cashRegisters.id, activeRegister.id));

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error('Erro ao processar pausa/retorno do caixa:', error);
    return NextResponse.json({ error: 'Erro interno ao processar estado do caixa.' }, { status: 500 });
  }
}