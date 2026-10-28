import { QuotationHeader } from '@/components/quotations/QuotationHeader';

interface ComparisonHeaderProps {
  title: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  saving: boolean;
  onSmartQuote: () => void;
  onExportSelection: () => void;
  onFinalize: () => void;
}

export function ComparisonHeader(props: ComparisonHeaderProps) {
  return <QuotationHeader {...props} />;
}