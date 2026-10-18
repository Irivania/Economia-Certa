import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { partners, sales } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET: Obter o extrato de compras e saldo devedor de uma empresa parceira e seus funcionários
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const partnerId = searchParams.get('partnerId');

    if (!companyId || !partnerId) {
      return NextResponse.json({ error: 'Company ID e Partner ID são obrigatórios.' }, { status: 400 });
    }

    // Buscar a empresa parceira
    const [partner] = await db
      .select()
      .from(partners)
      .where(and(eq(partners.id, partnerId), eq(partners.companyId, companyId)));

    if (!partner) {
      return NextResponse.json({ error: 'Empresa parceira não encontrada.' }, { status: 404 });
    }

    // Buscar funcionários vinculados a esta empresa
    const employees = await db
      .select()
      .from(partners)
      .where(eq(partners.companyPartnerId, partnerId));

    const employeeIds = employees.map((e) => e.id);
    employeeIds.push(partnerId); // Incluir a própria empresa se houver compras diretas

    // Buscar todas as vendas faturadas para estes IDs que ainda estão em aberto / com saldo devedor
    const relatedSales = await db
      .select()
      .from(sales)
      .where(and(eq(sales.companyId, companyId), eq(sales.paymentMethod, 'CONVENIO')));

    const filteredSales = relatedSales.filter((s) => s.partnerId && employeeIds.includes(s.partnerId));

    return NextResponse.json({
      success: true,
      partner,
      employees,
      sales: filteredSales,
    });
  } catch (error) {
    console.error('Erro ao gerar faturamento do convênio:', error);
    return NextResponse.json({ error: 'Erro interno ao carregar faturamento.' }, { status: 500 });
  }
}

// POST: Realizar a baixa da fatura (Zerar ou abater o saldo devedor da empresa e funcionários)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, partnerId } = body;

    if (!companyId || !partnerId) {
      return NextResponse.json({ error: 'Dados insuficientes para baixa de fatura.' }, { status: 400 });
    }

    // 1. Buscar empresa parceira e funcionários vinculados
    const employees = await db
      .select()
      .from(partners)
      .where(eq(partners.companyPartnerId, partnerId));

    const idsToReset = [partnerId, ...employees.map((e) => e.id)];

    // 2. Zerar o saldo devedor atual de todos os envolvidos no convênio corporativo
    for (const id of idsToReset) {
      await db
        .update(partners)
        .set({ currentBalance: '0.00' })
        .where(eq(partners.id, id));
    }

    return NextResponse.json({ success: true, message: 'Fatura fechada e saldo devedor quitado com sucesso!' });
  } catch (error) {
    console.error('Erro ao realizar baixa do convênio:', error);
    return NextResponse.json({ error: 'Erro interno ao processar baixa.' }, { status: 500 });
  }
}