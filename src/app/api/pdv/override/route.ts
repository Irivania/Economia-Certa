import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { sales, saleItems, products, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { saleId, managerUserId, action } = body; // action: 'APPROVE' ou 'CANCEL'

    if (!saleId || !managerUserId || !action) {
      return NextResponse.json({ error: 'Dados insuficientes para a autorização.' }, { status: 400 });
    }

    // 1. Validar se o usuário é Gerente ou Administrador
    const [manager] = await db.select().from(users).where(eq(users.id, managerUserId));
    if (!manager || !['admin', 'gerente'].includes(String(manager.role || '').toLowerCase())) {
      return NextResponse.json({ error: 'Acesso negado. Apenas gerentes ou administradores podem autorizar.' }, { status: 403 });
    }

    // 2. Buscar a venda suspensa
    const [sale] = await db.select().from(sales).where(eq(sales.id, saleId));
    if (!sale) {
      return NextResponse.json({ error: 'Venda não encontrada.' }, { status: 404 });
    }

    if (sale.status !== 'SUSPECTED_FRAUD') {
      return NextResponse.json({ error: 'Esta venda não está sob suspeita ou bloqueada.' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      // Libera a venda: Atualiza status para COMPLETED e efetua a baixa de estoque pendente
      const items = await db.select().from(saleItems).where(eq(saleItems.saleId, saleId));

      for (const item of items) {
        const [prod] = await db.select().from(products).where(eq(products.id, item.productId));
        if (prod) {
          const q = Number(item.quantity || 1);
          const newStock = Math.max(0, prod.stockCurrent - q);
          await db
            .update(products)
            .set({ stockCurrent: newStock })
            .where(eq(products.id, item.productId));
        }
      }

      await db.update(sales).set({ status: 'COMPLETED' }).where(eq(sales.id, saleId));

      return NextResponse.json({ success: true, message: 'Venda aprovada e liberada pelo gerente com sucesso!' });
    } else if (action === 'CANCEL') {
      // Cancela definitivamente a tentativa de fraude/erro
      await db.update(sales).set({ status: 'CANCELLED' }).where(eq(sales.id, saleId));

      return NextResponse.json({ success: true, message: 'Venda cancelada por segurança.' });
    } else {
      return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Erro no override gerencial:', error);
    const msg = error instanceof Error ? error.message : 'Erro interno.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}