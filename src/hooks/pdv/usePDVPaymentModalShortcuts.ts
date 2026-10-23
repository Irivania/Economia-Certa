'use client';

import { useEffect, useCallback } from 'react';
import { PAYMENT_METHODS } from '@/constants/pdvPaymentConstants';

export interface UsePDVPaymentModalShortcutsProps {
  isOpen: boolean;
  totalPaid: number;
  totalCart: number;
  onFinish: () => void;
  onClose: () => void;
  selectedMethodIndex: number;
  setSelectedMethodIndex: (idx: number) => void;
  focusAmountInput: () => void;
  onRemoveLastSplit: () => void;
  onClearAllSplits: () => void;
}

export function usePDVPaymentModalShortcuts({
  isOpen,
  totalPaid,
  totalCart,
  onFinish,
  onClose,
  selectedMethodIndex,
  setSelectedMethodIndex,
  focusAmountInput,
  onRemoveLastSplit,
  onClearAllSplits,
}: UsePDVPaymentModalShortcutsProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Se o utilizador estiver focado no input de valor, deixamos o input tratar do Enter livremente
      const activeElement = document.activeElement;
      const isInsideAmountInput = activeElement?.id === 'split-amount-input';

      if (e.key === 'F10') {
        e.preventDefault();
        if (totalPaid >= totalCart) {
          onFinish();
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Delete') {
        e.preventDefault();
        onRemoveLastSplit();
        return;
      }

      if (e.ctrlKey && e.key === 'Backspace') {
        e.preventDefault();
        onClearAllSplits();
        return;
      }

      // Teclas F1 a F5 selecionam diretamente a forma de pagamento
      if (['F1', 'F2', 'F3', 'F4', 'F5'].includes(e.key)) {
        e.preventDefault();
        const mapKeyToIndex: Record<string, number> = {
          F1: 0,
          F2: 1,
          F3: 2,
          F4: 3,
          F5: 4,
        };
        const idx = mapKeyToIndex[e.key];
        if (idx !== undefined && idx < PAYMENT_METHODS.length) {
          setSelectedMethodIndex(idx);
        }
        return;
      }

      // Setas navegam entre os métodos apenas se NÃO estivermos no input de valor
      if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(e.key) && !isInsideAmountInput) {
        e.preventDefault();
        let nextIdx = selectedMethodIndex;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          nextIdx = selectedMethodIndex < PAYMENT_METHODS.length - 1 ? selectedMethodIndex + 1 : 0;
        } else {
          nextIdx = selectedMethodIndex > 0 ? selectedMethodIndex - 1 : PAYMENT_METHODS.length - 1;
        }
        setSelectedMethodIndex(nextIdx);
        return;
      }

      // Se estivermos na grelha de seleção e darmos Enter, salta para o input de valor
      if (e.key === 'Enter' && !isInsideAmountInput) {
        e.preventDefault();
        focusAmountInput();
        return;
      }
    },
    [
      isOpen,
      totalPaid,
      totalCart,
      onFinish,
      onClose,
      selectedMethodIndex,
      setSelectedMethodIndex,
      focusAmountInput,
      onRemoveLastSplit,
      onClearAllSplits,
    ]
  );

  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [isOpen, handleKeyDown]);
}