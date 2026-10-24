'use client';

import { useState, useEffect, useCallback } from 'react';
import { Supplier } from '../types/supplier.types';
import { fetchSuppliers } from '../services/supplier.service';

export function useQuotationSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoadingSuppliers(true);
        const data = await fetchSuppliers();
        if (isMounted) setSuppliers(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoadingSuppliers(false);
      }
    }
    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleSupplier = useCallback((supplierId: string) => {
    setSelectedSupplierIds((current) =>
      current.includes(supplierId) ? current.filter((id) => id !== supplierId) : [...current, supplierId]
    );
  }, []);

  const handleSelectAllSuppliers = useCallback(() => {
    setSelectedSupplierIds(suppliers.map((sup) => sup.id));
  }, [suppliers]);

  const handleDeselectAllSuppliers = useCallback(() => {
    setSelectedSupplierIds([]);
  }, []);

  return {
    suppliers,
    selectedSupplierIds,
    loadingSuppliers,
    toggleSupplier,
    handleSelectAllSuppliers,
    handleDeselectAllSuppliers,
  };
}