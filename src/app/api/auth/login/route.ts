import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { companies, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Hash dummy estático para equalizar o tempo de resposta contra Timing Attacks
const DUMMY_HASH = '$2a$10$1234567890123456789012uX/X.X.X.X.X.X.X.X.X.X.X.X.X.X';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email || !password) {
      return NextResponse.json({ error: 'Informe o e-mail e a senha.' }, { status: 400 });
    }

    const [account] = await db
      .select({
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
        passwordHash: users.passwordHash,
        role: users.role,
        companyId: users.companyId,
        companyName: companies.name,
        tradeName: companies.tradeName,
      })
      .from(users)
      .innerJoin(companies, eq(companies.id, users.companyId))
      .where(eq(users.email, email))
      .limit(1);

    // Se a conta não existir, comparamos contra um hash dummy para manter o tempo de resposta constante
    const hashToCompare = account?.passwordHash || DUMMY_HASH;
    const validPassword = await bcrypt.compare(password, hashToCompare);

    // Se a conta não foi encontrada ou a senha estiver errada, rejeitamos com mensagem genérica
    if (!account || !account.userId || !account.passwordHash || !validPassword) {
      return NextResponse.json(
        { error: 'Credenciais inválidas ou acesso não autorizado.' },
        { status: 401 }
      );
    }

    const session = {
      userId: account.userId,
      companyId: account.companyId,
      name: account.userName,
      tradeName: account.tradeName || account.companyName || '',
      email: account.userEmail,
      role: account.role || 'geral',
    };

    const response = NextResponse.json({
      success: true,
      session,
    });

    response.cookies.set('melo_company_session', JSON.stringify(session), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('[Company Login Error]:', error);
    return NextResponse.json({ error: 'Não foi possível processar o login.' }, { status: 500 });
  }
}