import { apiFetch } from '@/lib/apiClient';
import { UnrequestedItem, OrderStatus, OrderItem } from '../types/order.types';

export interface PersistedOrderResponse {
  supplierId: string;
  quotationSupplierId?: string | null;
  status: OrderStatus;
}

export const QuotationOrdersService = {
  async getPersistedOrders(companyId: string): Promise<PersistedOrderResponse[]> {
    const response = await apiFetch(`/api/portal/orders?companyId=${companyId}`);
    if (!response.ok) return [];
    const data = await response.json();
    const rawOrders = Array.isArray(data) ? data : data?.orders || [];
    return Array.isArray(rawOrders) ? rawOrders : [];
  },

  async getUnrequestedItems(quotationId: string): Promise<UnrequestedItem[]> {
    const response = await apiFetch(`/api/quotations/${quotationId}/finalize`);
    if (!response.ok) return [];
    const data = await response.json();
    return data?.unrequestedItems || [];
  },

  async finalizeOrder(
    quotationId: string, 
    payload: { orders: Record<string, OrderItem[]>; paymentTerms: string; unrequestedItems: UnrequestedItem[] }
  ): Promise<Record<string, unknown>> {
    const response = await apiFetch(`/api/quotations/${quotationId}/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || result.message || 'Não foi possível enviar o pedido.');
    }
    return result;
  },

  async updateOrderStatus(
    quotationId: string, 
    payload: { orderId: string; status: OrderStatus; actorRole: string }
  ): Promise<Record<string, unknown>> {
    const response = await apiFetch(`/api/quotations/${quotationId}/finalize`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'Não foi possível atualizar o status do pedido.');
    }
    return response.json();
  }
};