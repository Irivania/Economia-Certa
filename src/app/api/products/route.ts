import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { uppercaseText } from '@/lib/text';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'companyId é obrigatório' }, { status: 400 });
    }

    const data = await db
      .select()
      .from(products)
      .where(eq(products.companyId, companyId));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      description,
      code,
      brand,
      imageUrl,
      unit,
      boxQuantity,
      costPrice,
      lastPurchasePrice,
      salePrice,
      stockCurrent,
      stockMin,
      stockIdeal,
      stockMax,
      ncm,
      cest,
      category,
    } = body;

    if (!companyId || !description) {
      return NextResponse.json({ error: 'companyId e description são obrigatórios' }, { status: 400 });
    }

    const trimmedCode = code ? code.trim() : null;

    // Validação: Verificar se já existe um produto com o mesmo Código de Barras (EAN) na empresa
    if (trimmedCode) {
      const existingProduct = await db
        .select()
        .from(products)
        .where(and(eq(products.companyId, companyId), eq(products.ean, trimmedCode)))
        .limit(1);

      if (existingProduct.length > 0) {
        return NextResponse.json(
          { error: 'Este Código de Barras (EAN) já está cadastrado para outro produto nesta empresa!' },
          { status: 400 }
        );
      }
    }

    const newProduct = await db
      .insert(products)
      .values({
        id: randomUUID(),
        companyId,
        description: uppercaseText(String(description).trim()),
        ean: trimmedCode,
        brand: brand ? uppercaseText(String(brand).trim()) : null,
        imageUrl: imageUrl || null,
        unit: unit ? uppercaseText(String(unit).trim()) : 'UN',
        category: category ? uppercaseText(String(category).trim()) : null,
        boxQuantity: boxQuantity ? Number(boxQuantity) : 1,
        costPrice: costPrice ? String(costPrice) : null,
        lastPurchasePrice: lastPurchasePrice ? String(lastPurchasePrice) : null,
        salePrice: salePrice ? String(salePrice) : null,
        stockCurrent: stockCurrent !== undefined ? Number(stockCurrent) : 0,
        stockMin: stockMin !== undefined ? Number(stockMin) : 0,
        stockIdeal: stockIdeal !== undefined ? Number(stockIdeal) : 0,
        stockMax: stockMax !== undefined ? Number(stockMax) : 0,
        ncm: ncm ? ncm.trim() : null,
        cest: cest ? cest.trim() : null,
      })
      .returning();

    return NextResponse.json({ success: true, product: newProduct[0] }, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    return NextResponse.json({ error: 'Erro interno ao cadastrar produto' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      companyId,
      description,
      code,
      brand,
      imageUrl,
      unit,
      boxQuantity,
      costPrice,
      lastPurchasePrice,
      salePrice,
      stockCurrent,
      stockMin,
      stockIdeal,
      stockMax,
      ncm,
      cest,
      category,
    } = body;

    if (!id || !companyId || !description) {
      return NextResponse.json({ error: 'id, companyId e description são obrigatórios' }, { status: 400 });
    }

    const [updated] = await db
      .update(products)
      .set({
        description: uppercaseText(String(description).trim()),
        ean: code ? code.trim() : null,
        brand: brand ? uppercaseText(String(brand).trim()) : null,
        imageUrl: imageUrl || null,
        unit: unit ? uppercaseText(String(unit).trim()) : 'UN',
        category: category ? uppercaseText(String(category).trim()) : null,
        boxQuantity: boxQuantity ? Number(boxQuantity) : 1,
        costPrice: costPrice ? String(costPrice) : null,
        lastPurchasePrice: lastPurchasePrice ? String(lastPurchasePrice) : null,
        salePrice: salePrice ? String(salePrice) : null,
        stockCurrent: stockCurrent !== undefined ? Number(stockCurrent) : 0,
        stockMin: stockMin !== undefined ? Number(stockMin) : 0,
        stockIdeal: stockIdeal !== undefined ? Number(stockIdeal) : 0,
        stockMax: stockMax !== undefined ? Number(stockMax) : 0,
        ncm: ncm ? ncm.trim() : null,
        cest: cest ? cest.trim() : null,
      })
      .where(and(eq(products.id, id), eq(products.companyId, companyId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const companyId = searchParams.get('companyId');

    if (!id || !companyId) {
      return NextResponse.json({ error: 'id e companyId são obrigatórios' }, { status: 400 });
    }

    await db
      .delete(products)
      .where(and(eq(products.id, id), eq(products.companyId, companyId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return NextResponse.json({ error: 'Erro ao excluir produto' }, { status: 500 });
  }
}