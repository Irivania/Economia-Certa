import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { products, productCostHistory, accountsPayable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, supplierName, invoiceNumber, items, boletos } = body;

    if (!companyId || !supplierName || !invoiceNumber || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Dados incompletos para registar a entrada manual.' }, { status: 400 });
    }

    // 1. Processar cada item da nota (Atualizar stock e histórico de custos)
    for (const item of items) {
      if (!item.productId) {
        return NextResponse.json({ error: 'Existem itens sem produto selecionado no catálogo.' }, { status: 400 });
      }

      const qty = Number(item.quantity || 0);
      const cost = Number(item.unitCost || 0);

      if (qty <= 0) {
        return NextResponse.json({ error: 'A quantidade de cada item deve ser maior que zero.' }, { status: 400 });
      }

      // Buscar produto atual para atualizar o stock e o preço de custo
      const [existingProd] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      if (existingProd) {
        const updatedStock = Number(existingProd.stockCurrent || 0) + qty;
        await db
          .update(products)
          .set({
            costPrice: String(cost),
            stockCurrent: updatedStock,
          })
          .where(eq(products.id, item.productId));
      }

      // Registar no histórico de custos do produto
      await db.insert(productCostHistory).values({
        id: crypto.randomUUID(),
        companyId,
        productId: item.productId,
        supplierName,
        invoiceNumber,
        unitCost: String(cost),
        quantity: String(qty),
        purchasedBy: 'Entrada Manual',
      });
    }

    // 2. Registar os boletos/parcelas no Contas a Pagar
    if (Array.isArray(boletos)) {
      for (const bol of boletos) {
        const amountNum = Number(bol.amount || 0);
        if (amountNum > 0) {
          await db.insert(accountsPayable).values({
            id: crypto.randomUUID(),
            companyId,
            supplierName,
            invoiceNumber: `${invoiceNumber} - ${bol.identifier || 'Parcela'}`,
            amount: String(amountNum),
            dueDate: bol.dueDate || new Date().toISOString().split('T')[0],
            status: 'PENDING',
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Entrada manual efetuada, stock atualizado e boletos gerados com sucesso!',
    });
  } catch (error: unknown) {
    console.error('Erro ao processar entrada manual:', error);
    const message = error instanceof Error ? error.message : 'Erro interno ao gravar entrada.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}