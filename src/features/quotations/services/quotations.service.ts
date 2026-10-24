import { apiFetch } from '@/lib/apiClient';
import { Quotation, CreateQuotationApiPayload as CreateQuotationRequest, UpdateQuotationRequest } from '../types/quotation.types';

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