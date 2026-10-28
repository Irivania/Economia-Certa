'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseQuotationsShortcutsProps {
  onToggleCmd?: () => void;
  onCloseModals?: () => void;
}

export function useQuotationShortcuts(props?: UseQuotationsShortcutsProps) {
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const { onToggleCmd, onCloseModals } = props || {};

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (onToggleCmd) {
        onToggleCmd();
      } else {
        setIsCmdOpen((open) => !open);
      }
    }
    if (e.key === 'Escape') {
      if (onCloseModals) {
        onCloseModals();
      } else {
        setIsCmdOpen(false);
      }
    }
  }, [onToggleCmd, onCloseModals]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    isCmdOpen,
    setIsCmdOpen,
  };
}