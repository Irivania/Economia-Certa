'use client';

import Link from 'next/link';

interface EditQuotationFormActionsProps {
  submitting: boolean;
}

export function EditQuotationFormActions({ submitting }: EditQuotationFormActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-2.5 border-t border-slate-100 dark:border-slate-800 pt-5 sm:flex-row sm:justify-end">
      <Link
        href="/cotacoes"
        className="rounded-lg px-4 py-2.5 text-center text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-500"
      >
        Cancelar
      </Link>
      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="rounded-lg bg-amber-600 hover:bg-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-500"
      >
        {submitting ? 'A salvar...' : 'Salvar Alterações'}
      </button>
    </div>
  );
}