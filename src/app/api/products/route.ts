import { NextResponse } from 'next/server';
import { ProductsService } from '@/modules/products/products.service';

export async function GET() {
  try {
    const validCompanyId = '00000000-0000-0000-0000-000000000000';
    const products = await ProductsService.findByCompany(validCompanyId);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json({ error: 'Erro ao carregar produtos do banco.' }, { status: 500 });
  }
}