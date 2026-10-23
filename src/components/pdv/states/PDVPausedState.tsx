'use client';

import React from 'react';
import Link from 'next/link';
import { Coffee } from 'lucide-react';
import { PDV_TEXTS } from '@/constants/pdvConstants';

interface PDVPausedStateProps {
  isDarkMode: boolean;
}

export const PDVPausedState = React.memo(function PDVPausedState({ isDarkMode }: PDVPausedStateProps) {
  return (
    <div className={`max-w-md mx-auto p-12 text-center rounded-3xl border shadow-2xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <Coffee className="w-12 h-12 mx-auto text-amber-500 animate-bounce" aria-hidden="true" />
      <h3 className="text-base font-black uppercase tracking-wider">{PDV_TEXTS.pausedTitle}</h3>
      <p className="text-xs opacity-60 leading-relaxed">{PDV_TEXTS.pausedDesc}</p>
      <Link
        href="/pdv/caixa"
        aria-label={PDV_TEXTS.ariaReturnShift}
        className="inline-block mt-4 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
      >
        {PDV_TEXTS.returnShiftButton} &rarr;
      </Link>
    </div>
  );
});