import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { accountsPayable } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const query = db.select().from(accountsPayable).orderBy(asc(accountsPayable.dueDate));

    const items = companyId 
      ? await query.where(eq(accountsPayable.companyId, companyId))
      : await query;

    return NextResponse.json(items);
  } catch (error) {
    console.error('Erro ao listar contas a pagar:', error);
    return NextResponse.json({ error: 'Erro interno ao carregar financeiro.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, supplierName, invoiceNumber, installmentNumber, amount, dueDate } = body;

    if (!supplierName || !amount || !dueDate || !companyId) {
      return NextResponse.json({ error: 'Preencha os campos obrigatórios do título.' }, { status: 400 });
    }

    const newId = crypto.randomUUID();

    await db.insert(accountsPayable).values({
      id: newId,
      companyId: String(companyId),
      supplierName: String(supplierName).trim().toUpperCase(),
      invoiceNumber: invoiceNumber ? String(invoiceNumber).trim() : null,
      installmentNumber: installmentNumber ? Number(installmentNumber) : 1,
      amount: String(amount),
      dueDate: String(dueDate),
      status: 'PENDING',
    });

    return NextResponse.json({ success: true, id: newId }, { status: 201 });
  } catch (error: unknown) {
    console.error('Erro ao cadastrar título a pagar:', error);
    const msg = error instanceof Error ? error.message : 'Erro interno.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action } = body; // action: 'pay' ou 'unpay'

    if (!id) {
      return NextResponse.json({ error: 'ID do título não fornecido.' }, { status: 400 });
    }

    const newStatus = action === 'pay' ? 'PAID' : 'PENDING';
    const paidTimestamp = action === 'pay' ? new Date() : null;

    await db
      .update(accountsPayable)
      .set({
        status: newStatus,
        paidAt: paidTimestamp,
      })
      .where(eq(accountsPayable.id, id));

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Erro ao atualizar status do título:', error);
    const msg = error instanceof Error ? error.message : 'Erro interno.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}