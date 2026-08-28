import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { brands } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId');
    if (!companyId) {
      return NextResponse.json({ error: 'companyId obrigatório' }, { status: 400 });
    }

    const items = await db.select().from(brands).where(eq(brands.companyId, companyId));
    return NextResponse.json(items);
  } catch (error) {
    console.error('Erro ao buscar marcas:', error);
    return NextResponse.json({ error: 'Erro ao buscar marcas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { companyId, name } = await request.json();
    if (!companyId || !name) {
      return NextResponse.json({ error: 'companyId e name são obrigatórios' }, { status: 400 });
    }

    const [newBrand] = await db
      .insert(brands)
      .values({ companyId, name })
      .returning();

    return NextResponse.json({ success: true, brand: newBrand }, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar marca:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar marca' }, { status: 500 });
  }
}