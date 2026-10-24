import { apiFetch } from '@/lib/apiClient';
import { Quotation, CreateQuotationApiPayload } from '../types/quotation.types';

export async function getQuotations(signal?: AbortSignal): Promise<Quotation[]> {
  const response = await apiFetch('/api/quotations', { signal });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Erro ao buscar cotações.');
  return Array.isArray(data) ? data : [];
}

export async function deleteQuotationApi(id: string): Promise<void> {
  const response = await apiFetch(`/api/quotations?id=${id}`, { 
    method: 'DELETE' 
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Não foi possível excluir a cotação.');
}

export async function cancelQuotationApi(id: string): Promise<void> {
  const response = await apiFetch('/api/quotations', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, action: 'cancel' }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Não foi possível cancelar a cotação.');
}

// --- MÉTODO ADICIONADO PARA O MÓDULO DE CRIAÇÃO DE COTAÇÕES ---

export async function createQuotationRecord(payload: CreateQuotationApiPayload): Promise<void> {
  const response = await apiFetch('/api/quotations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Não foi possível criar a cotação.');
  }
}