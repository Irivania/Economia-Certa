import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { sales, saleItems, products, cashRegisters } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      cashRegisterId,
      mode = 'CASHIER', // 'CASHIER' ou 'SELF_CHECKOUT'
      operatorName = 'Operador de Caixa',
      customerName,
      items, // Array de { productId, quantity, unitPrice, description }
      discount = 0,
      paymentMethod, // 'CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX'
      isSuspectedFraud = false, // Vindo do sensor de peso / IA do Self-Checkout
    } = body;

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID não informado.' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'A venda não possui itens.' }, { status: 400 });
    }

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Forma de pagamento não informada.' }, { status: 400 });
    }

    // 1. Validar se o Turno de Caixa está aberto (se aplicável)
    if (cashRegisterId) {
      const [register] = await db
        .select()
        .from(cashRegisters)
        .where(
          and(
            eq(cashRegisters.id, cashRegisterId),
            eq(cashRegisters.companyId, companyId),
            eq(cashRegisters.status, 'OPEN')
          )
        );

      if (!register) {
        return NextResponse.json({ error: 'Turno de caixa fechado ou não encontrado. Abra o caixa antes de vender.' }, { status: 400 });
      }
    }

    // 2. Calcular Subtotal e Total
    let subtotal = 0;
    for (const item of items) {
      const q = Number(item.quantity || 1);
      const p = Number(item.unitPrice || 0);
      subtotal += q * p;
    }

    const discountAmount = Number(discount || 0);
    const total = Math.max(0, subtotal - discountAmount);

    const saleId = crypto.randomUUID();
    const saleStatus = isSuspectedFraud ? 'SUSPECTED_FRAUD' : 'COMPLETED';

    // 3. Inserir a Venda
    await db.insert(sales).values({
      id: saleId,
      companyId,
      cashRegisterId: cashRegisterId || null,
      mode,
      operatorName,
      customerName: customerName ? String(customerName).trim().toUpperCase() : null,
      subtotal: String(subtotal.toFixed(2)),
      discount: String(discountAmount.toFixed(2)),
      total: String(total.toFixed(2)),
      paymentMethod,
      status: saleStatus,
    });

    // 4. Inserir os Itens da Venda e Atualizar o Estoque
    for (const item of items) {
      const q = Number(item.quantity || 1);
      const p = Number(item.unitPrice || 0);
      const itemSubtotal = q * p;

      await db.insert(saleItems).values({
        id: crypto.randomUUID(),
        saleId,
        productId: item.productId,
        description: item.description,
        quantity: String(q),
        unitPrice: String(p.toFixed(2)),
        subtotal: String(itemSubtotal.toFixed(2)),
      });

      // Baixa de estoque permitindo valores negativos caso ultrapasse o saldo atual
      if (!isSuspectedFraud) {
        const [prod] = await db.select().from(products).where(eq(products.id, item.productId));
        if (prod) {
          const newStock = prod.stockCurrent - q;
          await db
            .update(products)
            .set({ stockCurrent: newStock })
            .where(eq(products.id, item.productId));
        }
      }
    }

    return NextResponse.json({
      success: true,
      saleId,
      total,
      status: saleStatus,
      message: isSuspectedFraud 
        ? '⚠️ Venda bloqueada por divergência no Self-Checkout. Gerente notificado!' 
        : 'Venda realizada com sucesso!',
    });
  } catch (error: unknown) {
    console.error('Erro no checkout do PDV:', error);
    const msg = error instanceof Error ? error.message : 'Erro interno no processamento da venda.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}