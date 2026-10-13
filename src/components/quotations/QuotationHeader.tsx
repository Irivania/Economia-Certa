'use client';

import React from 'react';
import Link from 'next/link';

interface QuotationHeaderProps {
  title: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  saving: boolean;
  onSmartQuote: () => void;
  onExportSelection: () => void;
  onFinalize: () => void;
}

function formatDate(value?: string | Date | null) {
  if (!value) return 'Não definido';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Não definido';
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

export function QuotationHeader({
  title,
  startDate,
  endDate,
  saving,
  onSmartQuote,
  onExportSelection,
  onFinalize,
}: QuotationHeaderProps) {
  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/cotacoes"
          className="font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-lg shadow-xs border border-slate-200 dark:border-slate-800 transition hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1.5 text-xs"
        >
          &larr; Voltar para listagem de cotações
        </Link>
      </div>

      <div className="rounded-xl border p-6 sm:p-7 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white transition-all">
        <div>
          <span className="inline-flex rounded-md bg-indigo-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            Mapa Comparativo de Preços & Rentabilidade
          </span>
          <h1 className="text-lg md:text-xl font-bold tracking-tight mt-1.5">{title}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Início: <strong className="font-mono">{formatDate(startDate)}</strong> &bull; Término: <strong className="font-mono">{formatDate(endDate)}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onSmartQuote}
            className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            ⚡ Cotação Automática (Mix Mais Barato)
          </button>

          <button
            type="button"
            onClick={onExportSelection}
            className="px-4 py-2.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            📥 Baixar Decisão
          </button>

          <button
            type="button"
            onClick={onFinalize}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? 'A processar...' : '✅ Finalizar e Gerar Pedidos'}
          </button>
        </div>
      </div>
    </div>
  );
}