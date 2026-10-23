'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { PDV_TEXTS } from '@/constants/pdvConstants';

interface PDVLoadingStateProps {
  isDarkMode: boolean;
}

export const PDVLoadingState = React.memo(function PDVLoadingState({ isDarkMode }: PDVLoadingStateProps) {
  return (
    <div 
      className={`min-h-screen flex flex-col items-center justify-center gap-3 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`} 
      role="status"
      aria-live="polite"
    >
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" aria-hidden="true" />
      <p className="text-xs font-bold tracking-wide">{PDV_TEXTS.loadingText}</p>
    </div>
  );
});