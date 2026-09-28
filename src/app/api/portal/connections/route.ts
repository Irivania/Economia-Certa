import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { supplierConnections } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET: Listar conexões de um lojista ou de um representante
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const supplierId = searchParams.get('supplierId');

    if (!companyId && !supplierId) {
      return NextResponse.json({ error: 'companyId ou supplierId são obrigatórios.' }, { status: 400 });
    }

    let results;
    if (companyId) {
      results = await db
        .select()
        .from(supplierConnections)
        .where(eq(supplierConnections.companyId, companyId));
    } else {
      results = await db
        .select()
        .from(supplierConnections)
        .where(eq(supplierConnections.supplierId, supplierId!));
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Erro ao buscar conexões:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar conexões.' }, { status: 500 });
  }
}

// POST: Enviar um convite de parceria (iniciado pelo Lojista ou pelo Representante)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, supplierId, initiatedBy } = body;

    if (!companyId || !supplierId || !initiatedBy) {
      return NextResponse.json({ error: 'companyId, supplierId e initiatedBy são obrigatórios.' }, { status: 400 });
    }

    // Verificar se já existe uma conexão ou convite entre os dois
    const existing = await db
      .select()
      .from(supplierConnections)
      .where(
        and(
          eq(supplierConnections.companyId, companyId),
          eq(supplierConnections.supplierId, supplierId)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Já existe uma conexão ou convite registado entre este lojista e fornecedor.' }, { status: 400 });
    }

    const [newConnection] = await db
      .insert(supplierConnections)
      .values({
        companyId,
        supplierId,
        initiatedBy, // 'COMPANY' ou 'SUPPLIER'
        status: 'PENDING',
      })
      .returning();

    return NextResponse.json({ success: true, connection: newConnection });
  } catch (error) {
    console.error('Erro ao criar convite de conexão:', error);
    return NextResponse.json({ error: 'Erro interno ao criar convite.' }, { status: 500 });
  }
}

// PUT: Aceitar ou recusar um convite de parceria
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { connectionId, status } = body; // status: 'ACCEPTED' ou 'REJECTED'

    if (!connectionId || !status) {
      return NextResponse.json({ error: 'connectionId e status são obrigatórios.' }, { status: 400 });
    }

    const [updated] = await db
      .update(supplierConnections)
      .set({ status })
      .where(eq(supplierConnections.id, connectionId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Conexão não encontrada.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, connection: updated });
  } catch (error) {
    console.error('Erro ao atualizar estado da conexão:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar conexão.' }, { status: 500 });
  }
}