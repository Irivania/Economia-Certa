import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'O ID da empresa é obrigatório.' }, { status: 400 });
    }

    // Busca as marcas cadastradas nos produtos da empresa
    const productList = await db
      .select({ brand: products.brand })
      .from(products)
      .where(eq(products.companyId, companyId));

    // Filtra valores únicos e remove nulos/vazios
    const uniqueBrands = Array.from(
      new Set(productList.map((p) => p.brand).filter(Boolean))
    ).sort();

    return NextResponse.json(uniqueBrands);
  } catch (error) {
    console.error('Erro ao buscar marcas:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar marcas.' }, { status: 500 });
  }
}