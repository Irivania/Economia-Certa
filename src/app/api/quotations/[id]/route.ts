import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotations, quotationItems, products, quotationSuppliers, quotationSupplierItems, suppliers, supplierBrands } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const quotationId = resolvedParams.id;

    if (!quotationId) {
      return NextResponse.json({ error: 'ID da cotação não fornecido.' }, { status: 400 });
    }

    // 1. Busca os dados principais da cotação
    const [quotation] = await db
      .select()
      .from(quotations)
      .where(eq(quotations.id, quotationId));

    if (!quotation) {
      return NextResponse.json({ error: 'Cotação não encontrada.' }, { status: 404 });
    }

    // 2. Busca os itens solicitados na cotação
    const itemsList = await db
      .select({
        id: quotationItems.id,
        productId: quotationItems.productId,
        requestedQuantity: quotationItems.requestedQuantity,
        description: products.description,
        ean: products.ean,
        brand: products.brand,
        unit: products.unit,
        imageUrl: products.imageUrl,
      })
      .from(quotationItems)
      .innerJoin(products, eq(quotationItems.productId, products.id))
      .where(eq(quotationItems.quotationId, quotationId));

    // 3. Busca os fornecedores/distribuidores vinculados a esta cotação
    const suppliersList = await db
      .select({
        quotationSupplierId: quotationSuppliers.id,
        supplierId: quotationSuppliers.supplierId,
        brandId: quotationSuppliers.brandId,
        brandName: supplierBrands.tradeName,
        supplierName: suppliers.name,
        status: quotationSuppliers.status,
        totalOffered: quotationSuppliers.totalOffered,
        observation: quotationSuppliers.observation,
      })
      .from(quotationSuppliers)
      .leftJoin(suppliers, eq(quotationSuppliers.supplierId, suppliers.id))
      .leftJoin(supplierBrands, eq(quotationSuppliers.brandId, supplierBrands.id))
      .where(eq(quotationSuppliers.quotationId, quotationId));

    // 4. Busca todos os itens respondidos na tabela isolada e filtra por segurança no código
    const quotationSupplierIds = suppliersList.map((s) => s.quotationSupplierId);
    
    const allSupplierItems = await db
      .select()
      .from(quotationSupplierItems);

    const supplierItemsList = allSupplierItems.filter((si) => 
      quotationSupplierIds.includes(si.quotationSupplierId)
    );

    const normalizedSuppliersList = suppliersList.map((supplier) => ({
      ...supplier,
      status:
        supplier.status === 'RESPONDIDO' || supplier.status === 'responded'
          ? 'RESPONDIDO'
          : supplier.status,
    }));

    return NextResponse.json({
      ...quotation,
      items: itemsList,
      suppliers: normalizedSuppliersList,
      supplierItems: supplierItemsList,
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes da cotação para o lojista:', error);
    return NextResponse.json({ error: 'Erro interno ao carregar cotação.' }, { status: 500 });
  }
}