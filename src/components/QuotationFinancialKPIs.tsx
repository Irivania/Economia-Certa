'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface QuotationFinancialKPIsProps {
  totalAllocatedValue: number;
  economyAmount: number;
  economyPercent: number;
  fulfillmentRate: number;
  itemsWithValidResponse: number;
  totalProducts: number;
  formatCurrency: (value: number) => string;
}

export function QuotationFinancialKPIs({
  totalAllocatedValue,
  economyAmount,
  economyPercent,
  fulfillmentRate,
  itemsWithValidResponse,
  totalProducts,
  formatCurrency,
}: QuotationFinancialKPIsProps) {
  const { isDarkMode } = useTheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between transition-all ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'
      }`}>
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-60">Investimento Total</span>
          <div className="text-2xl font-black font-mono mt-1 text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalAllocatedValue)}
          </div>
        </div>
        <span className="text-[11px] opacity-60 mt-3 pt-2 border-t border-slate-500/10">
          Soma dos pedidos atualmente selecionados
        </span>
      </div>

      <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between transition-all ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'
      }`}>
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-60">Economia Gerada</span>
          <div className="text-2xl font-black font-mono mt-1 text-indigo-600 dark:text-indigo-400">
            {formatCurrency(economyAmount)} <span className="text-xs font-bold">({economyPercent.toFixed(1)}%)</span>
          </div>
        </div>
        <span className="text-[11px] opacity-60 mt-3 pt-2 border-t border-slate-500/10">
          Comparado à média de mercado dos fornecedores
        </span>
      </div>

      <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between transition-all ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'
      }`}>
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-60">Índice de Atendimento</span>
          <div className="text-2xl font-black font-mono mt-1 text-amber-600 dark:text-amber-400">
            {fulfillmentRate.toFixed(0)}% <span className="text-xs font-bold font-sans">atendido</span>
          </div>
        </div>
        <span className="text-[11px] opacity-60 mt-3 pt-2 border-t border-slate-500/10">
          {itemsWithValidResponse} de {totalProducts} itens com proposta válida
        </span>
      </div>
    </div>
  );
}