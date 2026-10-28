import { MappedProduct, QuotationSupplier, SupplierGroup } from '../types/quotation-response.types';

export function getSelectedBySupplier(productsList: MappedProduct[], suppliers: QuotationSupplier[], selectedChoices: Record<string, string>): SupplierGroup[] {
  return suppliers.map((supplier) => ({
    supplier,
    items: productsList.filter((product) => selectedChoices[product.productId] === supplier.id),
  })).filter((group) => group.items.length > 0);
}