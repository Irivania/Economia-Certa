import { MappedProduct, QuotationSupplier } from '../types/quotation-response.types';

export function calculateSmartChoices(productsList: MappedProduct[], suppliers: QuotationSupplier[], ignoredProducts: Set<string>): Record<string, string> {
  const newChoices: Record<string, string> = {};
  productsList.forEach((prod) => {
    if (ignoredProducts.has(prod.productId)) return;
    let bestSup = '';
    let lowest = Infinity;
    suppliers.forEach((sup) => {
      const resp = prod.responses[sup.id];
      if (resp && !resp.outOfStock && resp.price > 0 && resp.price < lowest) {
        lowest = resp.price;
        bestSup = sup.id;
      }
    });
    if (bestSup) newChoices[prod.productId] = bestSup;
  });
  return newChoices;
}