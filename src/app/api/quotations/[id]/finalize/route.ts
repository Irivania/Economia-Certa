import { NextRequest, NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/db/db';
import {
  purchaseOrderItems,
  purchaseOrders,
  quotations,
  quotationItems,
  quotationSuppliers,
  suppliers,
  auditLogs,
  quotationUnrequestedItems,
} from '@/db/schema';

type RouteContext = { params: Promise<{ id: string }> };
type PurchaseOrderStatus = 'SENT' | 'DISPATCHED' | 'RECEIVED' | 'CLOSED';

type OrderItem = {
  productId: string;
  description: string;
  imageUrl?: string | null;
  quantity: number;
  price: number;
};

type UnrequestedItem = {
  productId: string;
  description: string;
  imageUrl?: string | null;
  quantity: number;
  reason: string;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id: quotationId } = await context.params;
    const items = await db
      .select()
      .from(quotationUnrequestedItems)
      .where(eq(quotationUnrequestedItems.quotationId, quotationId));

    return NextResponse.json({
      unrequestedItems: items.map((item) => ({
        productId: item.productId,
        description: item.description,
        imageUrl: item.imageUrl,
        quantity: Number(item.quantity),
        reason: item.reason,
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar itens não pedidos:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar itens não pedidos.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: quotationId } = await context.params;
    const body = await request.json() as {
      orders?: Record<string, OrderItem[]>;
      unrequestedItems?: UnrequestedItem[];
      paymentTerms?: string;
    };

    const orders = body.orders || {};
    const unrequestedItems = body.unrequestedItems || [];
    const selectedSupplierIds = Object.keys(orders);
    const result = await db.transaction(async (tx) => {
      const [quotation] = await tx
        .select()
        .from(quotations)
        .where(eq(quotations.id, quotationId));

      if (!quotation) return { error: 'Cotação não encontrada.', status: 404 as const };

      const quotationSupplierRows = selectedSupplierIds.length
        ? await tx
          .select({
            supplierId: quotationSuppliers.supplierId,
            quotationSupplierId: quotationSuppliers.id,
            status: quotationSuppliers.status,
          })
          .from(quotationSuppliers)
          .where(and(
            eq(quotationSuppliers.quotationId, quotationId),
            inArray(quotationSuppliers.supplierId, selectedSupplierIds),
          ))
        : [];
      const suppliersById = new Map(
        quotationSupplierRows.map((row) => [row.supplierId, row]),
      );
      const quotationItemRows = await tx
      .select({ productId: quotationItems.productId })
      .from(quotationItems)
      .where(eq(quotationItems.quotationId, quotationId));
      const quotationProductIds = new Set(quotationItemRows.map((item) => item.productId));
      const invalidUnrequestedItem = unrequestedItems.find(
        (item) => !quotationProductIds.has(item.productId),
      );
      if (invalidUnrequestedItem) {
        return { error: 'Um item não pedido não pertence a esta cotação.', status: 400 as const };
      }
      for (const item of unrequestedItems) {
        await tx
          .insert(quotationUnrequestedItems)
          .values({
            quotationId,
            productId: item.productId,
            description: item.description,
            imageUrl: item.imageUrl || null,
            quantity: String(item.quantity),
            reason: item.reason,
          })
          .onConflictDoNothing();
      }
      const createdOrders = [];

      for (const [supplierId, items] of Object.entries(orders)) {
      if (!items.length) continue;

      const quotationSupplier = suppliersById.get(supplierId);
      if (!quotationSupplier) {
          return { error: 'Uma das empresas selecionadas não participa desta cotação.', status: 400 as const };
      }

      const invalidProduct = items.find((item) => !quotationProductIds.has(item.productId));
      if (invalidProduct) {
          return { error: 'O pedido contém um produto que não pertence a esta cotação.', status: 400 as const };
      }

        const [supplier] = await tx
        .select({ id: suppliers.id })
        .from(suppliers)
        .where(eq(suppliers.id, supplierId));

      if (!supplier) continue;

      const [existingOrder] = await tx
        .select()
        .from(purchaseOrders)
        .where(and(
          eq(purchaseOrders.quotationId, quotationId),
          eq(purchaseOrders.supplierId, supplierId),
        ));
      if (existingOrder) {
          createdOrders.push(existingOrder);
        continue;
      }

      const totalAmount = items.reduce(
        (total, item) => total + Number(item.price) * Number(item.quantity),
        0,
      );

        const [order] = await tx
        .insert(purchaseOrders)
        .values({
          quotationId,
          companyId: quotation.companyId,
          supplierId,
          paymentTerms: body.paymentTerms || quotation.paymentTerms || null,
          status: 'SENT',
          totalAmount: totalAmount.toFixed(2),
        })
        .returning();

        await tx.insert(purchaseOrderItems).values(
        items.map((item) => ({
          id: crypto.randomUUID(),
          orderId: order.id,
          productId: item.productId,
          description: item.description,
          imageUrl: item.imageUrl || null,
          quantity: String(item.quantity),
          unitPrice: Number(item.price).toFixed(2),
          subtotal: (Number(item.price) * Number(item.quantity)).toFixed(2),
        })),
      );

      createdOrders.push(order);
    }

      if (!createdOrders.length && !unrequestedItems.length) {
        return { error: 'Nenhum pedido válido foi selecionado.', status: 400 as const };
      }

      await tx
      .update(quotations)
      .set({ status: 'ORDERED' })
      .where(eq(quotations.id, quotationId));

      return { success: true as const, orders: createdOrders };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro ao registrar pedidos da cotação:', error);
    return NextResponse.json({ error: 'Erro interno ao registrar pedidos.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id: quotationId } = await context.params;
    const body = await request.json() as {
      orderId?: string;
      status?: Exclude<PurchaseOrderStatus, 'SENT'>;
      actorRole?: 'REPRESENTATIVE' | 'STORE';
    };
    const allowedStatuses: Array<Exclude<PurchaseOrderStatus, 'SENT'>> = [
      'DISPATCHED',
      'RECEIVED',
      'CLOSED',
    ];

    if (!body.orderId || !body.status || !allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'orderId e status válido são obrigatórios.' }, { status: 400 });
    }

    const result = await db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(purchaseOrders)
        .where(and(eq(purchaseOrders.id, body.orderId!), eq(purchaseOrders.quotationId, quotationId)));

      if (!order) return { error: 'Pedido não encontrado.', status: 404 as const };
      const transitions: Record<string, string[]> = {
        SENT: ['DISPATCHED', 'RECEIVED'],
        DISPATCHED: ['RECEIVED'],
        RECEIVED: ['CLOSED'],
        CLOSED: [],
      };
      if (!transitions[order.status]?.includes(body.status!)) {
        return { error: `Transição inválida: ${order.status} para ${body.status}.`, status: 409 as const };
      }

      const now = new Date();
      const [updated] = await tx
      .update(purchaseOrders)
      .set({
        status: body.status,
        receivedAt: body.status === 'RECEIVED' ? now : order.receivedAt,
        closedAt: body.status === 'CLOSED' ? now : order.closedAt,
      })
      .where(eq(purchaseOrders.id, body.orderId!))
      .returning();

      await tx.insert(auditLogs).values({
        companyId: order.companyId,
        quotationId,
        supplierId: order.supplierId,
        action: `PURCHASE_ORDER_${body.status}`,
        details: `Pedido ${order.id} alterado de ${order.status} para ${body.status}.`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      });

      if (body.status === 'CLOSED') {
        const quotationOrders = await tx
          .select({ status: purchaseOrders.status })
          .from(purchaseOrders)
          .where(eq(purchaseOrders.quotationId, quotationId));
        const quotationStatus = quotationOrders.length > 0 &&
          quotationOrders.every((quotationOrder) => quotationOrder.status === 'CLOSED')
          ? 'CLOSED'
          : 'PARTIALLY_CLOSED';
        await tx
        .update(quotations)
        .set({ status: quotationStatus })
        .where(eq(quotations.id, quotationId));
      }

      return { success: true as const, order: updated };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar pedido.' }, { status: 500 });
  }
}
