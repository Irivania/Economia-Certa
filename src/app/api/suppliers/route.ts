import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { suppliers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { uppercaseText } from '@/lib/text';
import { requireCompanySession } from '@/lib/authServer';

export async function GET(request: NextRequest) {
  try {
    // 1. Validação estrita da sessão no servidor (Elimina IDOR)
    const session = requireCompanySession(request);
    const companyId = session.companyId;

    const data = await db
      .select({
        id: suppliers.id,
        companyId: suppliers.companyId,
        name: suppliers.name,
        contactPerson: suppliers.contactPerson,
        phone: suppliers.phone,
        email: suppliers.email,
        // Nunca expor passwordHash nas listagens!
      })
      .from(suppliers)
      .where(eq(suppliers.companyId, companyId));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    return NextResponse.json({ error: 'Acesso não autorizado ou sessão inválida' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validação estrita da sessão no servidor
    const session = requireCompanySession(request);
    const companyId = session.companyId;

    const body = await request.json();
    const { name, contactPerson, phone, email, password } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'O nome do fornecedor é obrigatório' },
        { status: 400 }
      );
    }

    const formattedName = uppercaseText(String(name).trim());
    const formattedContact = contactPerson ? uppercaseText(String(contactPerson).trim()) : null;
    const formattedEmail = email ? email.trim().toLowerCase() : null;
    const formattedPhone = phone ? phone.trim() : null;
    const passwordHash = password ? String(password).trim() : null; // Idealmente com hash bcrypt em produção

    const newSupplier = await db
      .insert(suppliers)
      .values({
        id: randomUUID(),
        companyId, // Derivado do servidor com segurança
        name: formattedName,
        contactPerson: formattedContact,
        phone: formattedPhone,
        email: formattedEmail,
        passwordHash,
      })
      .returning({
        id: suppliers.id,
        companyId: suppliers.companyId,
        name: suppliers.name,
        contactPerson: suppliers.contactPerson,
        phone: suppliers.phone,
        email: suppliers.email,
      });

    return NextResponse.json(newSupplier[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar fornecedor:', error);
    return NextResponse.json(
      { error: 'Erro interno ao cadastrar fornecedor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 1. Validação estrita da sessão no servidor
    const session = requireCompanySession(request);
    const companyId = session.companyId;

    const body = await request.json();
    const { id, name, contactPerson, phone, email, password } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: 'id e name são obrigatórios' },
        { status: 400 }
      );
    }

    const formattedName = uppercaseText(String(name).trim());
    const formattedContact = contactPerson ? uppercaseText(String(contactPerson).trim()) : null;
    const formattedEmail = email ? email.trim().toLowerCase() : null;
    const formattedPhone = phone ? phone.trim() : null;

    const updateData: Record<string, string | null> = {
      name: formattedName,
      contactPerson: formattedContact,
      phone: formattedPhone,
      email: formattedEmail,
    };

    if (password && String(password).trim() !== '') {
      updateData.passwordHash = String(password).trim();
    }

    const updated = await db
      .update(suppliers)
      .set(updateData)
      .where(and(eq(suppliers.id, id), eq(suppliers.companyId, companyId)))
      .returning({
        id: suppliers.id,
        companyId: suppliers.companyId,
        name: suppliers.name,
        contactPerson: suppliers.contactPerson,
        phone: suppliers.phone,
        email: suppliers.email,
      });

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Fornecedor não encontrado ou sem permissão' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar fornecedor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 1. Validação estrita da sessão no servidor
    const session = requireCompanySession(request);
    const companyId = session.companyId;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
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