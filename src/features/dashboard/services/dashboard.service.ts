import { apiFetch } from '@/lib/apiClient';
import { Product, QuotationRaw } from '../types/dashboard.types';

export const dashboardService = {
  async fetchProducts(signal?: AbortSignal): Promise<Product[]> {
    const res = await apiFetch('/api/products', { signal });
    if (!res.ok) throw new Error('Falha ao carregar produtos.');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async fetchQuotations(signal?: AbortSignal): Promise<QuotationRaw[]> {
    const res = await apiFetch('/api/quotations', { signal });
    if (!res.ok) throw new Error('Falha ao carregar cotações.');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },
};