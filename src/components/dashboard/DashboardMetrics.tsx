'use client';

import Link from 'next/link';

interface DashboardMetricsProps {
  productCount: number;
  quotationCount: number;
  completedQuotationCount?: number;
  loading: boolean;
  isDarkMode: boolean;
}

export function DashboardMetrics({
  productCount,
  quotationCount,
  completedQuotationCount = 0,
  loading,
  isDarkMode,
}: DashboardMetricsProps) {
  const cardBg = isDarkMode 
    ? 'bg-slate-900/90 border-slate-800 text-slate-100 hover:border-slate-700 hover:bg-slate-900' 
    : 'bg-white border-slate-200/90 text-slate-900 hover:border-slate-300 hover:shadow-md';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Card 1: Produtos */}
      <div className={`${cardBg} rounded-xl p-5 shadow-xs border flex flex-col justify-between transition-all duration-200 group`}>
        <div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Produtos Cadastrados</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/15">
              +14% este mês
            </span>
          </div>
          {loading ? (
            <div className="h-9 w-24 bg-slate-500/15 animate-pulse rounded-lg mt-3" />
          ) : (
            <div className="text-3xl font-extrabold tracking-tight mt-3 text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {productCount}
            </div>
          )}
        </div>
        <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-emerald-500 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Ativo no catálogo
          </span>
          <Link href="/produtos" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5">
            Ver catálogo <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Card 2: Cotações Abertas */}
      <div className={`${cardBg} rounded-xl p-5 shadow-xs border flex flex-col justify-between transition-all duration-200 group`}>
        <div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Cotações Abertas</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/15">
              Ativas hoje
            </span>
          </div>
          {loading ? (
            <div className="h-9 w-24 bg-slate-500/15 animate-pulse rounded-lg mt-3" />
          ) : (
            <div className="text-3xl font-extrabold tracking-tight mt-3 text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
              {quotationCount}
            </div>
          )}
        </div>
        <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-amber-500 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Aguardando respostas
          </span>
          <Link href="/cotacoes" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5">
            Gerenciar <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Card 3: Cotações Finalizadas */}
      <div className={`${cardBg} rounded-xl p-5 shadow-xs border flex flex-col justify-between transition-all duration-200 group`}>
        <div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Cotações Finalizadas</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/15">
              Prontas para Pedido
            </span>
          </div>
          {loading ? (
            <div className="h-9 w-24 bg-slate-500/15 animate-pulse rounded-lg mt-3" />
          ) : (
            <div className="text-3xl font-extrabold tracking-tight mt-3 text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {completedQuotationCount}
            </div>
          )}
        </div>
        <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-indigo-500 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Respostas recebidas
          </span>
          <Link href="/cotacoes" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5">
            Comparar preços <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}