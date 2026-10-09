import { NextResponse } from 'next/server';
import { db } from '@/db';
import { supplierBrands } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');

    if (!supplierId) {
      return NextResponse.json({ error: 'supplierId é obrigatório' }, { status: 400 });
    }

    // Retorna APENAS as marcas cadastradas especificamente para este supplierId (Isolamento total por conta)
    const brands = await db
      .select()
      .from(supplierBrands)
      .where(eq(supplierBrands.supplierId, supplierId));

    return NextResponse.json(brands || [], { status: 200 });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error('[API BRANDS GET ERROR DETAILS]:', errMessage);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { supplierId, tradeName, corporateName, cnpj, email, phone } = body;

    if (!supplierId || !tradeName) {
      return NextResponse.json({ error: 'supplierId e tradeName são obrigatórios' }, { status: 400 });
    }

    const [newBrand] = await db
      .insert(supplierBrands)
      .values({
        supplierId,
        tradeName,
        corporateName: corporateName || null,
        cnpj: cnpj || null,
        email: email || null,
        phone: phone || null,
      })
      .returning();

    return NextResponse.json(newBrand, { status: 201 });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error('[API BRANDS POST ERROR DETAILS]:', errMessage);
    return NextResponse.json({ error: 'Erro ao criar marca', details: errMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID da marca é obrigatório' }, { status: 400 });
    }

    await db.delete(supplierBrands).where(eq(supplierBrands.id, id));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error('[API BRANDS DELETE ERROR DETAILS]:', errMessage);
    return NextResponse.json({ error: 'Erro ao remover marca', details: errMessage }, { status: 500 });
  }
}