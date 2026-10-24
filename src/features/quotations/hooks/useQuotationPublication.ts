'use client';

import { useState, useCallback } from 'react';
import { publishQuotationService } from '../services/quotation-tracking.service';

export function useQuotationPublication(quotationId: string, onSuccess?: (supplierId: string) => void) {
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const publishQuotation = useCallback(
    async (quotationSupplierId: string) => {
      setSendingId(quotationSupplierId);
      setError(null);
      try {
        await publishQuotationService(quotationId, quotationSupplierId);
        onSuccess?.(quotationSupplierId);
      } catch (err: unknown) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'Não foi possível enviar a cotação.';
        setError(message);
        throw err;
      } finally {
        setSendingId(null);
      }
    },
    [quotationId, onSuccess]
  );

  return {
    publishQuotation,
    sendingId,
    error,
    setError,
  };
}