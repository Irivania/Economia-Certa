import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { suppliers } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
    // Retorna array vazio em caso de erro na tabela para não quebrar a UI
    return NextResponse.json([]);
  }
}