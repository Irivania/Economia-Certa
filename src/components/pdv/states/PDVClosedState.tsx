'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ShoppingCart } from 'lucide-react';
import { PDV_TEXTS } from '@/constants/pdvConstants';

interface PDVClosedStateProps {
  isDarkMode: boolean;
}

export const PDVClosedState = React.memo(function PDVClosedState({ isDarkMode }: PDVClosedStateProps) {
  return (
    <div className={`max-w-md mx-auto p-10 text-center rounded-3xl border shadow-2xl space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl font-bold border border-amber-500/20" aria-hidden="true">
        <Lock className="w-7 h-7" />
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-black uppercase tracking-wider">{PDV_TEXTS.closedTitle}</h3>
        <p className="text-xs opacity-60 leading-relaxed">{PDV_TEXTS.closedDesc}</p>
      </div>
      <Link
        href="/pdv/caixa"
        aria-label={PDV_TEXTS.ariaOpenShift}
        className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/25 transition inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <ShoppingCart className="w-4 h-4" aria-hidden="true" /> {PDV_TEXTS.openShiftButton} &rarr;
      </Link>
    </div>
  );
});