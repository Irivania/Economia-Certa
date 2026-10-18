import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { partners } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID não informado.' }, { status: 400 });
    }

    const items = await db
      .select()
      .from(partners)
      .where(eq(partners.companyId, companyId))
      .orderBy(asc(partners.name));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Erro ao listar parceiros/convênios:', error);
    return NextResponse.json({ error: 'Erro interno ao listar parceiros.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      type = 'EMPLOYEE', // 'EMPLOYEE' ou 'COMPANY_PARTNER'
      name,
      document,
      phone,
      email,
      creditLimit = 500,
      discountPercentage = 0,
      companyPartnerId, // ID da empresa mãe (caso seja funcionário)
    } = body;

    if (!companyId || !name || !name.trim()) {
      return NextResponse.json({ error: 'Empresa e Nome são obrigatórios.' }, { status: 400 });
    }

    if (type === 'EMPLOYEE' && !companyPartnerId) {
      return NextResponse.json({ error: 'Funcionário deve estar vinculado a uma Empresa Parceira.' }, { status: 400 });
    }

    const newId = crypto.randomUUID();

    await db.insert(partners).values({
      id: newId,
      companyId: String(companyId),
      type: String(type),
      name: String(name).trim().toUpperCase(),
      document: document ? String(document).trim() : null,
      phone: phone ? String(phone).trim() : null,
      email: email ? String(email).trim() : null,
      creditLimit: String(creditLimit),
      currentBalance: '0.00',
      discountPercentage: String(discountPercentage),
      companyPartnerId: companyPartnerId ? String(companyPartnerId) : null,
      active: true,
    });

    return NextResponse.json({ success: true, id: newId }, { status: 201 });
  } catch (error: unknown) {
    console.error('Erro ao cadastrar parceiro/convênio:', error);
    const msg = error instanceof Error ? error.message : 'Erro interno.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}