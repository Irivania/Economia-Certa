import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotations, suppliers } from '@/db/schema';
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

    // 2. Busca os fornecedores cadastrados para exibição no painel
    const supplierList = await db
      .select({
        id: suppliers.id,
        name: suppliers.name,
        phone: suppliers.phone,
      })
      .from(suppliers);

    // Mapeia os fornecedores para o formato do painel de tracking
    const trackingData = supplierList.map((sup, index) => ({
      id: sup.id,
      name: sup.name,
      phone: sup.phone,
      status: index === 0 ? 'RESPONDIDO' : 'PENDENTE', // Exemplo dinâmico integrável
      answeredAt: index === 0 ? new Date().toISOString() : null,
      totalOffered: index === 0 ? 1450.00 : 0,
      token: quotation.id,
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