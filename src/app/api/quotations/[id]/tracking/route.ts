import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotations, quotationSuppliers, suppliers } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    // 2. Busca apenas os fornecedores vinculados a esta cotação através da tabela quotationSuppliers
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

    // Mapeia os dados reais vinculados, trazendo o token individual de cada distribuidor
    const trackingData = linkedSuppliers.map((sup) => ({
      id: sup.supplierId,
      name: sup.name,
      phone: sup.phone,
      status: sup.status === 'RESPONDIDO' ? 'RESPONDIDO' : 'PENDENTE',
      answeredAt: null,
      totalOffered: sup.totalOffered ? Number(sup.totalOffered) : 0,
      token: sup.token, // Token exclusivo do distribuidor para o link do WhatsApp!
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