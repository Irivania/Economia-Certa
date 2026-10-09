import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db/db';
import { users } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword } = body;

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    // Busca o utilizador na base de dados
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Utilizador não encontrado.' }, { status: 404 });
    }

    // Valida a senha atual (temporária) fornecida
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'A senha atual está incorreta.' }, { status: 401 });
    }

    // Encripta a nova senha definitiva escolhida pelo colaborador
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Atualiza a base de dados e limpa a obrigatoriedade de alteração
    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso! Pode prosseguir para o painel.',
    });
  } catch (error) {
    console.error('[Change Password Error]:', error);
    return NextResponse.json({ error: 'Erro interno ao alterar a senha.' }, { status: 500 });
  }
}