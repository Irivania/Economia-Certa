import { useCallback } from 'react';
import { MappedProduct, QuotationSupplier } from '../types/quotation-response.types';
import { exportQuotationSelectionToCsv } from '../services/quotation-export.service';

interface UseQuotationExportProps {
  productsList: MappedProduct[];
  suppliers: QuotationSupplier[];
  selectedChoices: Record<string, string>;
  ignoredProducts: Set<string>;
  quotationTitle: string;
}

export function useQuotationExport({
  productsList,
  suppliers,
  selectedChoices,
  ignoredProducts,
  quotationTitle,
}: UseQuotationExportProps) {
  const handleExportSelection = useCallback(() => {
    exportQuotationSelectionToCsv(productsList, suppliers, selectedChoices, ignoredProducts, quotationTitle);
  }, [productsList, suppliers, selectedChoices, ignoredProducts, quotationTitle]);

  return {
    handleExportSelection,
  };
}