'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export interface QuotationItemResult {
  id: string;
  productName?: string;
  productDescription?: string | null;
  productUnit?: string | null;
  productEan?: string | null;
  requestedQuantity: number | string;
  price?: number | string | null;
  outOfStock?: boolean | null;
}

export interface QuotationSupplierResult {
  quotationSupplierId: string;
  quotationId: string;
  status: string;
  totalOffered?: number | string | null;
  token: string;
  title?: string;
  startDate?: string | null;
  endDate?: string | null;
  closingTime?: string | null;
  companyName?: string;
  companyId?: string;
  items?: QuotationItemResult[];
}

interface QuotationsListProps {
  isDarkMode: boolean;
  quotations: QuotationSupplierResult[];
  loading: boolean;
  activeBrandName: string;
}

export function QuotationsList({
  isDarkMode,
  quotations,
  loading,
  activeBrandName,
}: QuotationsListProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className={`p-8 rounded-[2.5rem] border text-center text-xs opacity-60 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
        A carregar cotações e propostas para {activeBrandName}...
      </div>
    );
  }

  if (!quotations || quotations.length === 0) {
    return (
      <div className={`p-8 sm:p-12 rounded-[2.5rem] shadow-xl border backdrop-blur-2xl transition-all space-y-4 text-center ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800/80' : 'bg-white/95 border-slate-200/80 shadow-slate-200/50'
      }`}>
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-2xl mx-auto mb-2">
          📋
        </div>
        <h2 className="text-base font-black tracking-tight uppercase text-slate-900 dark:text-white">
          Cotações para a Distribuidora: {activeBrandName}
        </h2>
        <p className="text-xs opacity-60 max-w-md mx-auto">
          Não existem cotações atribuídas ou pendentes para esta marca no momento. As propostas enviadas por lojistas parceiros aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className={`p-6 sm:p-8 rounded-[2.5rem] shadow-2xl border backdrop-blur-2xl transition-all space-y-6 ${
      isDarkMode ? 'bg-slate-900/90 border-slate-800/80' : 'bg-white/95 border-slate-200/80 shadow-slate-200/50'
    }`}>
      <div className="flex items-center justify-between border-b pb-4 border-slate-500/10">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-500 text-sm">📋</span>
          <div>
            <h2 className="text-base font-black tracking-tight uppercase text-slate-900 dark:text-white">
              Cotações para a Distribuidora: {activeBrandName}
            </h2>
            <p className="text-[11px] opacity-60">Selecione uma cotação para preencher valores, verificar disponibilidade e responder ao lojista.</p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          {quotations.length} {quotations.length === 1 ? 'cotação disponível' : 'cotações disponíveis'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quotations.map((cot) => {
          const isPending = !cot.status || cot.status === 'PENDING' || cot.status === 'PENDENTE';
          const totalValue = Number(cot.totalOffered || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          });
          const itemCount = cot.items?.length || 0;

          return (
            <div
              key={cot.quotationSupplierId || cot.quotationId}
              className={`p-6 rounded-3xl border flex flex-col justify-between gap-5 transition-all shadow-lg hover:shadow-2xl relative overflow-hidden group ${
                isDarkMode ? 'bg-slate-950/70 border-slate-800 hover:border-indigo-500/50' : 'bg-slate-50/80 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition" />

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-wider ${
                    isPending 
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {isPending ? '⏳ Pendente de Resposta' : '✓ Respondido'}
                  </span>
                  <span className="text-[10px] font-mono opacity-50">Itens: {itemCount}</span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-500 transition">
                    {cot.title || 'Cotação Geral'}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                    <span>🏪 Lojista / Cliente:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 underline">{cot.companyName || 'Loja Parceira'}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-500/10 text-[11px]">
                  <div>
                    <span className="opacity-60 block text-[10px]">Total Estimado</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{totalValue}</span>
                  </div>
                  <div>
                    <span className="opacity-60 block text-[10px]">Validade / Fechamento</span>
                    <span className="font-mono">{cot.closingTime || cot.endDate || 'Até fechar'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-500/10 flex items-center justify-between relative z-10">
                <span className="text-[11px] opacity-60 font-medium">Ação Executiva</span>
                <button
                  type="button"
                  onClick={() => router.push(`/portal/cotacao/${cot.token}`)}
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider transition shadow-md shadow-indigo-600/30 cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  <span>Responder Cotação</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}