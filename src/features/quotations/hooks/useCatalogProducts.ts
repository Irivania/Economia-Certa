'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ProductFromDb, CreateProductPayload } from '../types/product.types';
import { getProducts, createProductItem } from '../services/product.service';

export function useCatalogProducts() {
  const [catalogProducts, setCatalogProducts] = useState<ProductFromDb[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts(signal);
      setCatalogProducts(data);
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        console.error(err);
        setError('Não foi possível carregar o catálogo de produtos.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const isMountedRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      void loadProducts(controller.signal);
    }

    return () => {
      controller.abort();
    };
  }, [loadProducts]);

  const quickRegisterProduct = useCallback(async (payload: CreateProductPayload) => {
    try {
      await createProductItem(payload);
      await loadProducts();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [loadProducts]);

  return {
    catalogProducts,
    loading,
    error,
    refreshCatalog: loadProducts,
    quickRegisterProduct,
  };
}

// --- ALIAS DE COMPATIBILIDADE PARA MÓDULOS LEGADOS ---
export const fetchCatalogProducts = getProducts;