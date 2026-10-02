import { NextResponse } from 'next/server';
import { db } from '@/db';
import { supplierBrands, suppliers } from '@/db/schema';
import { eq } from 'drizzle-orm';

const normalize = (value: string | null | undefined) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

async function resolveSupplierId(
  parentSupplierId: string,
  tradeName: string,
  corporateName?: string | null,
) {
  const [parent] = await db
    .select({ email: suppliers.email })
    .from(suppliers)
    .where(eq(suppliers.id, parentSupplierId));

  if (!parent?.email) return parentSupplierId;

  const candidates = await db
    .select({ id: suppliers.id, name: suppliers.name })
    .from(suppliers)
    .where(eq(suppliers.email, parent.email));

  const brandTerms = [normalize(tradeName), normalize(corporateName)].filter(Boolean);
  const match = candidates.find((candidate) => {
    const supplierName = normalize(candidate.name);
    return brandTerms.some(
      (term) => supplierName.includes(term) || term.includes(supplierName),
    );
  });

  return match?.id || parentSupplierId;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');

    if (!supplierId) {
      return NextResponse.json({ error: 'supplierId é obrigatório' }, { status: 400 });
    }

    const brands = await db
      .select()
      .from(supplierBrands)
      .where(eq(supplierBrands.supplierId, supplierId));

    const brandsWithSupplier = await Promise.all(
      (brands ?? []).map(async (brand) => ({
        ...brand,
        supplierId: await resolveSupplierId(
          supplierId,
          brand.tradeName,
          brand.corporateName,
        ),
      })),
    );

    return NextResponse.json(brandsWithSupplier, { status: 200 });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error('[API BRANDS GET ERROR DETAILS]:', errMessage);

    // Retorna array vazio em vez de crashar a aplicação com 500
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

    const resolvedSupplierId = await resolveSupplierId(
      supplierId,
      tradeName,
      corporateName,
    );

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

    return NextResponse.json(
      { ...newBrand, supplierId: resolvedSupplierId },
      { status: 201 },
    );
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