export interface QuotationItem {
  id: string;
  productId: string;
  supplierId?: string | null;
  requestedQuantity?: number | string | null;
  price?: number | string | null;
  outOfStock?: boolean | null;
  description?: string;
  brand?: string | null;
  ean?: string | null;
  imageUrl?: string | null;
  sellingPrice?: number | string | null;
}

export interface QuotationSupplier {
  id: string;
  supplierId: string;
  brandId?: string | null;
  brandName?: string | null;
  name?: string | null;
  status?: string | null;
  observation?: string | null;
}

export interface QuotationSupplierItem {
  id: string;
  quotationSupplierId: string;
  productId: string;
  price: string | number;
  outOfStock: boolean | null;
}

export interface Quotation {
  id: string;
  title: string;
  paymentTerms?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  suppliers?: QuotationSupplier[];
  items?: QuotationItem[];
  supplierItems?: QuotationSupplierItem[];
}

export interface MappedProductResponse {
  price: number;
  outOfStock: boolean;
}

export interface MappedProduct {
  productId: string;
  description: string;
  ean?: string | null;
  brand?: string | null;
  imageUrl?: string | null;
  requestedQuantity: number;
  sellingPrice: number;
  responses: Record<string, MappedProductResponse>;
}

export interface SupplierGroup {
  supplier: QuotationSupplier;
  items: MappedProduct[];
}

export interface UnrequestedSummaryItem {
  product: MappedProduct;
  reason: string;
}