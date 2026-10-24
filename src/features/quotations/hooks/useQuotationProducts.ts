'use client';

import { useState, useEffect } from 'react';
import { ProductFromDb } from '../types/product.types';
import { getProducts } from '../services/product.service';

export function useQuotationProducts() {
  const [catalogProducts, setCatalogProducts] = useState<ProductFromDb[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoadingProducts(true);
        const data = await getProducts(controller.signal);
        setCatalogProducts(data);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          console.error(err);
        }
      } finally {
        setLoadingProducts(false);
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  return {
    catalogProducts,
    loadingProducts,
  };
}