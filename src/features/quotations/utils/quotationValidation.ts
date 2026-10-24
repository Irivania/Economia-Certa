import { CreateQuotationFormData, QuotationItem } from '../types/quotation.types';

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export function validateQuotationPayload(
  form: CreateQuotationFormData,
  selectedSupplierIds: string[],
  quotationItems: QuotationItem[]
): ValidationResult {
  if (!form.title.trim() || !form.paymentTerms.trim() || selectedSupplierIds.length === 0 || quotationItems.length === 0) {
    return {
      isValid: false,
      error: 'Preencha todos os campos obrigatórios, selecione fornecedores e adicione itens.',
    };
  }

  return {
    isValid: true,
    error: null,
  };
}