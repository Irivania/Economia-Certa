'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface QuotationStrategyBarProps {
  targetMargin: number;
  setTargetMargin: (val: number) => void;
  filterType: 'ALL' | 'HIGH' | 'LOW';
  setFilterType: (val: 'ALL' | 'HIGH' | 'LOW') => void;
  totalProductsCount: number;
}

export function QuotationStrategyBar({
  targetMargin,
  setTargetMargin,
  filterType,
  setFilterType,
  totalProductsCount,
}: QuotationStrategyBarProps) {
  const { isDarkMode } = useTheme();

  return (
    <div className={`p-8 rounded-3xl shadow-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${
      isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-slate-200/50'
    }`}>
      <div>
        <span className="inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-500 border border-indigo-500/20 mb-2">
          Inteligência de Margem
        </span>
        <h3 className="text-base font-black tracking-tight">Filtro Estratégico por Rentabilidade</h3>
        <p className="text-xs opacity-60 mt-0.5">Selecione &quot;Todos&quot; para a disputa completa ou filtre para ver a lista segmentada por margem alvo.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        <div className={`flex items-center gap-2 border px-4 py-2.5 rounded-2xl ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-xs font-bold opacity-70">Margem Alvo:</span>
          <input
            type="number"
            value={targetMargin}
            onChange={(e) => setTargetMargin(Number(e.target.value) || 0)}
            className={`w-16 border rounded-xl px-2.5 py-1.5 text-xs text-center font-bold outline-none font-mono ${
              isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
            }`}
          />
          <span className="text-xs font-bold opacity-70">%</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-4 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shadow-sm ${
              filterType === 'ALL' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'bg-slate-500/10 opacity-70 hover:opacity-100'
            }`}
          >
            Todos ({totalProductsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('HIGH')}
            className={`px-4 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shadow-sm ${
              filterType === 'HIGH' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            🟢 Acima de {targetMargin}%
          </button>
          <button
            type="button"
            onClick={() => setFilterType('LOW')}
            className={`px-4 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shadow-sm ${
              filterType === 'LOW' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            🟠 Abaixo de {targetMargin}%
          </button>
        </div>
      </div>
    </div>
  );
}