export interface Product {
  id: string;
  description: string;
  brand?: string | null;
  ean?: string | null;
  imageUrl?: string | null;
  stockCurrent: number;
  stockIdeal: number;
  salePrice?: number | string;
  category?: string;
}

// Alias para compatibilidade com os hooks de cotação
export type ProductFromDb = Product;

export interface CreateProductPayload {
  companyId: string;
  description: string;
  code?: string | null;
  salePrice: number;
  stockIdeal: number;
  stockCurrent: number;
}