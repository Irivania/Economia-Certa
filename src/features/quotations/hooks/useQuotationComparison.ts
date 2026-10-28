import { useState, useEffect } from 'react';
import { Quotation, MappedProduct, QuotationSupplier } from '../types/quotation-response.types';
import { fetchQuotationComparison } from '../services/quotation-comparison.service';
import { buildProductsMap } from '../mappers/quotation-comparison.mapper';
import { calculateSmartChoices } from '../calculators/smart-quotation.calculator';

export function useQuotationComparison(quotationId: string) {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [productsList, setProductsList] = useState<MappedProduct[]>([]);
  const [suppliers, setSuppliers] = useState<QuotationSupplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
  const [ignoredProducts, setIgnoredProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!quotationId) {
        if (isMounted) {
          setError('Identificador de cotação inválido.');
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) setLoading(true);
        const data = await fetchQuotationComparison(quotationId);
        
        if (!isMounted) return;

        setQuotation(data);

        const rawItems = data.items || [];
        const supList = data.suppliers || [];
        const supplierItems = data.supplierItems || [];

        setSuppliers(supList);
        const mapped = buildProductsMap(rawItems, supList, supplierItems);
        setProductsList(mapped.productsList);

        const initialChoices = calculateSmartChoices(mapped.productsList, supList, new Set());
        setSelectedChoices(initialChoices);
      } catch (err: unknown) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : 'Não foi possível carregar o mapa comparativo.';
        setError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [quotationId]);

  return {
    quotation,
    productsList,
    suppliers,
    loading,
    error,
    selectedChoices,
    setSelectedChoices,
    ignoredProducts,
    setIgnoredProducts,
  };
}