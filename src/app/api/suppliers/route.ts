import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { suppliers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { uppercaseText } from '@/lib/text';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'companyId é obrigatório' }, { status: 400 });
    }

    const data = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.companyId, companyId));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, name, contactPerson, phone, email } = body;

    if (!companyId || !name) {
      return NextResponse.json(
        { error: 'companyId e name são obrigatórios' },
        { status: 400 }
      );
    }

    const formattedName = uppercaseText(String(name).trim());
    const formattedContact = contactPerson ? uppercaseText(String(contactPerson).trim()) : null;
    const formattedEmail = email ? email.trim().toLowerCase() : null;
    const formattedPhone = phone ? phone.trim() : null;

    const newSupplier = await db
      .insert(suppliers)
      .values({
        id: randomUUID(),
        companyId,
        name: formattedName,
        contactPerson: formattedContact,
        phone: formattedPhone,
        email: formattedEmail,
      })
      .returning();

    return NextResponse.json(newSupplier[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar fornecedor:', error);
    return NextResponse.json(
      { error: 'Erro interno ao cadastrar fornecedor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, companyId, name, contactPerson, phone, email } = body;

    if (!id || !companyId || !name) {
      return NextResponse.json(
        { error: 'id, companyId e name são obrigatórios' },
        { status: 400 }
      );
    }

    const formattedName = uppercaseText(String(name).trim());
    const formattedContact = contactPerson ? uppercaseText(String(contactPerson).trim()) : null;
    const formattedEmail = email ? email.trim().toLowerCase() : null;
    const formattedPhone = phone ? phone.trim() : null;

    const updated = await db
      .update(suppliers)
      .set({
        name: formattedName,
        contactPerson: formattedContact,
        phone: formattedPhone,
        email: formattedEmail,
      })
      .where(and(eq(suppliers.id, id), eq(suppliers.companyId, companyId)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Fornecedor não encontrado' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar fornecedor' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const companyId = searchParams.get('companyId');

    if (!id || !companyId) {
      return NextResponse.json({ error: 'id e companyId são obrigatórios' }, { status: 400 });
    }

    await db
      .delete(suppliers)
      .where(and(eq(suppliers.id, id), eq(suppliers.companyId, companyId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir fornecedor:', error);
    return NextResponse.json({ error: 'Erro interno ao excluir fornecedor' }, { status: 500 });
  }
}