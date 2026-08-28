import { NextResponse, NextRequest } from 'next/server';
import { ProductsService } from '@/modules/products/products.service';
import { db } from '@/db/db';
import { products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET: Lista todos os produtos da empresa (tenant)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'O parâmetro companyId é obrigatório na requisição.' },
        { status: 400 }
      );
    }

    const items = await ProductsService.findByCompany(companyId);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json({ error: 'Erro ao carregar produtos do banco.' }, { status: 500 });
  }
}

// POST: Cadastra um novo produto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      companyId, code, description, brand, category, 
      unit, boxQuantity, costPrice, salePrice, ncm, cest, origin 
    } = body;

    if (!companyId || !description) {
      return NextResponse.json(
        { error: 'Os campos companyId e description são obrigatórios.' },
        { status: 400 }
      );
    }

    const [newProduct] = await db
      .insert(products)
      .values({
        companyId,
        internalCode: code || null,
        description,
        brand: brand || null,
        category: category || null,
        unit: unit || 'UN',
        boxQuantity: boxQuantity ? Number(boxQuantity) : 1,
        costPrice: costPrice !== undefined && costPrice !== '' ? String(costPrice) : '0.00',
        salePrice: salePrice !== undefined && salePrice !== '' ? String(salePrice) : '0.00',
        ncm: ncm || null,
        cest: cest || null,
        origin: origin || '0',
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Produto cadastrado com sucesso!',
      product: newProduct,
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar produto no banco.' }, { status: 500 });
  }
}

// PUT: Atualiza um produto existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, companyId, code, description, brand, category, 
      costPrice, salePrice, ncm, cest 
    } = body;

    if (!id || !companyId) {
      return NextResponse.json({ error: 'ID e companyId são obrigatórios para atualização.' }, { status: 400 });
    }

    const [updated] = await db
      .update(products)
      .set({
        internalCode: code || null,
        description,
        brand: brand || null,
        category: category || null,
        costPrice: costPrice ? String(costPrice) : '0.00',
        salePrice: salePrice ? String(salePrice) : '0.00',
        ncm: ncm || null,
        cest: cest || null,
      })
      .where(and(eq(products.id, id), eq(products.companyId, companyId)))
      .returning();

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json({ error: 'Erro ao atualizar produto.' }, { status: 500 });
  }
}

// DELETE: Remove/Cancela um produto
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const companyId = searchParams.get('companyId');

    if (!id || !companyId) {
      return NextResponse.json({ error: 'Parâmetros id e companyId obrigatórios.' }, { status: 400 });
    }

    await db
      .delete(products)
      .where(and(eq(products.id, id), eq(products.companyId, companyId)));

    return NextResponse.json({ success: true, message: 'Produto removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return NextResponse.json({ error: 'Erro ao excluir produto.' }, { status: 500 });
  }
}