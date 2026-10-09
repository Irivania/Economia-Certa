import { NextRequest, NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/db/db';
import {
  purchaseOrderItems,
  purchaseOrders,
  quotationSuppliers,
  supplierBrands,
  suppliers,
} from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    const supplierId = request.nextUrl.searchParams.get('supplierId');
    const companyId = request.nextUrl.searchParams.get('companyId');

    if (!supplierId && !companyId) {
      return NextResponse.json({ error: 'supplierId ou companyId é obrigatório.' }, { status: 400 });
    }

    const orders = await db
      .select({
        id: purchaseOrders.id,
        quotationId: purchaseOrders.quotationId,
        quotationSupplierId: purchaseOrders.quotationSupplierId,
        companyId: purchaseOrders.companyId,
        supplierId: purchaseOrders.supplierId,
        supplierName: suppliers.name,
        brandId: supplierBrands.id,
        brandName: supplierBrands.tradeName,
        paymentTerms: purchaseOrders.paymentTerms,
        status: purchaseOrders.status,
        totalAmount: purchaseOrders.totalAmount,
        createdAt: purchaseOrders.createdAt,
        receivedAt: purchaseOrders.receivedAt,
        closedAt: purchaseOrders.closedAt,
      })
      .from(purchaseOrders)
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
      .leftJoin(
        quotationSuppliers,
        eq(purchaseOrders.quotationSupplierId, quotationSuppliers.id),
      )
      .leftJoin(supplierBrands, eq(quotationSuppliers.brandId, supplierBrands.id))
      .where(
        supplierId
          ? eq(purchaseOrders.supplierId, supplierId)
          : eq(purchaseOrders.companyId, companyId as string),
      );

    const orderIds = orders.map((order) => order.id);
    const items = orderIds.length
      ? await db
          .select()
          .from(purchaseOrderItems)
          .where(inArray(purchaseOrderItems.orderId, orderIds))
      : [];

    return NextResponse.json(
      orders.map((order) => ({
        ...order,
        totalAmount: Number(order.totalAmount),
        items: items
          .filter((item) => item.orderId === order.id)
          .map((item) => ({
            ...item,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            subtotal: Number(item.subtotal),
          })),
      })),
    );
  } catch (error) {
    console.error('Erro ao buscar pedidos do portal:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar pedidos.' }, { status: 500 });
  }
}
