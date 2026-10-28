import QuotationTable from '@/components/QuotationTable';
import { MappedProduct, QuotationSupplier } from '../../types/quotation-response.types';

interface ComparisonTableProps {
  productsList: MappedProduct[];
  suppliers: QuotationSupplier[];
  paymentTerms?: string | null;
  selectedChoices: Record<string, string>;
  ignoredProducts: Set<string>;
  onToggleIgnoredProduct: (productId: string) => void;
  onSelectChoice: (productId: string, supplierId: string) => void;
  onSelectAllForSupplier: (supplierId: string) => void;
  formatCurrency: (val: number | null | undefined) => string;
}

export function ComparisonTable(props: ComparisonTableProps) {
  return <QuotationTable {...props} />;
}