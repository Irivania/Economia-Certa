export type OrderStatus = 'SENT' | 'DISPATCHED' | 'RECEIVED' | 'CLOSED';

export interface OrderItem {
  productId: string;
  description: string;
  imageUrl?: string | null;
  quantity: number;
  price: number;
}

export interface StoredOrder {
  orderId?: string;
  status?: OrderStatus;
  items: OrderItem[];
}

export interface UnrequestedItem extends OrderItem {
  reason: string;
}

export interface QuotationSupplier {
  quotationSupplierId?: string;
  supplierId: string;
  name?: string | null;
  observation?: string | null;
}

export interface ParsedOrdersPayload {
  paymentTerms: string;
  orders: Record<string, OrderItem[] | StoredOrder>;
  unrequestedItems: UnrequestedItem[];
}

// Alias enterprise para compatibilidade com os services
export type QuotationOrdersPayload = ParsedOrdersPayload;

export interface ProcessedOrder {
  orderKey: string;
  supplierId: string;
  supplierName: string;
  items: OrderItem[];
  totalOrder: number;
  paymentTerms: string;
  orderId: string | null;
  status?: OrderStatus;
  isSending: boolean;
}