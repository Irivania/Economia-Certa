import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, email, password } = body;

    if (!companyId || !email) {
      return NextResponse.json({ error: 'Empresa e E-mail/Identificação são obrigatórios.' }, { status: 400 });
    }

    // Buscar operador na base de dados da empresa
    const [operator] = await db
      .select()
      .from(users)
      .where(and(eq(users.companyId, companyId), eq(users.email, email)))
      .limit(1);

    if (!operator || !operator.active) {
      return NextResponse.json({ error: 'Operador não encontrado ou inativo.' }, { status: 404 });
    }

    // Validação básica de senha (podes expandir para hash se necessário)
    if (operator.passwordHash && password && operator.passwordHash !== password) {
      return NextResponse.json({ error: 'Senha ou PIN incorreto.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      operator: {
        id: operator.id,
        name: operator.name,
        email: operator.email,
        role: operator.role,
      },
    });
  } catch (error) {
    console.error('Erro na autenticação do operador:', error);
    return NextResponse.json({ error: 'Erro interno ao autenticar operador.' }, { status: 500 });
  }
}