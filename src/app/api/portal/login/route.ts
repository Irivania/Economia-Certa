import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { suppliers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '').trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail e palavra-passe são obrigatórios.' },
        { status: 400 },
      );
    }

    // Procura o fornecedor pelo e-mail
    const [supplier] = await db
      .select({
        id: suppliers.id,
        name: suppliers.name,
        email: suppliers.email,
        phone: suppliers.phone,
        passwordHash: suppliers.passwordHash,
      })
      .from(suppliers)
      .where(eq(suppliers.email, email));

    if (!supplier) {
      return NextResponse.json(
        { error: 'E-mail não encontrado no sistema.' },
        { status: 401 },
      );
    }

    // Validação da senha (suporta texto plano guardado no banco)
    const isPasswordValid = supplier.passwordHash === password;

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Palavra-passe incorreta.' },
        { status: 401 },
      );
    }

    return NextResponse.json({
      supplier: {
        id: supplier.id,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
      },
    });
  } catch (error) {
    console.error('Erro ao realizar login do fornecedor:', error);
    return NextResponse.json(
      { error: 'Erro interno ao realizar login.' },
      { status: 500 },
    );
  }
}