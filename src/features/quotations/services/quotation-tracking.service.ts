import { QuotationTrackingResponse } from '../types/tracking.types';

export async function getQuotationTracking(id: string, signal?: AbortSignal): Promise<QuotationTrackingResponse> {
  const response = await fetch(`/api/quotations/${id}/tracking`, { signal });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Não foi possível carregar os dados da cotação.');
  }

  return {
    quotation: data.quotation,
    tracking: Array.isArray(data.tracking) ? data.tracking : [],
  };
}

export async function publishQuotationService(quotationId: string, quotationSupplierId: string): Promise<void> {
  const response = await fetch('/api/quotations/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ quotationId, quotationSupplierId }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Não foi possível enviar a cotação.');
  }
}