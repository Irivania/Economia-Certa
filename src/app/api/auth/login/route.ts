import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { companies, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

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

    const valid = account?.passwordHash
      ? await bcrypt.compare(password, account.passwordHash)
      : false;

    if (!account || !valid || !account.userId) {
      return NextResponse.json({ error: 'Credenciais inválidas ou acesso não autorizado.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      session: {
        userId: account.userId,
        companyId: account.companyId,
        name: account.companyName || account.userName,
        tradeName: account.tradeName || '',
        email: account.userEmail,
        role: account.role || 'ADMIN',
      },
    });
  } catch (error) {
    console.error('[Company Login Error]:', error);
    return NextResponse.json({ error: 'Não foi possível processar o login.' }, { status: 500 });
  }
}
