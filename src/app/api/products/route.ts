import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { products } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const query = db.select().from(products).orderBy(asc(products.description));

    if (companyId) {
      const items = await query.where(eq(products.companyId, companyId));
      return NextResponse.json(items);
    }

    const items = await query;
    return NextResponse.json(items);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    return NextResponse.json({ error: 'Erro interno ao listar produtos.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      code,
      description,
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
      classTrib,
      anvisaRegistry,
      manufacturerName,
      weight,
      dimensions,
    } = body;

    if (!description || !description.trim()) {
      return NextResponse.json({ error: 'A descrição do produto é obrigatória.' }, { status: 400 });
    }

    const cleanEan = code ? String(code).trim() : null;
    const currentCompanyId = companyId ? String(companyId) : '';

    // Validação inteligente: Impede duplicidade de EAN para a mesma empresa antes de inserir
    if (cleanEan && currentCompanyId) {
      const [existingProduct] = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.companyId, currentCompanyId),
            eq(products.ean, cleanEan)
          )
        );

      if (existingProduct) {
        return NextResponse.json(
          { error: `Já existe um produto cadastrado com o EAN "${cleanEan}": "${existingProduct.description}".` },
          { status: 400 }
        );
      }
    }

    const newProductId = crypto.randomUUID();

    await db.insert(products).values({
      id: newProductId,
      companyId: currentCompanyId,
      ean: cleanEan,
      description: String(description).trim().toUpperCase(),
      brand: brand ? String(brand).trim().toUpperCase() : null,
      imageUrl: imageUrl ? String(imageUrl).trim() : null,
      unit: unit ? String(unit).trim().toUpperCase() : 'UN',
      boxQuantity: boxQuantity !== undefined && boxQuantity !== '' ? Number(boxQuantity) : 1,
      costPrice: costPrice ? String(costPrice) : null,
      lastPurchasePrice: lastPurchasePrice ? String(lastPurchasePrice) : null,
      salePrice: salePrice ? String(salePrice) : null,
      stockCurrent: stockCurrent !== undefined && stockCurrent !== '' ? Number(stockCurrent) : 0,
      stockMin: stockMin !== undefined && stockMin !== '' ? Number(stockMin) : 0,
      stockIdeal: stockIdeal !== undefined && stockIdeal !== '' ? Number(stockIdeal) : 0,
      stockMax: stockMax !== undefined && stockMax !== '' ? Number(stockMax) : 0,
      ncm: ncm ? String(ncm).trim() : null,
      cest: cest ? String(cest).trim() : null,
      classTrib: classTrib ? String(classTrib).trim() : null,
      anvisaRegistry: anvisaRegistry ? String(anvisaRegistry).trim().toUpperCase() : null,
      manufacturerName: manufacturerName ? String(manufacturerName).trim().toUpperCase() : null,
      weight: weight ? String(weight).trim() : null,
      dimensions: dimensions ? String(dimensions).trim().toUpperCase() : null,
    });

    return NextResponse.json({ success: true, id: newProductId }, { status: 201 });
  } catch (error: unknown) {
    console.error('Erro detalhado ao cadastrar produto:', error);
    const message = error instanceof Error ? error.message : 'Erro interno ao cadastrar produto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      code,
      description,
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
      classTrib,
      anvisaRegistry,
      manufacturerName,
      weight,
      dimensions,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do produto não fornecido para atualização.' }, { status: 400 });
    }

    if (!description || !description.trim()) {
      return NextResponse.json({ error: 'A descrição do produto é obrigatória.' }, { status: 400 });
    }

    await db
      .update(products)
      .set({
        ean: code ? String(code).trim() : null,
        description: String(description).trim().toUpperCase(),
        brand: brand ? String(brand).trim().toUpperCase() : null,
        imageUrl: imageUrl ? String(imageUrl).trim() : null,
        unit: unit ? String(unit).trim().toUpperCase() : 'UN',
        boxQuantity: boxQuantity !== undefined && boxQuantity !== '' ? Number(boxQuantity) : 1,
        costPrice: costPrice ? String(costPrice) : null,
        lastPurchasePrice: lastPurchasePrice ? String(lastPurchasePrice) : null,
        salePrice: salePrice ? String(salePrice) : null,
        stockCurrent: stockCurrent !== undefined && stockCurrent !== '' ? Number(stockCurrent) : 0,
        stockMin: stockMin !== undefined && stockMin !== '' ? Number(stockMin) : 0,
        stockIdeal: stockIdeal !== undefined && stockIdeal !== '' ? Number(stockIdeal) : 0,
        stockMax: stockMax !== undefined && stockMax !== '' ? Number(stockMax) : 0,
        ncm: ncm ? String(ncm).trim() : null,
        cest: cest ? String(cest).trim() : null,
        classTrib: classTrib ? String(classTrib).trim() : null,
        anvisaRegistry: anvisaRegistry ? String(anvisaRegistry).trim().toUpperCase() : null,
        manufacturerName: manufacturerName ? String(manufacturerName).trim().toUpperCase() : null,
        weight: weight ? String(weight).trim() : null,
        dimensions: dimensions ? String(dimensions).trim().toUpperCase() : null,
      })
      .where(eq(products.id, id));

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Erro detalhado ao atualizar produto:', error);
    const message = error instanceof Error ? error.message : 'Erro interno ao atualizar produto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do produto não fornecido.' }, { status: 400 });
    }

    await db.delete(products).where(eq(products.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return NextResponse.json({ error: 'Erro interno ao excluir produto.' }, { status: 500 });
  }
}