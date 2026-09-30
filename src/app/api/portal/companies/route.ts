import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { supplierBrands } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supplierId, tradeName, corporateName, cnpj, email, phone } = body;

    if (!supplierId || !tradeName) {
      return NextResponse.json({ error: 'Dados incompletos para o cadastro da marca.' }, { status: 400 });
    }

    // Insere a nova marca/distribuidora vinculada ao representante usando os campos exatos do schema
    const newBrandList = await db.insert(supplierBrands).values({
      supplierId,
      tradeName: String(tradeName).toUpperCase(),
      corporateName: corporateName ? String(corporateName) : String(tradeName).toUpperCase(),
      cnpj: cnpj ? String(cnpj) : '',
      email: email ? String(email) : '',
      phone: phone ? String(phone) : '',
    }).returning();

    const createdBrand = newBrandList[0];

    return NextResponse.json({ 
      success: true, 
      message: 'Empresa cadastrada com sucesso!',
      company: {
        id: createdBrand.id,
        tradeName: createdBrand.tradeName,
        corporateName: createdBrand.corporateName,
        cnpj: createdBrand.cnpj,
        email: createdBrand.email,
        phone: createdBrand.phone,
      }
    });
  } catch (error) {
    console.error('Erro ao cadastrar empresa do representante:', error);
    return NextResponse.json({ error: 'Erro interno ao cadastrar empresa.' }, { status: 500 });
  }
}