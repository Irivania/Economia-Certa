import { Quotation } from './quotation.types';

export type TrackingStatus = 'PENDING' | 'SENT' | 'RESPONDED';

export interface TrackingSupplier {
  id: string;
  supplierId: string;
  brandId?: string | null;
  name: string;
  phone?: string | null;
  status: TrackingStatus | string;
  totalOffered: number;
  token: string;
  isB2BActive?: boolean;
}

export interface QuotationTrackingResponse {
  quotation: Quotation;
  tracking: TrackingSupplier[];
}