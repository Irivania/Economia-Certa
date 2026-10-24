import { QUOTATION_STATUS_LABELS } from '../constants/quotation.constants';

export function formatQuotationStatus(status?: string | null): string {
  if (!status) return 'Ativa';
  return QUOTATION_STATUS_LABELS[status] || status;
}