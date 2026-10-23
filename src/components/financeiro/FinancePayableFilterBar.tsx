'use client';

import { Calendar, Filter } from 'lucide-react';

interface FinancePayableFilterBarProps {
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  onApplyFilter: () => void;
  activePreset: 'all' | 'today' | 'week' | 'month' | 'overdue';
  setPresetFilter: (preset: 'all' | 'today' | 'week' | 'month' | 'overdue') => void;
  totalCount: number;
  isDarkMode: boolean;
}

export function FinancePayableFilterBar({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onApplyFilter,
  activePreset,
  setPresetFilter,
  totalCount,
  isDarkMode,
}: FinancePayableFilterBarProps) {
  
  const handleSelectToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setStartDate(todayStr);
    setEndDate(todayStr);
    setPresetFilter('today');
  };

  return (
    <div className={`p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      
      {/* Seletor de Intervalo de Datas com Botão Filtrar */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent outline-none cursor-pointer font-bold"
          />
          <span className="opacity-50">até</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent outline-none cursor-pointer font-bold"
          />
          
          <button
            type="button"
            onClick={onApplyFilter}
            className="ml-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1 shadow-md"
            title="Aplicar período escolhido"
          >
            <Filter className="w-3 h-3" /> Filtrar
          </button>
        </div>
      </div>

      {/* Atalhos Rápidos */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
        <button
          type="button"
          onClick={() => setPresetFilter('all')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${activePreset === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-500/10 opacity-70'}`}
        >
          Todos ({totalCount})
        </button>
        <button
          type="button"
          onClick={handleSelectToday}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${activePreset === 'today' ? 'bg-indigo-600 text-white' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}
        >
          Hoje
        </button>
        <button
          type="button"
          onClick={() => setPresetFilter('week')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${activePreset === 'week' ? 'bg-indigo-600 text-white' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}
        >
          Esta semana
        </button>
        <button
          type="button"
          onClick={() => setPresetFilter('month')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${activePreset === 'month' ? 'bg-indigo-600 text-white' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}
        >
          Este mês
        </button>
        <button
          type="button"
          onClick={() => setPresetFilter('overdue')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${activePreset === 'overdue' ? 'bg-rose-600 text-white' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}
        >
          🚨 Vencidos
        </button>
      </div>
    </div>
  );
}