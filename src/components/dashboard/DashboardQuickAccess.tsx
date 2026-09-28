'use client';

import Link from 'next/link';

interface DashboardQuickAccessProps {
  canManageSuppliers: boolean;
  canImportData: boolean;
  latestQuotationId: string;
  isDarkMode: boolean;
}

export function DashboardQuickAccess({
  canManageSuppliers,
  canImportData,
  latestQuotationId,
  isDarkMode,
}: DashboardQuickAccessProps) {
  const cardClass = `p-5 rounded-xl border transition-all group flex flex-col justify-between ${
    isDarkMode ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-950 hover:border-slate-700' : 'border-slate-200/60 bg-slate-50/50 hover:bg-white hover:border-slate-300'
  }`;

  return (
    <section className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'} rounded-2xl p-8 shadow-xl border space-y-6`}>
      <div className="border-b border-slate-500/20 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-base font-black tracking-tight">Acessos Rápidos do Sistema</h2>
          <p className="text-xs opacity-60 mt-0.5">Navegue rapidamente pelos principais módulos operacionais da Melo Perfumaria.</p>
        </div>
        <span className="text-xs font-mono font-bold opacity-70 bg-slate-500/10 px-2.5 py-1 rounded-lg">v3.2 Pro</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {canManageSuppliers ? (
          <Link href="/fornecedores" className={cardClass}>
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">🤝</div>
              <h3 className="text-sm font-bold">Gestão de Fornecedores</h3>
              <p className="text-xs opacity-60 mt-1">Cadastre distribuidoras e representantes comerciais.</p>
            </div>
            <span className="text-[11px] font-bold mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Acessar módulo &rarr;</span>
          </Link>
        ) : (
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/20 opacity-50 flex flex-col justify-between cursor-not-allowed">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center mb-3">🔒</div>
              <h3 className="text-sm font-bold">Gestão de Fornecedores</h3>
              <p className="text-xs opacity-60 mt-1">Requer nível Gerente ou Administrador.</p>
            </div>
            <span className="text-[11px] font-bold mt-4 text-rose-500">Acesso Negado</span>
          </div>
        )}

        <Link href={`/cotacoes/respostas/${latestQuotationId}`} className={cardClass}>
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">📊</div>
            <h3 className="text-sm font-bold">Comparador de Preços</h3>
            <p className="text-xs opacity-60 mt-1">Cruze cotações e descubra o melhor fornecedor.</p>
          </div>
          <span className="text-[11px] font-bold mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Acessar módulo &rarr;</span>
        </Link>

        <Link href={`/cotacoes/pedidos/${latestQuotationId}`} className={cardClass}>
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">📦</div>
            <h3 className="text-sm font-bold">Pedidos para Distribuidores</h3>
            <p className="text-xs opacity-60 mt-1">Visualize e envie os pedidos gerados via WhatsApp.</p>
          </div>
          <span className="text-[11px] font-bold mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Acessar módulo &rarr;</span>
        </Link>

        <Link href="/produtos" className={cardClass}>
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">🏷️</div>
            <h3 className="text-sm font-bold">Catálogo de Produtos</h3>
            <p className="text-xs opacity-60 mt-1">Visualize itens, imagens e estoques cadastrados.</p>
          </div>
          <span className="text-[11px] font-bold mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Acessar módulo &rarr;</span>
        </Link>

        {canImportData ? (
          <Link href="/importar" className={cardClass}>
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">📥</div>
              <h3 className="text-sm font-bold">Central de Importação</h3>
              <p className="text-xs opacity-60 mt-1">Importe produtos e dados em lote com inteligência.</p>
            </div>
            <span className="text-[11px] font-bold mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Acessar módulo &rarr;</span>
          </Link>
        ) : (
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/20 opacity-50 flex flex-col justify-between cursor-not-allowed">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center mb-3">🔒</div>
              <h3 className="text-sm font-bold">Central de Importação</h3>
              <p className="text-xs opacity-60 mt-1">Requer nível Supervisor ou superior.</p>
            </div>
            <span className="text-[11px] font-bold mt-4 text-rose-500">Acesso Restrito</span>
          </div>
        )}

        <Link href="/relatorios/comparativo" className={cardClass}>
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">📈</div>
            <h3 className="text-sm font-bold">Relatório Comparativo</h3>
            <p className="text-xs opacity-60 mt-1">Análise de preços lado a lado por fornecedor.</p>
          </div>
          <span className="text-[11px] font-bold mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Acessar módulo &rarr;</span>
        </Link>
      </div>
    </section>
  );
}