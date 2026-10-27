import { apiFetch } from '@/lib/apiClient';
import { 
  Quotation, 
  CreateQuotationApiPayload as CreateQuotationRequest, 
  UpdateQuotationRequest 
} from '../types/quotation.types';
import { UnrequestedItem, OrderStatus, OrderItem } from '../types/order.types';

export async function getQuotations(signal?: AbortSignal): Promise<Quotation[]> {
  const response = await apiFetch('/api/quotations', { signal });
  if (!response.ok) return [];

  const data = await response.json();
  const rawList = Array.isArray(data) ? data : data?.quotations || data?.data || [];

  return Array.isArray(rawList) ? rawList : [];
}

export async function getQuotationById(id: string, signal?: AbortSignal): Promise<Quotation | null> {
  const response = await apiFetch(`/api/quotations/${id}`, { signal });
  if (!response.ok) return null;

  const data = await response.json();
  return data?.quotation || data || null;
}

export async function createQuotation(payload: CreateQuotationRequest): Promise<Quotation> {
  const response = await apiFetch('/api/quotations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao criar a cotação.');
  }

  const data = await response.json();
  return data?.quotation || data;
}

export async function updateQuotation(payload: UpdateQuotationRequest): Promise<Quotation> {
  const response = await apiFetch(`/api/quotations/${payload.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao atualizar o registo da cotação.');
  }

  const data = await response.json();
  return data?.quotation || data;
}

export async function deleteQuotation(id: string): Promise<void> {
  const response = await apiFetch(`/api/quotations/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Erro ao eliminar a cotação.');
  }
}

export async function cancelQuotation(id: string): Promise<void> {
  const response = await apiFetch(`/api/quotations/${id}/cancel`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Erro ao cancelar a cotação.');
  }
}

// --- MÉTODOS DE PEDIDOS E FINALIZAÇÃO DE COTAÇÃO ---

export interface PersistedOrderResponse {
  supplierId: string;
  quotationSupplierId?: string | null;
  status: OrderStatus;
}

export async function getPersistedOrders(companyId: string): Promise<PersistedOrderResponse[]> {
  const response = await apiFetch(`/api/portal/orders?companyId=${companyId}`);
  if (!response.ok) return [];
  const data = await response.json();
  const rawOrders = Array.isArray(data) ? data : data?.orders || [];
  return Array.isArray(rawOrders) ? rawOrders : [];
}

export async function getUnrequestedItems(quotationId: string): Promise<UnrequestedItem[]> {
  const response = await apiFetch(`/api/quotations/${quotationId}/finalize`);
  if (!response.ok) return [];
  const data = await response.json();
  return data?.unrequestedItems || [];
}

export interface FinalizeOrderPayload {
  orders: Record<string, OrderItem[]>;
  paymentTerms: string;
  unrequestedItems: UnrequestedItem[];
}

export async function finalizeOrder(
  quotationId: string, 
  payload: FinalizeOrderPayload
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
}

export interface UpdateOrderStatusPayload {
  orderId: string;
  status: OrderStatus;
  actorRole: string;
}

export async function updateOrderStatusApi(
  quotationId: string, 
  payload: UpdateOrderStatusPayload
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