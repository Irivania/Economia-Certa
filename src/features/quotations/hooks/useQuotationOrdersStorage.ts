'use client';

import { useState, useEffect, useCallback } from 'react';
import { QuotationOrdersPayload } from '../types/order.types';
import { QuotationOrdersStorageService } from '../services/quotation-orders-storage.service';

export function useQuotationOrdersStorage(quotationId: string) {
  const [payload, setPayload] = useState<QuotationOrdersPayload>(() => 
    QuotationOrdersStorageService.getPayload(quotationId)
  );

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === QuotationOrdersStorageService.getStorageKey(quotationId)) {
        setPayload(QuotationOrdersStorageService.getPayload(quotationId));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [quotationId]);

  const updateStorage = useCallback((newPayload: QuotationOrdersPayload) => {
    QuotationOrdersStorageService.savePayload(quotationId, newPayload);
    setPayload(newPayload);
  }, [quotationId]);

  return { payload, updateStorage };
}