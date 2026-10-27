import { QuotationOrdersPayload, OrderItem, StoredOrder } from '../types/order.types';

export const QuotationOrdersStorageService = {
  getStorageKey(quotationId: string): string {
    return `quotation_orders_${quotationId}`;
  },

  getPayload(quotationId: string): QuotationOrdersPayload {
    if (typeof window === 'undefined') {
      return { paymentTerms: '', orders: {}, unrequestedItems: [] };
    }
    try {
      const data = localStorage.getItem(this.getStorageKey(quotationId));
      if (!data) return { paymentTerms: '', orders: {}, unrequestedItems: [] };
      return JSON.parse(data) as QuotationOrdersPayload;
    } catch {
      return { paymentTerms: '', orders: {}, unrequestedItems: [] };
    }
  },

  savePayload(quotationId: string, payload: QuotationOrdersPayload): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.getStorageKey(quotationId), JSON.stringify(payload));
  },

  updateOrderInStorage(
    quotationId: string,
    orderKey: string,
    orderId: string,
    items: OrderItem[]
  ): QuotationOrdersPayload {
    const payload = this.getPayload(quotationId);
    const rawOrders = payload.orders || {};

    const updatedOrders: Record<string, OrderItem[] | StoredOrder> = {
      ...rawOrders,
      [orderKey]: { orderId, status: 'SENT', items },
    };

    const newPayload: QuotationOrdersPayload = {
      ...payload,
      orders: updatedOrders,
    };

    this.savePayload(quotationId, newPayload);
    return newPayload;
  }
};