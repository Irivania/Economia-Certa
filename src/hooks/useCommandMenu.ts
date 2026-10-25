'use client';

import { useState, useCallback } from 'react';
import { useQuotationShortcuts } from '@/features/quotations/hooks/useQuotationShortcuts';

export function useCommandMenu() {
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const handleOpen = useCallback(() => setIsCmdOpen(true), []);
  const handleClose = useCallback(() => setIsCmdOpen(false), []);
  const handleToggle = useCallback(() => setIsCmdOpen((prev) => !prev), []);

  useQuotationShortcuts({
    onToggleCmd: handleToggle,
    onCloseModals: handleClose,
  });

  return {
    isCmdOpen,
    handleOpen,
    handleClose,
    handleToggle,
  };
}