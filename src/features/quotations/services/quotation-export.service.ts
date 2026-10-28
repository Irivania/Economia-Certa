import { MappedProduct, QuotationSupplier } from '../types/quotation-response.types';
import { generateCsvBlob, downloadBlob } from '../utils/csv.utils';

export function exportQuotationSelectionToCsv(productsList: MappedProduct[], suppliers: QuotationSupplier[], selectedChoices: Record<string, string>, ignoredProducts: Set<string>, quotationTitle: string): void {
  const headers = ['Produto', 'EAN', 'Quantidade', 'Distribuidora escolhida', 'Preço unitário', 'Total', 'Decisão'];
  const rows = productsList.map((product) => {
    const supplierId = selectedChoices[product.productId];
    const supplier = suppliers.find((item) => item.id === supplierId);
    const response = supplierId ? product.responses[supplierId] : undefined;
    const ignored = ignoredProducts.has(product.productId);
    const quantity = product.requestedQuantity;
    const price = response?.price || 0;
    return [
      product.description,
      product.ean || '',
      quantity,
      supplier?.name || '',
      price.toFixed(2),
      (price * quantity).toFixed(2),
      ignored ? 'Não comprar' : supplier ? 'Comprar' : 'Sem seleção',
    ];
  });

  const blob = generateCsvBlob(headers, rows);
  const sanitizedTitle = quotationTitle.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  downloadBlob(blob, `decisao-${sanitizedTitle}.csv`);
}