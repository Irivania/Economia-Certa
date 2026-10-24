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

// --- TIPOS ADICIONADOS PARA O MÓDULO DE CRIAÇÃO DE COTAÇÕES ---

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