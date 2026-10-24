'use client';

import Link from 'next/link';
import { Quotation } from '../types/quotation.types';
import { formatDate } from '../utils/formatDate';

interface QuotationTrackingHeaderProps {
  quotation: Quotation;
  isDarkMode: boolean;
}

export function QuotationTrackingHeader({ quotation, isDarkMode }: QuotationTrackingHeaderProps) {
  return (
    <>
      <Link
        href="/cotacoes"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-lg shadow-xs border border-slate-200 dark:border-slate-800 transition hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        aria-label="Voltar para a lista de cotações"
      >
        <span aria-hidden="true">&larr;</span> Voltar para cotações
      </Link>

      <header
        className={`rounded-xl border p-6 sm:p-7 shadow-xs ${
          isDarkMode ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200/90 bg-white text-slate-900'
        }`}
      >
        <span className="inline-flex rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Encaminhamento de cotação
        </span>
        <h1 className="mt-2 text-lg md:text-xl font-bold tracking-tight">{quotation.title}</h1>
        <p className="mt-1 max-w-2xl text-xs font-medium text-slate-500 dark:text-slate-400">
          Envie a cotação diretamente para cada distribuidora participante. Cada distribuidora recebe um vínculo independente.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Início:{' '}
            <strong className="font-mono text-slate-700 dark:text-slate-200">
              {formatDate(quotation.startDate)}
            </strong>
          </span>
          <span>
            Término:{' '}
            <strong className="font-mono text-slate-700 dark:text-slate-200">
              {formatDate(quotation.endDate)}
              {quotation.closingTime ? ` às ${quotation.closingTime}` : ''}
            </strong>
          </span>
        </div>
      </header>
    </>
  );
}