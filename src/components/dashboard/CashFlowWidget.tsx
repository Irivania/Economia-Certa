'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/apiClient';
import { getCompanyId } from '@/lib/companySession';

interface CashFlowProps {
  isDarkMode: boolean;
}

export function CashFlowWidget({ isDarkMode }: CashFlowProps) {
  const companyId = getCompanyId();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalPayable7Days: 0,
    estimatedReceivables7Days: 0,
    projectedBalance: 0,
    upcomingCount: 0,
  });

  useEffect(() => {
    async function loadCashFlow() {
      if (!companyId) return;
      try {
        setLoading(true);
        const res = await apiFetch(`/api/finance/cashflow?companyId=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setMetrics(data.metrics);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar projeção de fluxo de caixa:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCashFlow();
  }, [companyId]);

  if (loading) {
    return (
      <div className={`p-6 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <p className="text-xs opacity-50 text-center">Calculando projeção de fluxo de caixa...</p>
      </div>
    );
  }

  const isPositive = metrics.projectedBalance >= 0;

  return (
    <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex justify-between items-center border-b pb-3 border-slate-500/10">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Projeção Executiva</span>
          <h3 className="text-sm font-black">Fluxo de Caixa (Próximos 7 Dias)</h3>
        </div>
        <Link href="/financeiro/pagar" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
          Ver Contas a Pagar &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="p-4 rounded-2xl bg-slate-500/5 border border-slate-500/10">
          <span className="text-[11px] font-sans opacity-60 uppercase font-bold">Saídas (Boletos 7d)</span>
          <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-1">
            R$ {metrics.totalPayable7Days.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] font-sans opacity-50 mt-0.5">{metrics.upcomingCount} títulos a vencer.</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-500/5 border border-slate-500/10">
          <span className="text-[11px] font-sans opacity-60 uppercase font-bold">Entradas Estimadas</span>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
            R$ {metrics.estimatedReceivables7Days.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] font-sans opacity-50 mt-0.5">Baseado em vendas projetadas.</p>
        </div>

        <div className={`p-4 rounded-2xl border ${isPositive ? (isDarkMode ? 'bg-emerald-950/20 border-emerald-900/40' : 'bg-emerald-50 border-emerald-200') : (isDarkMode ? 'bg-rose-950/20 border-rose-900/40' : 'bg-rose-50 border-rose-200')}`}>
          <span className="text-[11px] font-sans opacity-60 uppercase font-bold">Saldo Projetado</span>
          <div className={`text-lg font-black mt-1 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            R$ {metrics.projectedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] font-sans opacity-50 mt-0.5">
            {isPositive ? '✓ Caixa saudável para o período.' : '⚠️ Atenção ao caixa!'}
          </p>
        </div>
      </div>
    </div>
  );
}