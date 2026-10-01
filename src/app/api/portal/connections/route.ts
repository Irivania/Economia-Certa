import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { supplierConnections, suppliers } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

// GET: Listar conexões por companyId, supplierId ou supplierEmail
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const supplierId = searchParams.get('supplierId');
    const supplierEmail = searchParams.get('supplierEmail');

    console.log('🔍 [API CONNECTIONS GET] Parâmetros recebidos:', { companyId, supplierId, supplierEmail });

    if (companyId) {
      const results = await db
        .select()
        .from(supplierConnections)
        .where(eq(supplierConnections.companyId, companyId));
      
      console.log('📦 [API CONNECTIONS GET] Conexões para a empresa:', results.length);
      return NextResponse.json(results);
    }

    const matchedSupplierIds: string[] = [];
    if (supplierId) {
      matchedSupplierIds.push(supplierId);
    }

    if (supplierEmail) {
      const foundSup = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.email, supplierEmail));
      
      for (const sup of foundSup) {
        if (!matchedSupplierIds.includes(sup.id)) {
          matchedSupplierIds.push(sup.id);
        }
      }
    }

    if (matchedSupplierIds.length > 0) {
      const results = await db
        .select()
        .from(supplierConnections)
        .where(inArray(supplierConnections.supplierId, matchedSupplierIds));
      
      console.log('📦 [API CONNECTIONS GET] Conexões encontradas para o fornecedor:', results.length);
      return NextResponse.json(results);
    }

    return NextResponse.json({ error: 'companyId, supplierId ou supplierEmail são obrigatórios.' }, { status: 400 });
  } catch (error) {
    console.error('Erro ao buscar conexões:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar conexões.' }, { status: 500 });
  }
}

// POST: Enviar convite de parceria
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, supplierId, initiatedBy } = body;

    console.log('📤 [API CONNECTIONS POST] Pedido recebido:', { companyId, supplierId, initiatedBy });

    if (!companyId || !supplierId || !initiatedBy) {
      return NextResponse.json({ error: 'companyId, supplierId e initiatedBy são obrigatórios.' }, { status: 400 });
    }

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
      return NextResponse.json({ success: true, connection: existing[0], message: 'Conexão já existente.' });
    }

    const [newConnection] = await db
      .insert(supplierConnections)
      .values({
        companyId,
        supplierId,
        initiatedBy,
        status: 'PENDENTE',
      })
      .returning();

    console.log('✅ [API CONNECTIONS POST] Convite criado com sucesso:', newConnection);
    return NextResponse.json({ success: true, connection: newConnection });
  } catch (error) {
    console.error('Erro ao criar convite de conexão:', error);
    return NextResponse.json({ error: 'Erro interno ao criar convite.' }, { status: 500 });
  }
}

// PUT: Aceitar ou recusar convite
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { connectionId, status } = body;

    console.log('🔄 [API CONNECTIONS PUT] Atualizando conexão:', { connectionId, status });

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

    console.log('✅ [API CONNECTIONS PUT] Conexão atualizada com sucesso:', updated);
    return NextResponse.json({ success: true, connection: updated });
  } catch (error) {
    console.error('Erro ao atualizar estado da conexão:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar conexão.' }, { status: 500 });
  }
}

// DELETE: Excluir conexão pendente ou antiga
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { connectionId } = body;

    console.log('🗑 [API CONNECTIONS DELETE] A excluir conexão:', connectionId);

    if (!connectionId) {
      return NextResponse.json({ error: 'connectionId é obrigatório.' }, { status: 400 });
    }

    const [deleted] = await db
      .delete(supplierConnections)
      .where(eq(supplierConnections.id, connectionId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Conexão não encontrada para exclusão.' }, { status: 404 });
    }

    console.log('✅ [API CONNECTIONS DELETE] Conexão excluída com sucesso:', deleted);
    return NextResponse.json({ success: true, message: 'Conexão excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir conexão:', error);
    return NextResponse.json({ error: 'Erro interno ao excluir conexão.' }, { status: 500 });
  }
}