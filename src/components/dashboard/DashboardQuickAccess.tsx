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
  const cardClass = `p-4 sm:p-5 rounded-xl border transition-all duration-200 group flex flex-col justify-between ${
    isDarkMode 
      ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 text-slate-100 hover:shadow-md' 
      : 'border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-md text-slate-900'
  }`;

  const lockedCardClass = `p-4 sm:p-5 rounded-xl border flex flex-col justify-between cursor-not-allowed opacity-60 ${
    isDarkMode 
      ? 'border-slate-800/80 bg-slate-900/20 text-slate-400' 
      : 'border-slate-200 bg-slate-100/50 text-slate-500'
  }`;

  return (
    <section className={`${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200/90 text-slate-900'} rounded-xl p-6 sm:p-7 shadow-xs border space-y-5`}>
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-sm font-bold tracking-tight">Acessos Rápidos do Sistema</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Navegue rapidamente pelos principais módulos operacionais da sua empresa.</p>
        </div>
        <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
          v3.2 Pro
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {canManageSuppliers ? (
          <Link href="/fornecedores" className={cardClass}>
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 text-base group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">🤝</div>
              <h3 className="text-xs sm:text-sm font-semibold">Gestão de Fornecedores</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cadastre distribuidoras e representantes comerciais.</p>
            </div>
            <span className="text-[11px] font-semibold mt-4 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              Acessar módulo <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </span>
          </Link>
        ) : (
          <div className={lockedCardClass}>
            <div>
              <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center mb-3 text-base">🔒</div>
              <h3 className="text-xs sm:text-sm font-semibold">Gestão de Fornecedores</h3>
              <p className="text-xs mt-1">Requer nível Gerente ou Administrador.</p>
            </div>
            <span className="text-[11px] font-semibold mt-4 text-rose-500">Acesso Negado</span>
          </div>
        )}

        <Link href={latestQuotationId ? `/cotacoes/respostas/${latestQuotationId}` : '/cotacoes'} className={cardClass}>
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 text-base group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">📊</div>
            <h3 className="text-xs sm:text-sm font-semibold">Comparador de Preços</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cruze cotações e descubra o melhor fornecedor.</p>
          </div>
          <span className="text-[11px] font-semibold mt-4 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            Acessar módulo <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
          </span>
        </Link>

        <Link href={latestQuotationId ? `/cotacoes/pedidos/${latestQuotationId}` : '/cotacoes'} className={cardClass}>
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 text-base group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">📦</div>
            <h3 className="text-xs sm:text-sm font-semibold">Pedidos para Distribuidores</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Visualize e envie os pedidos gerados via WhatsApp.</p>
          </div>
          <span className="text-[11px] font-semibold mt-4 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            Acessar módulo <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
          </span>
        </Link>

        <Link href="/produtos" className={cardClass}>
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 text-base group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">🏷️</div>
            <h3 className="text-xs sm:text-sm font-semibold">Catálogo de Produtos</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Visualize itens, imagens e estoques cadastrados.</p>
          </div>
          <span className="text-[11px] font-semibold mt-4 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            Acessar módulo <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
          </span>
        </Link>

        {canImportData ? (
          <Link href="/importar" className={cardClass}>
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 text-base group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">📥</div>
              <h3 className="text-xs sm:text-sm font-semibold">Central de Importação</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Importe produtos e dados em lote com inteligência.</p>
            </div>
            <span className="text-[11px] font-semibold mt-4 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              Acessar módulo <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </span>
          </Link>
        ) : (
          <div className={lockedCardClass}>
            <div>
              <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center mb-3 text-base">🔒</div>
              <h3 className="text-xs sm:text-sm font-semibold">Central de Importação</h3>
              <p className="text-xs mt-1">Requer nível Supervisor ou superior.</p>
            </div>
            <span className="text-[11px] font-semibold mt-4 text-rose-500">Acesso Restrito</span>
          </div>
        )}

        <Link href="/relatorios/comparativo" className={cardClass}>
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 text-base group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">📈</div>
            <h3 className="text-xs sm:text-sm font-semibold">Relatório Comparativo</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Análise de preços lado a lado por fornecedor.</p>
          </div>
          <span className="text-[11px] font-semibold mt-4 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            Acessar módulo <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
          </span>
        </Link>
      </div>
    </section>
  );
}