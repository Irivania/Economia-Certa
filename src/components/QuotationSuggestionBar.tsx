'use client';

import React from 'react';

interface QuotationSuggestionBarProps {
  itemsCount: number;
  onApplySuggestion: () => void;
}

export default function QuotationSuggestionBar({
  itemsCount,
  onApplySuggestion,
}: QuotationSuggestionBarProps) {
  if (itemsCount === 0) return null;

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Itens da Cotação</h3>
        <p className="text-[11px] text-slate-500">Adicione produtos ou aplique a sugestão inteligente baseada no stock ideal.</p>
      </div>
      <button
        type="button"
        onClick={onApplySuggestion}
        className="bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold px-3 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
      >
        ⚡ Sugerir Quantidades (Estoque Ideal - Atual)
      </button>
    </div>
  );
}