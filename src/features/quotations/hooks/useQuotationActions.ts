'use client';

import { useState, useCallback } from 'react';
import { deleteQuotation, cancelQuotation } from '../services/quotations.service';
import { Quotation } from '../types/quotation.types';

interface UseQuotationActionsProps {
  setQuotations?: React.Dispatch<React.SetStateAction<Quotation[]>>;
}

export function useQuotationActions({ setQuotations }: UseQuotationActionsProps = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Tem certeza que deseja eliminar esta cotação?')) return;
    try {
      setLoading(true);
      setError(null);
      await deleteQuotation(id);
      
      if (setQuotations) {
        setQuotations((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao eliminar cotação.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [setQuotations]);

  const handleCancel = useCallback(async (id: string) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta cotação?')) return;
    try {
      setLoading(true);
      setError(null);
      await cancelQuotation(id);

      if (setQuotations) {
        setQuotations((prev) =>
          prev.map((q) => (q.id === id ? { ...q, status: 'CANCELLED' } : q))
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao cancelar cotação.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [setQuotations]);

  return {
    loading,
    error,
    handleDelete,
    handleCancel,
  };
}