import { NextResponse, NextRequest } from 'next/server';
import { ProductsService } from '@/modules/products/products.service';
import { db } from '@/db/db';
import { products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { productSchema } from '@/types/productSchema';

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

    const validationResult = productSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const productId = crypto.randomUUID();

    const [newProduct] = await db
      .insert(products)
      .values({
        id: productId,
        companyId: data.companyId,
        ean: data.code || null,
        description: data.description,
        brand: data.brand || null,
        category: data.category || null,
        unit: data.unit || 'UN',
        boxQuantity: data.boxQuantity ?? 1,
        costPrice: data.costPrice ? String(data.costPrice) : null,
        salePrice: data.salePrice ? String(data.salePrice) : null,
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
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'O ID é obrigatório para atualização.' }, { status: 400 });
    }

    const validationResult = productSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const [updated] = await db
      .update(products)
      .set({
        ean: data.code || null,
        description: data.description,
        brand: data.brand || null,
        category: data.category || null,
        unit: data.unit || 'UN',
        boxQuantity: data.boxQuantity ?? 1,
        costPrice: data.costPrice ? String(data.costPrice) : null,
        salePrice: data.salePrice ? String(data.salePrice) : null,
      })
      .where(and(eq(products.id, id), eq(products.companyId, data.companyId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Produto não encontrado ou empresa inválida.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json({ error: 'Erro ao atualizar produto.' }, { status: 500 });
  }
}

// DELETE: Remove um produto
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