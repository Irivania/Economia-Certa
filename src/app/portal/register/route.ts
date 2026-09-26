import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { suppliers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim().toUpperCase();
    const representativeName = String(body.representativeName || '').trim().toUpperCase();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '').trim();
    const phone = String(body.phone || '').trim();
    const companyId = String(body.companyId || '915a8bc1-5db7-4605-93a9-b78090e75679').trim();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome da empresa, e-mail e palavra-passe são obrigatórios.' },
        { status: 400 },
      );
    }

    const [existingSupplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.email, email));

    if (existingSupplier) {
      return NextResponse.json(
        { error: 'Já existe um fornecedor registado com este e-mail.' },
        { status: 400 },
      );
    }

    const [newSupplier] = await db
      .insert(suppliers)
      .values({
        companyId,
        name,
        // Caso a sua tabela já tenha a coluna para o representante, adicione aqui. 
        // Se ainda não tiver a coluna na base de dados, pode concatenar ou guardar no campo correspondente.
        email,
        phone,
        passwordHash: password,
      })
      .returning({
        id: suppliers.id,
        name: suppliers.name,
        email: suppliers.email,
        phone: suppliers.phone,
      });

    return NextResponse.json({
      supplier: {
        ...newSupplier,
        representativeName, // Retorna na sessão para exibição no painel
      },
      message: 'Cadastro realizado com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao realizar cadastro do fornecedor:', error);
    return NextResponse.json(
      { error: 'Erro interno ao realizar cadastro.' },
      { status: 500 },
    );
  }
}