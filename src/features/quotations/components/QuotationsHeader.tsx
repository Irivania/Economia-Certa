'use client';

import { memo } from 'react';

interface QuotationsHeaderProps {
  count: number;
}

export const QuotationsHeader = memo(function QuotationsHeader({ count }: QuotationsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-5 border-slate-100 dark:border-slate-800">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
            Gestão Comercial
          </span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Cotações Cadastradas</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            {count}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Acompanhe, revise e gerencie suas cotações e o envio para os distribuidores.
        </p>
      </div>
    </div>
  );
});