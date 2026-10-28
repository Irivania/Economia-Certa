import { useCallback } from 'react';
import { MappedProduct, QuotationSupplier } from '../types/quotation-response.types';
import { calculateSmartChoices } from '../calculators/smart-quotation.calculator';

interface UseSupplierSelectionProps {
  productsList: MappedProduct[];
  suppliers: QuotationSupplier[];
  setSelectedChoices: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  ignoredProducts: Set<string>;
  setIgnoredProducts: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function useSupplierSelection({
  productsList,
  suppliers,
  setSelectedChoices,
  ignoredProducts,
  setIgnoredProducts,
}: UseSupplierSelectionProps) {
  const handleSmartQuote = useCallback(() => {
    const newChoices = calculateSmartChoices(productsList, suppliers, ignoredProducts);
    setSelectedChoices(newChoices);
  }, [productsList, suppliers, ignoredProducts, setSelectedChoices]);

  const handleSelectChoice = useCallback((productId: string, supplierId: string) => {
    if (ignoredProducts.has(productId)) return;
    setSelectedChoices((current) => {
      const updated = { ...current };
      if (!supplierId || updated[productId] === supplierId) {
        delete updated[productId];
      } else {
        updated[productId] = supplierId;
      }
      return updated;
    });
  }, [ignoredProducts, setSelectedChoices]);

  const handleToggleIgnoredProduct = useCallback((productId: string) => {
    setIgnoredProducts((current) => {
      const next = new Set(current);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
        setSelectedChoices((choices) => {
          const updated = { ...choices };
          delete updated[productId];
          return updated;
        });
      }
      return next;
    });
  }, [setIgnoredProducts, setSelectedChoices]);

  const handleSelectAllForSupplier = useCallback((supplierId: string) => {
    setSelectedChoices((current) => {
      const newChoices = { ...current };
      productsList.forEach((prod) => {
        if (ignoredProducts.has(prod.productId)) return;
        const resp = prod.responses[supplierId];
        if (resp && !resp.outOfStock && resp.price > 0) {
          newChoices[prod.productId] = supplierId;
        }
      });
      return newChoices;
    });
  }, [productsList, ignoredProducts, setSelectedChoices]);

  return {
    handleSmartQuote,
    handleSelectChoice,
    handleToggleIgnoredProduct,
    handleSelectAllForSupplier,
  };
}