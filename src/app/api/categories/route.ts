import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { uppercaseText } from '@/lib/text';

// 1. Método GET para listar as categorias da empresa
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'ID da empresa é obrigatório.' }, { status: 400 });
    }

    const allCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.companyId, companyId));

    return NextResponse.json(allCategories);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar categorias.' }, { status: 500 });
  }
}

// 2. Método POST para criar uma nova categoria
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, companyId } = body;

    if (!name || !companyId) {
      return NextResponse.json({ error: 'Nome e ID da empresa são obrigatórios.' }, { status: 400 });
    }

    const categoryId = crypto.randomUUID();

    const [newCategory] = await db
      .insert(categories)
      .values({
        id: categoryId,
        companyId,
        name: uppercaseText(String(name).trim()),
      })
      .returning();

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar categoria.' }, { status: 500 });
  }
}