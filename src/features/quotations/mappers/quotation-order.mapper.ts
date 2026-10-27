import { QuotationSupplier, StoredOrder, OrderItem, ProcessedOrder, UnrequestedItem, OrderStatus } from '../types/order.types';

export function parseAndNormalizeOrders(
  rawJson: string | null
): { paymentTerms: string; orders: Record<string, OrderItem[] | StoredOrder>; unrequestedItems: UnrequestedItem[] } {
  if (!rawJson) {
    return { paymentTerms: '', orders: {}, unrequestedItems: [] };
  }

  try {
    const parsed = JSON.parse(rawJson) as {
      paymentTerms?: string | null;
      orders?: Record<string, OrderItem[] | StoredOrder>;
      unrequestedItems?: UnrequestedItem[];
    };

    return {
      paymentTerms: parsed.paymentTerms || '',
      orders: parsed.orders || {},
      unrequestedItems: Array.isArray(parsed.unrequestedItems) ? parsed.unrequestedItems : [],
    };
  } catch {
    return { paymentTerms: '', orders: {}, unrequestedItems: [] };
  }
}

export function buildProcessedOrders(
  rawOrdersMap: Record<string, OrderItem[] | StoredOrder>,
  suppliers: QuotationSupplier[],
  paymentTerms: string,
  orderStatuses: Record<string, OrderStatus>,
  sentOrderIds: Record<string, string | null>,
  sendingOrders: Record<string, boolean>
): ProcessedOrder[] {
  return Object.entries(rawOrdersMap).map(([orderKey, value]) => {
    const record = value as OrderItem[] | StoredOrder;
    const items = Array.isArray(record) ? record : record.items || [];
    const storedOrderId = !Array.isArray(record) ? record.orderId || null : null;
    const storedStatus = !Array.isArray(record) ? record.status : undefined;

    const supplierInfo = suppliers.find((s) => (s.quotationSupplierId || s.supplierId) === orderKey);
    const supplierName = supplierInfo?.name || 'Distribuidor';
    const totalOrder = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

    return {
      orderKey,
      supplierId: supplierInfo?.supplierId || orderKey,
      supplierName,
      items,
      totalOrder,
      paymentTerms,
      orderId: sentOrderIds[orderKey] || storedOrderId,
      status: orderStatuses[orderKey] || storedStatus,
      isSending: !!sendingOrders[orderKey],
    };
  });
}