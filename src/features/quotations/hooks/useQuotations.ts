import { useEffect, useState, useCallback } from 'react';
import { Quotation } from '../types/quotation.types';
import { getQuotations } from '../services/quotations.service';

export function useQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotations = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getQuotations(signal);
      setQuotations(data);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const message = err instanceof Error ? err.message : 'Erro desconhecido ao carregar cotações.';
      setError(message);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    
    // Executa o fetch de forma assíncrona para satisfazer o linter do React (evitando setState síncrono no mount)
    const timer = setTimeout(() => {
      fetchQuotations(controller.signal);
    }, 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fetchQuotations]);

  return {
    quotations,
    loading,
    error,
    setQuotations,
    refetch: () => fetchQuotations(undefined),
  };
}