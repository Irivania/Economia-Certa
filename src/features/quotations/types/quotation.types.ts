export type QuotationStatus =
  | 'OPEN'
  | 'ORDERED'
  | 'PARTIALLY_CLOSED'
  | 'CLOSED'
  | 'CANCELLED';

export type SupplierStatus =
  | 'ENVIADO'
  | 'RESPONDIDO'
  | 'CANCELLED';

export interface SupplierTracking {
  id: string;
  name: string;
  status: SupplierStatus | string;
}

export interface Quotation {
  id: string;
  title: string;
  paymentTerms?: string | null;
  status?: QuotationStatus | string | null;
  startDate?: string | null;
  endDate?: string | null;
  closingTime?: string | null;
  suppliers?: SupplierTracking[];
}

// --- ITENS E PAYLOADS DE CRIAÇÃO / EDIÇÃO ---

export interface QuotationItem {
  id: string;
  productId: string;
  description: string;
  brand: string | null;
  ean: string | null;
  imageUrl?: string | null;
  stockCurrent: number;
  stockIdeal: number;
  requestedQuantity: number;
  costPrice?: number;
}

export interface ApiQuotationItem {
  id?: string;
  productId?: string;
  description?: string;
  requestedQuantity?: number | string;
  costPrice?: number | string;
}

export interface ApiSupplierLink {
  id: string;
  name?: string;
  status?: string;
  token?: string;
}

export interface ApiQuotation {
  id: string;
  title?: string;
  paymentTerms?: string | null;
  showQuantities?: boolean | null;
  supplierId?: string | null;
  suppliers?: ApiSupplierLink[];
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  closingTime?: string | null;
  items?: ApiQuotationItem[];
}

export interface CreateQuotationFormData {
  title: string;
  paymentTerms: string;
  startDate: string;
  endDate: string;
  closingTime: string;
  showQuantities: boolean;
}

export interface CreateQuotationApiPayload {
  companyId: string;
  title: string;
  paymentTerms: string;
  supplierIds: string[];
  startDate: string | null;
  endDate: string | null;
  closingTime: string | null;
  showQuantities: boolean;
  items: QuotationItem[];
}

export interface UpdateQuotationRequest extends CreateQuotationApiPayload {
  id: string;
}