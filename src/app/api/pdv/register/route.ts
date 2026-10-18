import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { cashRegisters, cashRegisterTransactions, sales } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID não informado.' }, { status: 400 });
    }

    const [activeRegister] = await db
      .select()
      .from(cashRegisters)
      .where(and(eq(cashRegisters.companyId, companyId), eq(cashRegisters.status, 'OPEN')))
      .limit(1);

    if (!activeRegister) {
      return NextResponse.json({ isOpen: false });
    }

    // Buscar transações e vendas do turno
    const transactions = await db
      .select()
      .from(cashRegisterTransactions)
      .where(eq(cashRegisterTransactions.cashRegisterId, activeRegister.id));

    const registerSales = await db
      .select()
      .from(sales)
      .where(eq(sales.cashRegisterId, activeRegister.id));

    return NextResponse.json({
      isOpen: true,
      register: activeRegister,
      transactions,
      sales: registerSales, // Incluído para alimentar o extrato cronológico
      salesCount: registerSales.length,
    });
  } catch (error) {
    console.error('Erro ao buscar status do caixa:', error);
    return NextResponse.json({ error: 'Erro interno ao consultar caixa.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, action, amount, reason, operatorName, userId, closingAmount } = body;

    if (!companyId || !action) {
      return NextResponse.json({ error: 'Dados insuficientes.' }, { status: 400 });
    }

    if (action === 'OPEN') {
      const [existing] = await db
        .select()
        .from(cashRegisters)
        .where(and(eq(cashRegisters.companyId, companyId), eq(cashRegisters.status, 'OPEN')))
        .limit(1);

      if (existing) {
        return NextResponse.json({ error: 'Já existe um caixa aberto para esta empresa.' }, { status: 400 });
      }

      const registerId = crypto.randomUUID();
      const openingVal = Number(amount || 0);

      await db.insert(cashRegisters).values({
        id: registerId,
        companyId,
        userId: userId || 'system',
        operatorName: operatorName || 'Operador',
        openingAmount: String(openingVal),
        status: 'OPEN',
      });

      await db.insert(cashRegisterTransactions).values({
        id: crypto.randomUUID(),
        companyId,
        cashRegisterId: registerId,
        type: 'OPENING',
        amount: String(openingVal),
        reason: 'Fundo de troco inicial',
        operatorName: operatorName || 'Operador',
      });

      return NextResponse.json({ success: true, registerId });
    }

    const [activeRegister] = await db
      .select()
      .from(cashRegisters)
      .where(and(eq(cashRegisters.companyId, companyId), eq(cashRegisters.status, 'OPEN')))
      .limit(1);

    if (!activeRegister) {
      return NextResponse.json({ error: 'Nenhum caixa aberto encontrado.' }, { status: 400 });
    }

    if (action === 'SUPPLY' || action === 'BLEED') {
      const val = Number(amount || 0);
      if (val <= 0) {
        return NextResponse.json({ error: 'Valor inválido.' }, { status: 400 });
      }

      await db.insert(cashRegisterTransactions).values({
        id: crypto.randomUUID(),
        companyId,
        cashRegisterId: activeRegister.id,
        type: action,
        amount: String(val),
        reason: reason || (action === 'SUPPLY' ? 'Suprimento de caixa' : 'Sangria de segurança'),
        operatorName: operatorName || 'Operador',
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'CLOSE') {
      const counted = Number(closingAmount || 0);

      const transactions = await db
        .select()
        .from(cashRegisterTransactions)
        .where(eq(cashRegisterTransactions.cashRegisterId, activeRegister.id));

      let expected = Number(activeRegister.openingAmount);
      for (const tx of transactions) {
        if (tx.type === 'SUPPLY') expected += Number(tx.amount);
        if (tx.type === 'BLEED') expected -= Number(tx.amount);
      }

      const registerSales = await db
        .select()
        .from(sales)
        .where(eq(sales.cashRegisterId, activeRegister.id));

      const cashSales = registerSales
        .filter((s) => s.paymentMethod === 'CASH')
        .reduce((acc, s) => acc + Number(s.total), 0);

      expected += cashSales;
      const difference = counted - expected;

      await db.update(cashRegisters)
        .set({
          closingAmount: String(counted),
          differenceAmount: String(difference),
          status: 'CLOSED',
          closedAt: new Date(),
        })
        .where(eq(cashRegisters.id, activeRegister.id));

      return NextResponse.json({
        success: true,
        summary: { opening: activeRegister.openingAmount, cashSales, expected, counted, difference },
      });
    }

    return NextResponse.json({ error: 'Ação desconhecida.' }, { status: 400 });
  } catch (error) {
    console.error('Erro na operação de caixa:', error);
    return NextResponse.json({ error: 'Erro interno ao processar caixa.' }, { status: 500 });
  }
}