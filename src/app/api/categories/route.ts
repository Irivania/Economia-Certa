import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId');
    if (!companyId) {
      return NextResponse.json({ error: 'companyId obrigatório' }, { status: 400 });
    }

    const items = await db.select().from(categories).where(eq(categories.companyId, companyId));
    return NextResponse.json(items);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { companyId, name } = await request.json();
    if (!companyId || !name) {
      return NextResponse.json({ error: 'companyId e name são obrigatórios' }, { status: 400 });
    }

    const [newCategory] = await db
      .insert(categories)
      .values({ companyId, name })
      .returning();

    return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar categoria:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar categoria' }, { status: 500 });
  }
}