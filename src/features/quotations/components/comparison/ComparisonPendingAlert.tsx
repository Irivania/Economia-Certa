import { QuotationPendingAlert as BaseAlert } from '@/components/quotations/QuotationPendingAlert';

interface ComparisonPendingAlertProps {
  isDarkMode: boolean;
  pendingCount: number;
}

export function ComparisonPendingAlert({ isDarkMode, pendingCount }: ComparisonPendingAlertProps) {
  return <BaseAlert isDarkMode={isDarkMode} pendingCount={pendingCount} />;
}