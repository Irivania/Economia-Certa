import { SupplierGroup } from '../types/quotation-response.types';

export function calculateSummaryTotal(selectedBySupplier: SupplierGroup[]): number {
  return selectedBySupplier.reduce(
    (total, group) => total + group.items.reduce(
      (groupTotal, product) => groupTotal + (product.responses[group.supplier.id]?.price || 0) * product.requestedQuantity,
      0,
    ),
    0,
  );
}