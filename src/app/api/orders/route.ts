import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId');
    if (!companyId) {
      return NextResponse.json({ error: 'O ID da empresa é obrigatório.' }, { status: 400 });
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar pedidos.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, supplierId, items } = body;

    if (!companyId || !supplierId || !items) {
      return NextResponse.json({ error: 'Dados insuficientes para gerar o pedido.' }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, message: 'Pedido de compra registrado com sucesso!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar pedido de compra:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar pedido.' }, { status: 500 });
  }
}