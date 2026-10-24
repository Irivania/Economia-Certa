import { useCallback } from 'react';
import { Quotation } from '../types/quotation.types';
import { deleteQuotationApi, cancelQuotationApi } from '../services/quotations.service';

interface UseQuotationActionsProps {
  setQuotations: React.Dispatch<React.SetStateAction<Quotation[]>>;
  addToast?: (title: string, description: string, type?: 'success' | 'warning' | 'info') => void;
}

export function useQuotationActions({ setQuotations, addToast }: UseQuotationActionsProps) {
  const handleDelete = useCallback(async (quotation: Quotation) => {
    if (!window.confirm(`Deseja realmente excluir a cotação "${quotation.title}"?`)) return;

    try {
      await deleteQuotationApi(quotation.id);
      setQuotations((current) => current.filter((item) => item.id !== quotation.id));
      addToast?.('Sucesso', 'Cotação excluída com sucesso.', 'success');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Não foi possível excluir a cotação.';
      addToast?.('Erro', message, 'warning');
    }
  }, [setQuotations, addToast]);

  const handleCancel = useCallback(async (quotation: Quotation) => {
    if (!window.confirm(`Deseja cancelar a cotação "${quotation.title}"? O representante não poderá mais acessá-la, mas o histórico será preservado.`)) return;

    try {
      await cancelQuotationApi(quotation.id);
      setQuotations((current) => current.map((item) =>
        item.id === quotation.id
          ? { 
              ...item, 
              status: 'CANCELLED', 
              suppliers: item.suppliers?.map((supplier) => ({ ...supplier, status: 'CANCELLED' })) 
            }
          : item
      ));
      addToast?.('Sucesso', 'Cotação cancelada com sucesso.', 'success');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Não foi possível cancelar a cotação.';
      addToast?.('Erro', message, 'warning');
    }
  }, [setQuotations, addToast]);

  return {
    handleDelete,
    handleCancel,
  };
}