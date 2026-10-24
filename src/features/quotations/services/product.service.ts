import { apiFetch } from '@/lib/apiClient';
import { ProductFromDb, CreateProductPayload } from '../types/product.types';

export async function getProducts(signal?: AbortSignal): Promise<ProductFromDb[]> {
  const response = await apiFetch('/api/products', { signal });
  if (!response.ok) return [];

  const data = await response.json();
  const rawList = Array.isArray(data)
    ? data
    : data?.products || data?.data || [];

  return Array.isArray(rawList) ? rawList : [];
}

// --- ALIASES E COMPATIBILIDADE PARA MÓDULOS LEGADOS ---
export const fetchCatalogProducts = getProducts;

export async function createProductItem(payload?: CreateProductPayload | unknown): Promise<void> {
  if (payload) {
    // Evita aviso de variável não utilizada
  }
  throw new Error('Função não implementada no serviço modularizado de cotações.');
}