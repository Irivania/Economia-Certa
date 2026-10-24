import { apiFetch } from '@/lib/apiClient';
import { Supplier } from '../types/supplier.types';

export async function fetchSuppliers(): Promise<Supplier[]> {
  const supRes = await apiFetch('/api/suppliers');
  if (!supRes.ok) {
    throw new Error('Falha ao carregar fornecedores.');
  }
  const supData = await supRes.json();
  return Array.isArray(supData) ? supData : [];
}