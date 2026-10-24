import { apiFetch } from '@/lib/apiClient';
import { Product, CreateProductPayload } from '../types/product.types';

export async function fetchCatalogProducts(): Promise<Product[]> {
  const res = await apiFetch('/api/products');
  if (!res.ok) {
    throw new Error('Falha ao carregar produtos do catálogo.');
  }
  const prodData = await res.json();
  const productList = Array.isArray(prodData) ? prodData : prodData.products || prodData.data || [];
  return productList;
}

export async function createProductItem(payload: CreateProductPayload): Promise<Product> {
  const res = await apiFetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao cadastrar produto.');
  }
  return data.product || data;
}