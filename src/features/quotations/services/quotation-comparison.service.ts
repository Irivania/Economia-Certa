import { Quotation } from '../types/quotation-response.types';
import { mapQuotationData } from '../mappers/quotation-comparison.mapper';

export async function fetchQuotationComparison(quotationId: string): Promise<Quotation> {
  const res = await fetch(`/api/quotations/${quotationId}`);
  if (!res.ok) throw new Error('Não foi possível carregar os dados da cotação.');
  const data = await res.json();
  return mapQuotationData(data);
}