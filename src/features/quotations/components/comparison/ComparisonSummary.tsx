import { QuotationOrdersSummary } from '@/components/quotations/QuotationOrdersSummary';
import { SupplierGroup, UnrequestedSummaryItem } from '../../types/quotation-response.types';

interface ComparisonSummaryProps {
  isDarkMode: boolean;
  totalItemsCount: number;
  unrequestedCount: number;
  summaryTotal: number;
  selectedBySupplier: SupplierGroup[];
  unrequestedSummary: UnrequestedSummaryItem[];
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  paymentTerms?: string | null;
  formatCurrency: (val: number) => string;
  formatDate: (val?: string | Date | null) => string;
}

export function ComparisonSummary(props: ComparisonSummaryProps) {
  return <QuotationOrdersSummary {...props} />;
}