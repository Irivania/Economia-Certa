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
  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Produtos */}
      <div className={`${cardBg} rounded-2xl p-6 shadow-xl border flex flex-col justify-between transition-all group`}>
        <div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Produtos Cadastrados</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              +14% este mês
            </span>
          </div>
          <div className="text-4xl font-black mt-3">{loading ? '...' : productCount}</div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-500/20 flex items-center justify-between">
          <span className="text-[11px] text-emerald-500 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-md">Ativo no Catálogo</span>
          <Link href="/produtos" className="text-xs font-bold hover:underline">Ver catálogo &rarr;</Link>
        </div>
      </div>

      {/* Card 2: Cotações Abertas */}
      <div className={`${cardBg} rounded-2xl p-6 shadow-xl border flex flex-col justify-between transition-all group`}>
        <div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Cotações Abertas</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Ativas hoje
            </span>
          </div>
          <div className="text-4xl font-black mt-3">{loading ? '...' : quotationCount}</div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-500/20 flex items-center justify-between">
          <span className="text-[11px] text-amber-500 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-md">Aguardando Respostas</span>
          <Link href="/cotacoes" className="text-xs font-bold hover:underline">Gerenciar &rarr;</Link>
        </div>
      </div>

      {/* Card 3: Cotações Finalizadas / Prontas para Envio */}
      <div className={`${cardBg} rounded-2xl p-6 shadow-xl border flex flex-col justify-between transition-all group`}>
        <div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Cotações Finalizadas</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              Prontas para Pedido
            </span>
          </div>
          <div className="text-4xl font-black mt-3">{loading ? '...' : completedQuotationCount}</div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-500/20 flex items-center justify-between">
          <span className="text-[11px] text-indigo-500 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-md">
            Respostas Recebidas
          </span>
          <Link href="/cotacoes" className="text-xs font-bold hover:underline">Comparar preços &rarr;</Link>
        </div>
      </div>
    </div>
  );
}