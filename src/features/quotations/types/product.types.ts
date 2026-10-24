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

export interface CreateProductPayload {
  companyId: string;
  description: string;
  code?: string | null;
  salePrice: number;
  stockIdeal: number;
  stockCurrent: number;
}