'use client';

import { useState, useCallback } from 'react';
import { QuotationItem } from '../types/quotation.types';
import { Product } from '../types/product.types';
import { calculateStockSuggestion } from '../utils/stockSuggestion';

export function useQuotationItems() {
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleRemoveItem = useCallback((id: string) => {
    setQuotationItems((prev) => prev.filter((item) => item.id !== id && item.productId !== id));
  }, []);

  const handleUpdateQuantity = useCallback((id: string, qty: number) => {
    setQuotationItems((prev) =>
      prev.map((i) => (i.id === id || i.productId === id ? { ...i, requestedQuantity: qty } : i))
    );
  }, []);

  const handleApplyStockSuggestion = useCallback(() => {
    setQuotationItems((prev) => calculateStockSuggestion(prev));
  }, []);

  const handleAddSelectedProducts = useCallback((selectedProductIds: string[], catalogProducts: Product[]) => {
    const productsToAdd = catalogProducts.filter((p) => selectedProductIds.includes(p.id));

    const newItems: QuotationItem[] = productsToAdd
      .filter((p) => !quotationItems.some((existing) => existing.productId === p.id))
      .map((p) => {
        const stockCurrent = p.stockCurrent || 0;
        const stockIdeal = p.stockIdeal || 0;
        const autoQty = stockIdeal > stockCurrent ? stockIdeal - stockCurrent : 0;

        return {
          id: p.id,
          productId: p.id,
          description: p.description,
          brand: p.brand || null,
          ean: p.ean || null,
          imageUrl: p.imageUrl || null,
          stockCurrent,
          stockIdeal,
          requestedQuantity: autoQty,
        };
      });

    setQuotationItems((prev) => [...prev, ...newItems]);
  }, [quotationItems]);

  const handleImportComplete = useCallback((itensImportados: QuotationItem[]) => {
    setQuotationItems((prev) => {
      const existingIds = new Set(prev.map((i) => i.productId));
      const novos = itensImportados.filter((i) => !existingIds.has(i.productId));
      return [...prev, ...novos];
    });
  }, []);

  return {
    quotationItems,
    searchTerm,
    setSearchTerm,
    handleRemoveItem,
    handleUpdateQuantity,
    handleApplyStockSuggestion,
    handleAddSelectedProducts,
    handleImportComplete,
  };
}