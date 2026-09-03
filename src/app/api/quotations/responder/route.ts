import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotations, quotationItems, products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido.' }, { status: 400 });
    }

    const [quotation] = await db.select().from(quotations).where(eq(quotations.token, token));

    if (!quotation) {
      return NextResponse.json({ error: 'Cotação não encontrada.' }, { status: 404 });
    }

    const itemsList = await db
      .select({
        id: quotationItems.id,
        productId: quotationItems.productId,
        requestedQuantity: quotationItems.requestedQuantity,
        description: products.description,
        ean: products.ean,
        brand: products.brand,
        imageUrl: products.imageUrl,
      })
      .from(quotationItems)
      .innerJoin(products, eq(quotationItems.productId, products.id))
      .where(eq(quotationItems.quotationId, quotation.id));

    return NextResponse.json({
      id: quotation.id,
      title: quotation.title,
      storeName: quotation.storeName || 'Melo Perfumaria',
      endDate: quotation.endDate,
      closingTime: quotation.closingTime,
      items: itemsList,
    });
  } catch (error) {
    console.error('Erro ao buscar cotação para resposta:', error);
    return NextResponse.json({ error: 'Erro interno ao carregar cotação.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, responses, observation } = body;

    if (!token || !responses) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    const [quotation] = await db.select().from(quotations).where(eq(quotations.token, token));

    if (!quotation) {
      return NextResponse.json({ error: 'Cotação não encontrada.' }, { status: 404 });
    }

    if (observation) {
      await db
        .update(quotations)
        .set({ observation })
        .where(eq(quotations.id, quotation.id));
    }

    for (const [itemId, data] of Object.entries(responses) as [string, { price: string; outOfStock: boolean }][]) {
      const finalPrice = data.outOfStock ? 0 : Number(data.price || 0);

      await db
        .update(quotationItems)
        .set({
          price: String(finalPrice), // Convertido para string para alinhar com o tipo numeric do banco
          outOfStock: data.outOfStock,
        })
        .where(eq(quotationItems.id, itemId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar resposta da cotação:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar resposta.' }, { status: 500 });
  }
}