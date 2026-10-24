'use client';

import { memo } from 'react';
import Link from 'next/link';

interface QuotationFormActionsProps {
  submitting: boolean;
  loadingSuppliers: boolean;
  suppliersLength: number;
}

export const QuotationFormActions = memo(function QuotationFormActions({
  submitting,
  loadingSuppliers,
  suppliersLength,
}: QuotationFormActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-2.5 border-t border-slate-100 dark:border-slate-800 pt-5 sm:flex-row sm:justify-end">
      <Link href="/cotacoes" className="rounded-lg px-4 py-2.5 text-center text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancelar</Link>
      <button 
        type="submit" 
        disabled={submitting || loadingSuppliers || suppliersLength === 0} 
        aria-label="Criar cotação"
        className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
      >
        {submitting ? 'A criar...' : 'Criar cotação'}
      </button>
    </div>
  );
});