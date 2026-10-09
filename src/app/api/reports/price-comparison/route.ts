import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotations, quotationItems, quotationSuppliers, quotationSupplierItems, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

interface Offer {
  supplierId: string;
  price: number | null;
}

interface ComparisonProduct {
  productId: string;
  description: string;
  unit: string;
  boxQuantity: number;
  requestedQuantity: string;
  offers: Offer[];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const quotationId = searchParams.get('quotationId');

    if (!companyId || !quotationId) {
      return NextResponse.json(
        { error: 'O ID da empresa e o ID da cotação são obrigatórios.' },
        { status: 400 }
      );
    }

    const [quotation] = await db
      .select()
      .from(quotations)
      .where(and(eq(quotations.id, quotationId), eq(quotations.companyId, companyId)));

    if (!quotation) {
      return NextResponse.json({ error: 'Cotação não encontrada.' }, { status: 404 });
    }

    // 1. Busca os itens solicitados na cotação com os dados do produto
    const requestedItems = await db
      .select({
        productId: products.id,
        description: products.description,
        unit: products.unit,
        boxQuantity: products.boxQuantity,
        requestedQuantity: quotationItems.requestedQuantity,
      })
      .from(quotationItems)
      .innerJoin(products, eq(quotationItems.productId, products.id))
      .where(eq(quotationItems.quotationId, quotationId));

    // 2. Busca as respostas/ofertas de preços dos fornecedores para esta cotação
    const supplierOffers = await db
      .select({
        supplierId: quotationSuppliers.supplierId,
        productId: quotationSupplierItems.productId,
        price: quotationSupplierItems.price,
        outOfStock: quotationSupplierItems.outOfStock,
      })
      .from(quotationSupplierItems)
      .innerJoin(
        quotationSuppliers,
        eq(quotationSupplierItems.quotationSupplierId, quotationSuppliers.id)
      )
      .where(eq(quotationSuppliers.quotationId, quotationId));

    const comparisonMap: Record<string, ComparisonProduct> = {};

    // Inicializa o mapa com os itens solicitados
    requestedItems.forEach((item) => {
      comparisonMap[item.productId] = {
        productId: item.productId,
        description: item.description,
        unit: item.unit,
        boxQuantity: item.boxQuantity,
        requestedQuantity: item.requestedQuantity,
        offers: [],
      };
    });

    // Associa as ofertas dos fornecedores aos respetivos produtos
    supplierOffers.forEach((offer) => {
      if (comparisonMap[offer.productId]) {
        const priceVal = offer.outOfStock || offer.price === null ? null : Number(offer.price);
        comparisonMap[offer.productId].offers.push({
          supplierId: offer.supplierId,
          price: priceVal,
        });
      }
    });

    const result = Object.values(comparisonMap).map((prod) => {
      const validPrices = prod.offers
        .map((o) => o.price)
        .filter((p): p is number => p !== null && p > 0);
      
      const bestPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;

      return {
        ...prod,
        bestPrice,
      };
    });

    return NextResponse.json({
      quotationId,
      status: quotation.status,
      comparison: result,
    });
  } catch (error) {
    console.error('Erro ao gerar relatório comparativo:', error);
    return NextResponse.json({ error: 'Erro interno ao gerar relatório.' }, { status: 500 });
  }
}