interface ValidateQuotationParams {
  title: string;
  paymentTerms: string;
  selectedSupplierIds: string[];
  quotationItems: unknown[];
  startDate: string;
  endDate: string;
}

export function validateQuotationForm({
  title,
  paymentTerms,
  selectedSupplierIds,
  quotationItems,
  startDate,
  endDate,
}: ValidateQuotationParams): string | null {
  if (!title.trim()) {
    return 'Informe um título para a cotação.';
  }

  if (selectedSupplierIds.length === 0) {
    return 'Selecione ao menos um fornecedor.';
  }

  if (!paymentTerms.trim()) {
    return 'Informe a condição de pagamento.';
  }

  if (quotationItems.length === 0) {
    return 'Adicione pelo menos um item à cotação.';
  }

  if (startDate && endDate && endDate < startDate) {
    return 'A data de término deve ser posterior à data de início.';
  }

  return null;
}