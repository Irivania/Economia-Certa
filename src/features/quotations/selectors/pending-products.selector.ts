import { MappedProduct, QuotationSupplier } from '../types/quotation-response.types';

export function getPendingProducts(productsList: MappedProduct[], suppliers: QuotationSupplier[], selectedChoices: Record<string, string>, ignoredProducts: Set<string>): MappedProduct[] {
  return productsList.filter((prod) => {
    const hasChoice = selectedChoices[prod.productId];
    const allOutOfStock = suppliers.every((sup) => {
      const resp = prod.responses[sup.id];
      return !resp || resp.outOfStock || resp.price === 0;
    });
    return !ignoredProducts.has(prod.productId) && (!hasChoice || allOutOfStock);
  });
}