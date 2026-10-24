'use client';

import { useState, useCallback } from 'react';
import { Quotation, UpdateQuotationRequest } from '../types/quotation.types';
import { updateQuotation } from '../services/quotations.service';

export function useEditQuotation(initialQuotation?: Quotation) {
  const [quotation, setQuotation] = useState<Quotation | undefined>(initialQuotation);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateField = useCallback((field: keyof Quotation, value: unknown) => {
    setQuotation((prev: Quotation | undefined) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  }, []);

  const handleSaveQuotation = useCallback(async (payload: UpdateQuotationRequest) => {
    try {
      setLoading(true);
      setError(null);
      await updateQuotation(payload);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar cotação.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    quotation,
    setQuotation,
    loading,
    error,
    handleUpdateField,
    handleSaveQuotation,
  };
}