import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotations, quotationSuppliers, suppliers, supplierConnections } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const quotationId = resolvedParams.id;

    if (!quotationId) {
      return NextResponse.json({ error: 'ID da cotação não informado.' }, { status: 400 });
    }

    // 1. Busca a cotação principal
    const [quotation] = await db
      .select()
      .from(quotations)
      .where(eq(quotations.id, quotationId));

    if (!quotation) {
      return NextResponse.json({ error: 'Cotação não encontrada.' }, { status: 404 });
    }

    // 2. Busca os fornecedores vinculados a esta cotação
    const linkedSuppliers = await db
      .select({
        supplierId: suppliers.id,
        name: suppliers.name,
        phone: suppliers.phone,
        token: quotationSuppliers.token,
        status: quotationSuppliers.status,
        totalOffered: quotationSuppliers.totalOffered,
      })
      .from(quotationSuppliers)
      .innerJoin(suppliers, eq(quotationSuppliers.supplierId, suppliers.id))
      .where(eq(quotationSuppliers.quotationId, quotationId));

    // 3. Buscar conexões B2B ativas (ACCEPTED) para a empresa desta cotação
    const activeConnections = await db
      .select({ supplierId: supplierConnections.supplierId })
      .from(supplierConnections)
      .where(
        and(
          eq(supplierConnections.companyId, quotation.companyId),
          eq(supplierConnections.status, 'ACCEPTED')
        )
      );

    const activeSupplierIds = new Set(activeConnections.map((c) => c.supplierId));

    // Mapeia os dados indicando se cada fornecedor é ou não um parceiro B2B ativo
    const trackingData = linkedSuppliers.map((sup) => ({
      id: sup.supplierId,
      name: sup.name,
      phone: sup.phone,
      status: sup.status === 'RESPONDIDO' ? 'RESPONDIDO' : 'PENDENTE',
      answeredAt: null,
      totalOffered: sup.totalOffered ? Number(sup.totalOffered) : 0,
      token: sup.token,
      isB2BActive: activeSupplierIds.has(sup.supplierId), // True apenas para quem tem parceria aceite (ex: Martins)
    }));

    return NextResponse.json({
      quotation,
      tracking: trackingData,
    });
  } catch (error) {
    console.error('Erro ao buscar tracking da cotação:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar acompanhamento.' }, { status: 500 });
  }
}