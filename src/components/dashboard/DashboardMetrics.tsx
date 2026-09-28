'use client';

import Link from 'next/link';

interface DashboardMetricsProps {
  productCount: number;
  quotationCount: number;
  loading: boolean;
  canImportData: boolean;
  isDarkMode: boolean;
}

export function DashboardMetrics({
  productCount,
  quotationCount,
  loading,
  canImportData,
  isDarkMode,
}: DashboardMetricsProps) {
  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <div className={`${cardBg} rounded-2xl p-6 shadow-xl border flex flex-col justify-between transition-all group`}>
        <div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Módulo de Importação</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              100% Sincronizado
            </span>
          </div>
          <div className="text-2xl font-black mt-3">Planilhas & Dados</div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-500/20 flex items-center justify-between">
          <span className="text-[11px] text-blue-500 font-semibold bg-blue-500/10 px-2.5 py-1 rounded-md">
            {canImportData ? 'Pronto para uso' : 'Acesso Restrito'}
          </span>
          {canImportData ? (
            <Link href="/importar" className="text-xs font-bold hover:underline">Acessar &rarr;</Link>
          ) : (
            <span className="text-xs opacity-40">Bloqueado</span>
          )}
        </div>
      </div>
    </div>
  );
}