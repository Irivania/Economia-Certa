'use client';

import { useState, useEffect } from 'react';
import { Quotation } from '../types/quotation.types';
import { TrackingSupplier } from '../types/tracking.types';
import { getQuotationTracking } from '../services/quotation-tracking.service';

export function useQuotationTracking(id: string) {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [tracking, setTracking] = useState<TrackingSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateSupplierStatusLocally = (supplierId: string, newStatus: string) => {
    setTracking((current) =>
      current.map((item) => (item.id === supplierId ? { ...item, status: newStatus } : item))
    );
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getQuotationTracking(id, controller.signal);
        setQuotation(data.quotation);
        setTracking(data.tracking);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error(err);
        setError(err instanceof Error ? err.message : 'Não foi possível carregar os dados da cotação.');
      } finally {
        setLoading(false);
      }
    }

    void loadData();

    return () => {
      controller.abort();
    };
  }, [id]);

  return {
    quotation,
    tracking,
    loading,
    error,
    updateSupplierStatusLocally,
  };
}