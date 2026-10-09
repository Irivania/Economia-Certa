import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotations, quotationItems, products, quotationSuppliers, quotationSupplierItems, suppliers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { uppercaseText } from '@/lib/text';
import crypto from 'crypto';

function parsePrice(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== 'string') return null;

  const normalizedValue = value.trim().replace(/\s/g, '');
  if (!normalizedValue) return null;

  const normalizedNumber = normalizedValue.includes(',')
    ? normalizedValue.replace(/\./g, '').replace(',', '.')
    : normalizedValue;
  const parsedPrice = Number(normalizedNumber);

  return Number.isFinite(parsedPrice) ? parsedPrice : null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token ou ID não fornecido.' }, { status: 400 });
    }

    let [qSupplier] = await db
      .select({
        id: quotationSuppliers.id,
        quotationId: quotationSuppliers.quotationId,
        supplierId: quotationSuppliers.supplierId,
        status: quotationSuppliers.status,
        supplierName: suppliers.name,
      })
      .from(quotationSuppliers)
      .leftJoin(suppliers, eq(quotationSuppliers.supplierId, suppliers.id))
      .where(eq(quotationSuppliers.token, token));

    if (!qSupplier) {
      const [fallbackSupplier] = await db
        .select({
          id: quotationSuppliers.id,
          quotationId: quotationSuppliers.quotationId,
          supplierId: quotationSuppliers.supplierId,
          status: quotationSuppliers.status,
          supplierName: suppliers.name,
        })
        .from(quotationSuppliers)
        .leftJoin(suppliers, eq(quotationSuppliers.supplierId, suppliers.id))
        .where(eq(quotationSuppliers.quotationId, token));
      qSupplier = fallbackSupplier;
    }

    if (!qSupplier) {
      return NextResponse.json({ error: 'Link de cotação inválido ou não encontrado.' }, { status: 404 });
    }

    const [quotation] = await db
      .select()
      .from(quotations)
      .where(eq(quotations.id, qSupplier.quotationId));

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
      supplierName: qSupplier.supplierName || 'Distribuidora',
      startDate: quotation.startDate,
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

    let [qSupplier] = await db
      .select()
      .from(quotationSuppliers)
      .where(eq(quotationSuppliers.token, token));

    if (!qSupplier) {
      const [fallbackSupplier] = await db
        .select()
        .from(quotationSuppliers)
        .where(eq(quotationSuppliers.quotationId, token));
      qSupplier = fallbackSupplier;
    }

    if (!qSupplier) {
      return NextResponse.json({ error: 'Fornecedor ou cotação não encontrados.' }, { status: 404 });
    }

    const [quotation] = await db
      .select()
      .from(quotations)
      .where(eq(quotations.id, qSupplier.quotationId));

    if (!quotation) {
      return NextResponse.json({ error: 'Cotação não encontrada.' }, { status: 404 });
    }

    if (observation) {
      await db
        .update(quotationSuppliers)
        .set({ observation: uppercaseText(String(observation).trim()), status: 'RESPONDIDO' })
        .where(eq(quotationSuppliers.id, qSupplier.id));
    } else {
      await db
        .update(quotationSuppliers)
        .set({ status: 'RESPONDIDO' })
        .where(eq(quotationSuppliers.id, qSupplier.id));
    }

    let calculatedTotal = 0;

    for (const [key, data] of Object.entries(responses) as [string, { price: string; outOfStock: boolean }][]) {
      const parsedPrice = parsePrice(data.price);
      if (!data.outOfStock && parsedPrice === null) {
        return NextResponse.json({ error: 'Existe um preço inválido na resposta.' }, { status: 400 });
      }
      const finalPrice = data.outOfStock ? 0 : parsedPrice || 0;

      // Descobre com robustez o productId real independentemente de a chave ser quotationItemId ou productId
      let resolvedProductId = key;
      const [itemById] = await db
        .select()
        .from(quotationItems)
        .where(eq(quotationItems.id, key));

      if (itemById) {
        resolvedProductId = itemById.productId;
      } else {
        // Valida se a chave é diretamente um productId existente na cotação
        const [itemByProdId] = await db
          .select()
          .from(quotationItems)
          .where(and(eq(quotationItems.quotationId, quotation.id), eq(quotationItems.productId, key)));
        if (itemByProdId) {
          resolvedProductId = itemByProdId.productId;
        }
      }

      const requestedQty = itemById ? Number(itemById.requestedQuantity || 1) : 1;
      if (!data.outOfStock) {
        calculatedTotal += finalPrice * requestedQty;
      }

      const [existingSupplierItem] = await db
        .select()
        .from(quotationSupplierItems)
        .where(
          and(
            eq(quotationSupplierItems.quotationSupplierId, qSupplier.id),
            eq(quotationSupplierItems.productId, resolvedProductId)
          )
        );

      if (existingSupplierItem) {
        await db
          .update(quotationSupplierItems)
          .set({
            price: String(finalPrice),
            outOfStock: Boolean(data.outOfStock),
          })
          .where(eq(quotationSupplierItems.id, existingSupplierItem.id));
      } else {
        await db.insert(quotationSupplierItems).values({
          id: crypto.randomUUID(),
          quotationSupplierId: qSupplier.id,
          productId: resolvedProductId,
          price: String(finalPrice),
          outOfStock: Boolean(data.outOfStock),
        });
      }
    }

    await db
      .update(quotationSuppliers)
      .set({ totalOffered: String(calculatedTotal) })
      .where(eq(quotationSuppliers.id, qSupplier.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar resposta da cotação:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar resposta.' }, { status: 500 });
  }
}