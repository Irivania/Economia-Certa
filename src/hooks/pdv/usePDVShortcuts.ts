'use client';

import { useEffect, useCallback } from 'react';
import { PDV_SHORTCUTS } from '@/constants/pdvConstants';

interface UsePDVShortcutsOptions {
  onOpenShortcuts: () => void;
  onCloseShortcuts: () => void;
  onCheckout: () => void;
  isRegisterOpen: boolean;
  isPaused: boolean;
  cartLength: number;
  loading: boolean;
}

export function usePDVShortcuts({
  onOpenShortcuts,
  onCloseShortcuts,
  onCheckout,
  isRegisterOpen,
  isPaused,
  cartLength,
  loading,
}: UsePDVShortcutsOptions) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case PDV_SHORTCUTS.GUIDE:
        e.preventDefault();
        onOpenShortcuts();
        break;
      case PDV_SHORTCUTS.CLOSE_MODAL:
        onCloseShortcuts();
        break;
      case PDV_SHORTCUTS.CHECKOUT:
        e.preventDefault();
        if (cartLength > 0 && !loading && isRegisterOpen && !isPaused) {
          onCheckout();
        }
        break;
      default:
        break;
    }
  }, [onOpenShortcuts, onCloseShortcuts, onCheckout, cartLength, loading, isRegisterOpen, isPaused]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}