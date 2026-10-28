import { MappedProduct, QuotationSupplier, UnrequestedSummaryItem } from '../types/quotation-response.types';

export function getUnrequestedSummary(
  productsList: MappedProduct[],
  suppliers: QuotationSupplier[],
  selectedChoices: Record<string, string>,
  ignoredProducts: Set<string>
): UnrequestedSummaryItem[] {
  return productsList
    .filter((product) => ignoredProducts.has(product.productId) || !selectedChoices[product.productId])
    .map((product) => {
      const hasResponse = suppliers.some((supplier) => {
        const response = product.responses[supplier.id];
        return response && !response.outOfStock && response.price > 0;
      });
      return {
        product,
        reason: ignoredProducts.has(product.productId)
          ? 'Não comprar: escolha do lojista'
          : hasResponse
          ? 'Não comprado: fornecedor não selecionado'
          : 'Não atendido: nenhuma distribuidora informou disponibilidade',
      };
    });
}