'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface QuotationDetailsMeta {
  title: string;
  companyName: string;
  startDate?: string | null;
  endDate?: string | null;
  closingTime?: string | null;
  paymentTerms?: string | null;
}

interface SupplierQuotationHeaderProps {
  quotation: QuotationDetailsMeta;
  isDarkMode: boolean;
  totalCompleted: number;
  totalItems: number;
}

export function SupplierQuotationHeader({
  quotation,
  isDarkMode,
  totalCompleted,
  totalItems,
}: SupplierQuotationHeaderProps) {
  const router = useRouter();
  const progressPercent = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  // Estado para o cronómetro em tempo real
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00', percent: 100 });

  useEffect(() => {
    const calculateTime = () => {
      if (!quotation.endDate) return;
      const [year, month, day] = quotation.endDate.split('T')[0].split('-').map(Number);
      const [hours = 23, minutes = 59, seconds = 59] = (quotation.closingTime || '23:59:59').split(':').map(Number);
      const endTimestamp = new Date(year, month - 1, day, hours, minutes, seconds).getTime();
      const startTimestamp = quotation.startDate ? new Date(quotation.startDate).getTime() : endTimestamp - (7 * 86400000);
      const now = Date.now();

      const difference = endTimestamp - now;

      if (difference <= 0) {
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00', percent: 0 });
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / 1000 / 60) % 60);
      const s = Math.floor((difference / 1000) % 60);

      const totalDuration = endTimestamp - startTimestamp;
      const elapsed = now - startTimestamp;
      const rawPercent = totalDuration > 0 ? Math.round((elapsed / totalDuration) * 100) : 0;
      const percent = Math.min(Math.max(100 - rawPercent, 0), 100);

      setTimeLeft({
        days: String(d).padStart(2, '0'),
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
        percent,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [quotation.endDate, quotation.closingTime, quotation.startDate]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Não definida';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/portal/painel')}
          className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs border shadow-sm transition flex items-center gap-2 cursor-pointer ${
            isDarkMode 
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-indigo-400' 
              : 'bg-white hover:bg-slate-50 border-slate-200 text-indigo-600'
          }`}
        >
          <span>←</span>
          <span>Voltar ao Painel Principal do Representante</span>
        </button>
      </div>

      {/* 🚀 Bloco Unificado de Contagem Regressiva Estilo DPCNet (Elegante, Lado a Lado) */}
      <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/90'
      }`}>
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Terminam em:</span>
          </div>

          {/* Dígitos Elegantes */}
          <div className="flex items-center gap-1 font-mono font-black text-sm sm:text-base tracking-tight">
            <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">{timeLeft.days}d</span>
            <span className="opacity-40">:</span>
            <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">{timeLeft.hours}h</span>
            <span className="opacity-40">:</span>
            <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">{timeLeft.minutes}m</span>
            <span className="opacity-40">:</span>
            <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">{timeLeft.seconds}s</span>
          </div>
        </div>

        {/* Barra de Progresso e Percentagem Lateral */}
        <div className="w-full lg:w-[45%] flex items-center gap-3">
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-60">
              <span>Progresso do Prazo</span>
              <span className="text-emerald-500 font-mono font-black">{timeLeft.percent}% restante</span>
            </div>
            <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500 transition-all duration-1000 rounded-full shadow-xs"
                style={{ width: `${timeLeft.percent}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 whitespace-nowrap">
            {timeLeft.percent <= 15 ? '⚠️ Reta final' : '🟢 Ativo'}
          </span>
        </div>
      </div>

      <div className={`p-8 rounded-3xl shadow-xl border backdrop-blur-md grid grid-cols-1 lg:grid-cols-3 gap-6 items-center ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800 shadow-black/40' : 'bg-white border-slate-200/80 shadow-slate-200/50'
      }`}>
        
        <div className="space-y-2 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              Cotação Comercial B2B
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-500/10 text-slate-600 dark:text-slate-300">
              🏪 Lojista: {quotation.companyName || 'Loja Parceira'}
            </span>
          </div>
          
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {quotation.title}
          </h1>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div>
              <span className="opacity-60 block text-[10px] font-bold uppercase">Início / Término</span>
              <span className="font-mono font-bold">{formatDate(quotation.startDate)} → {formatDate(quotation.endDate)}</span>
            </div>
            <div>
              <span className="opacity-60 block text-[10px] font-bold uppercase">Prazo / Fechamento</span>
              <span className="font-mono font-bold text-amber-500">{quotation.closingTime || quotation.endDate || 'Em aberto'}</span>
            </div>
            {quotation.paymentTerms && (
              <div>
                <span className="opacity-60 block text-[10px] font-bold uppercase">Condição de Pagamento</span>
                <span className="font-mono font-bold text-emerald-500">{quotation.paymentTerms}</span>
              </div>
            )}
          </div>
        </div>

        <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-3 ${
          isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
          <div className="flex justify-between text-xs font-bold">
            <span className="opacity-70">Progresso da Proposta</span>
            <span className="text-indigo-500 font-mono">{totalCompleted} / {totalItems} itens</span>
          </div>
          <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] opacity-50 text-right">
            Dica: Prima <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">Enter</kbd> para avançar.
          </p>
        </div>

      </div>
    </div>
  );
}