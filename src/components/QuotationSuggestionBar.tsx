'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface QuotationSuggestionBarProps {
  itemsCount: number;
  onApplySuggestion: () => void;
}

export default function QuotationSuggestionBar({
  itemsCount,
  onApplySuggestion,
}: QuotationSuggestionBarProps) {
  const { isDarkMode } = useTheme();

  if (itemsCount === 0) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border p-5 transition-all ${
      isDarkMode ? 'bg-slate-950/50 border-slate-800 text-white' : 'bg-slate-50/60 border-slate-200/80 text-slate-900'
    }`}>
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider">Assistente de Reposição</h3>
        <p className="text-[11px] opacity-60 mt-0.5 font-medium">Aplique instantaneamente a sugestão inteligente baseada na diferença entre o estoque ideal e o atual.</p>
      </div>
      <button
        type="button"
        onClick={onApplySuggestion}
        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-4 py-2.5 transition-all shadow-lg shadow-emerald-600/25 flex items-center gap-1.5 cursor-pointer shrink-0"
      >
        <span>⚡ Sugerir Quantidades (Ideal - Atual)</span>
      </button>
    </div>
  );
}