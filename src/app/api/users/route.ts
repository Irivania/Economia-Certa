import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { requireCompanySession } from '@/lib/authServer';

// Função auxiliar para gerar senha provisória aleatória (ex: Melo-7892)
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = 'Melo-';
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function GET(request: NextRequest) {
  try {
    const session = requireCompanySession(request);
    const companyId = session.companyId;

    const data = await db
      .select({
        id: users.id,
        companyId: users.companyId,
        name: users.name,
        email: users.email,
        role: users.role,
        active: users.active,
      })
      .from(users)
      .where(eq(users.companyId, companyId));

    return NextResponse.json(
      data.map((user) => ({
        ...user,
        status: user.active ? 'ativo' : 'pausado',
      })),
    );
  } catch (error) {
    console.error('Erro ao buscar utilizadores:', error);
    return NextResponse.json({ error: 'Acesso não autorizado ou sessão inválida' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = requireCompanySession(request);
    
    // 🔒 Proteção RBAC: Apenas administradores podem criar utilizadores
    if (session.role && session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem cadastrar utilizadores.' },
        { status: 403 }
      );
    }

    const companyId = session.companyId;
    const body = await request.json();
    const { name, email, role } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e e-mail são obrigatórios' },
        { status: 400 }
      );
    }

    const formattedEmail = String(email).trim().toLowerCase();

    const existing = await db
      .select()
      .from(users)
      .where(and(eq(users.companyId, companyId), eq(users.email, formattedEmail)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Já existe um colaborador cadastrado com este e-mail nesta empresa.' },
        { status: 400 }
      );
    }

    // Gera senha aleatória automática
    const rawPassword = generateRandomPassword();
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const newUser = await db
      .insert(users)
      .values({
        id: randomUUID(),
        companyId,
        name: String(name).trim(),
        email: formattedEmail,
        passwordHash,
        role: role || 'geral',
        active: true,
      })
      .returning({
        id: users.id,
        companyId: users.companyId,
        name: users.name,
        email: users.email,
        role: users.role,
        active: users.active,
      });

    return NextResponse.json(
      {
        ...newUser[0],
        status: newUser[0].active ? 'ativo' : 'pausado',
        tempPassword: rawPassword,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Erro ao cadastrar utilizador:', error);
    return NextResponse.json(
      { error: 'Erro interno ao cadastrar utilizador' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = requireCompanySession(request);
    
    // 🔒 Proteção RBAC: Apenas administradores podem editar/pausar/redefinir utilizadores
    if (session.role && session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem gerir utilizadores.' },
        { status: 403 }
      );
    }

    const companyId = session.companyId;
    const body = await request.json();
    const { id, name, email, role, active, resetPassword } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = String(name).trim();
    if (email) updateData.email = String(email).trim().toLowerCase();
    if (role) updateData.role = role;
    if (typeof active === 'boolean') updateData.active = active;

    let newTempPassword: string | undefined = undefined;

    if (resetPassword) {
      newTempPassword = generateRandomPassword();
      updateData.passwordHash = await bcrypt.hash(newTempPassword, 10);
    }

    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(and(eq(users.id, id), eq(users.companyId, companyId)))
      .returning({
        id: users.id,
        companyId: users.companyId,
        name: users.name,
        email: users.email,
        role: users.role,
        active: users.active,
      });

    if (updatedUser.length === 0) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      ...updatedUser[0],
      status: updatedUser[0].active ? 'ativo' : 'pausado',
      tempPassword: newTempPassword,
    });
  } catch (error) {
    console.error('Erro ao atualizar utilizador:', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar utilizador' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = requireCompanySession(request);
    
    // 🔒 Proteção RBAC: Apenas administradores podem remover utilizadores
    if (session.role && session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem remover utilizadores.' },
        { status: 403 }
      );
    }

    const companyId = session.companyId;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
    }

    await db
      .delete(users)
      .where(and(eq(users.id, id), eq(users.companyId, companyId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir utilizador:', error);
    return NextResponse.json(
      { error: 'Erro interno ao excluir utilizador' },
      { status: 500 }
    );
  }
}