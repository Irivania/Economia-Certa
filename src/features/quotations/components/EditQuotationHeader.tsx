'use client';

import Link from 'next/link';

export function EditQuotationHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
      <div>
        <span className="inline-flex rounded-md bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2">
          Edição de Cotação
        </span>
        <h1 className="text-base md:text-lg font-bold tracking-tight">Modificar Solicitação e Produtos</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
          Altere os dados gerais, adicione/remova produtos e ajuste quantidades.
        </p>
      </div>

      <Link
        href="/cotacoes"
        aria-label="Voltar para a lista de cotações"
        className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-lg shadow-xs border border-slate-200 dark:border-slate-800 transition hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
      >
        <span aria-hidden="true">&larr;</span> Voltar para cotações
      </Link>
    </div>
  );
}