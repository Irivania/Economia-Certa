'use client';

import { useEffect, useCallback } from 'react';

interface UseDashboardShortcutsProps {
  onToggleCmd: () => void;
  onCloseModals: () => void;
}

export function useDashboardShortcuts({ onToggleCmd, onCloseModals }: UseDashboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onToggleCmd();
      }
      if (e.key === 'Escape') {
        onCloseModals();
      }
    },
    [onToggleCmd, onCloseModals]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}