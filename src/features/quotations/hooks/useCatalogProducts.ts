'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product, CreateProductPayload } from '../types/product.types';
import { fetchCatalogProducts, createProductItem } from '../services/product.service';

export function useCatalogProducts() {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await fetchCatalogProducts();
      setCatalogProducts(list);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os dados iniciais.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      if (!isMounted) return;
      await loadProducts();
    }
    void init();
    return () => {
      isMounted = false;
    };
  }, [loadProducts]);

  const quickRegisterProduct = useCallback(async (payload: CreateProductPayload) => {
    await createProductItem(payload);
    await loadProducts();
  }, [loadProducts]);

  return {
    catalogProducts,
    loading,
    error,
    refreshCatalog: loadProducts,
    quickRegisterProduct,
  };
}