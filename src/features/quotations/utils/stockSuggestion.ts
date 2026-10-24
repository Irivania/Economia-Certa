import { QuotationItem } from '../types/quotation.types';

export function calculateStockSuggestion(items: QuotationItem[]): QuotationItem[] {
  return items.map((item) => {
    const stockIdeal = item.stockIdeal || 0;
    const stockCurrent = item.stockCurrent || 0;
    const suggestedQty = stockIdeal > stockCurrent ? stockIdeal - stockCurrent : item.requestedQuantity;
    return {
      ...item,
      requestedQuantity: suggestedQty > 0 ? suggestedQty : item.requestedQuantity,
    };
  });
}