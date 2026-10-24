export interface Product {
  id: string;
  description: string;
  internalCode?: string;
  stockCurrent?: number;
  stockMin?: number;
}

export interface QuotationRaw {
  id?: string;
  status?: string | null;
}

export interface DashboardMetricsState {
  productCount: number;
  quotationCount: number;
  completedQuotationCount: number;
  latestQuotationId: string;
  lowStockProducts: Product[];
  loading: boolean;
  error: string | null;
}