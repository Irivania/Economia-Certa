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

      // Setas navegam entre os métodos de pagamento a qualquer momento
      if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(e.key)) {
        e.preventDefault();
        let nextIdx = selectedMethodIndex;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          nextIdx = selectedMethodIndex < PAYMENT_METHODS.length - 1 ? selectedMethodIndex + 1 : 0;
        } else {
          nextIdx = selectedMethodIndex > 0 ? selectedMethodIndex - 1 : PAYMENT_METHODS.length - 1;
        }
        setSelectedMethodIndex(nextIdx);
        focusAmountInput();
        return;
      }

      // Atalho profissional com Alt + [1-5] para mudar de método sem conflitar com a digitação do valor
      if (e.altKey && ['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const idx = parseInt(e.key, 10) - 1;
        if (idx < PAYMENT_METHODS.length) {
          setSelectedMethodIndex(idx);
          focusAmountInput();
        }
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

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);
}