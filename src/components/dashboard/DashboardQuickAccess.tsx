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

  const featuredCardClass = `p-5 sm:p-6 rounded-2xl border-2 transition-all duration-200 group flex flex-col justify-between ${
    isDarkMode 
      ? 'border-indigo-500/40 bg-gradient-to-br from-indigo-950/40 to-slate-900 hover:border-indigo-500 text-slate-100 shadow-lg shadow-indigo-950/20' 
      : 'border-indigo-300 bg-gradient-to-br from-indigo-50/60 to-white hover:border-indigo-500 text-slate-900 shadow-lg shadow-indigo-100/50'
  }`;

  const lockedCardClass = `p-4 sm:p-5 rounded-xl border flex flex-col justify-between cursor-not-allowed opacity-60 ${
    isDarkMode 
      ? 'border-slate-800/80 bg-slate-900/20 text-slate-400' 
      : 'border-slate-200 bg-slate-100/50 text-slate-500'
  }`;

  return (
    <section className={`${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200/90 text-slate-900'} rounded-xl p-6 sm:p-7 shadow-xs border space-y-6`}>
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-sm font-bold tracking-tight">Acessos Rápidos do Sistema</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Navegue rapidamente pelos principais módulos operacionais da sua empresa.</p>
        </div>
        <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
          v3.5 Pro
        </span>
      </div>

      {/* OS 3 PILARES ESTRATÉGICOS EM DESTAQUE NO TOPO */}
      <div>
        <div className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">
          ⭐ Pilares Executivos Principais
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* 1. PDV & Balcão de Vendas */}
          <Link href="/pdv" className={featuredCardClass}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-all">🛒</div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">Essencial</span>
              </div>
              <h3 className="text-sm font-extrabold">PDV & Balcão de Vendas</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Terminal de atendimento rápido, caixa e baixa em tempo real.</p>
            </div>
            <span className="text-xs font-bold mt-5 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              Acessar Terminal <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </span>
          </Link>

          {/* 2. Comparador de Preços / Cotações */}
          <Link href={latestQuotationId ? `/cotacoes/respostas/${latestQuotationId}` : '/cotacoes'} className={featuredCardClass}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-all">📊</div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Compras</span>
              </div>
              <h3 className="text-sm font-extrabold">Comparador de Preços</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cruze cotações via WhatsApp e descubra o melhor fornecedor.</p>
            </div>
            <span className="text-xs font-bold mt-5 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              Acessar Módulo <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </span>
          </Link>

          {/* 3. Contas a Pagar & Boletos (Financeiro) */}
          <Link href="/financeiro/pagar" className={featuredCardClass}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-all">💳</div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Financeiro</span>
              </div>
              <h3 className="text-sm font-extrabold">Contas a Pagar & Boletos</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Controle de vencimentos, boletos e fluxo de caixa.</p>
            </div>
            <span className="text-xs font-bold mt-5 text-amber-600 dark:text-amber-400 flex items-center gap-1">
              Acessar Módulo <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </span>
          </Link>

        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
        <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
          Demais Módulos Operacionais
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Convênios & Funcionários */}
          <Link href="/financeiro/convenios" className={cardClass}>
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 text-base group-hover:scale-110 transition-all">🤝</div>
              <h3 className="text-xs sm:text-sm font-semibold">Convênios & Funcionários</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Desconto em folha e limites de crédito.</p>
            </div>
            <span className="text-[11px] font-semibold mt-4 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              Gerenciar <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </span>
          </Link>

          {/* Catálogo de Produtos */}
          <Link href="/produtos" className={cardClass}>
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 text-base group-hover:scale-110 transition-all">🏷️</div>
              <h3 className="text-xs sm:text-sm font-semibold">Catálogo de Produtos</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Visualize itens e estoques cadastrados.</p>
            </div>
            <span className="text-[11px] font-semibold mt-4 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              Acessar <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </span>
          </Link>

          {/* Entrada de Notas Fiscais */}
          <Link href="/notas/entrada" className={cardClass}>
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 text-base group-hover:scale-110 transition-all">📄</div>
              <h3 className="text-xs sm:text-sm font-semibold">Entrada de Notas (XML)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dê entrada em mercadorias via NF-e.</p>
            </div>
            <span className="text-[11px] font-semibold mt-4 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              Acessar <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </span>
          </Link>

          {/* Inteligência de Margens */}
          <Link href="/relatorios/margens" className={cardClass}>
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 text-base group-hover:scale-110 transition-all">💎</div>
              <h3 className="text-xs sm:text-sm font-semibold">Inteligência de Margens</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Auditoria de custo vs preço de venda.</p>
            </div>
            <span className="text-[11px] font-semibold mt-4 text-purple-600 dark:text-purple-400 flex items-center gap-1">
              Acessar <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </span>
          </Link>

          {/* Gestão de Fornecedores */}
          {canManageSuppliers ? (
            <Link href="/fornecedores" className={cardClass}>
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 text-base group-hover:scale-110 transition-all">🤝</div>
                <h3 className="text-xs sm:text-sm font-semibold">Fornecedores</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cadastre distribuidoras e marcas.</p>
              </div>
              <span className="text-[11px] font-semibold mt-4 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                Acessar <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </span>
            </Link>
          ) : (
            <div className={lockedCardClass}>
              <div>
                <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center mb-3 text-base">🔒</div>
                <h3 className="text-xs sm:text-sm font-semibold">Fornecedores</h3>
                <p className="text-xs mt-1">Requer nível Gerente/Admin.</p>
              </div>
              <span className="text-[11px] font-semibold mt-4 text-rose-500">Bloqueado</span>
            </div>
          )}

          {/* Pedidos para Distribuidores */}
          <Link href={latestQuotationId ? `/cotacoes/pedidos/${latestQuotationId}` : '/cotacoes'} className={cardClass}>
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 text-base group-hover:scale-110 transition-all">📦</div>
              <h3 className="text-xs sm:text-sm font-semibold">Pedidos WhatsApp</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Visualize e envie pedidos gerados.</p>
            </div>
            <span className="text-[11px] font-semibold mt-4 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              Acessar <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </span>
          </Link>

          {/* Central de Importação */}
          {canImportData ? (
            <Link href="/importar" className={cardClass}>
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 text-base group-hover:scale-110 transition-all">📥</div>
                <h3 className="text-xs sm:text-sm font-semibold">Importação em Lote</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Importe produtos e dados facilmente.</p>
              </div>
              <span className="text-[11px] font-semibold mt-4 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                Acessar <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </span>
            </Link>
          ) : (
            <div className={lockedCardClass}>
              <div>
                <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center mb-3 text-base">🔒</div>
                <h3 className="text-xs sm:text-sm font-semibold">Importação em Lote</h3>
                <p className="text-xs mt-1">Requer nível Supervisor+.</p>
              </div>
              <span className="text-[11px] font-semibold mt-4 text-rose-500">Bloqueado</span>
            </div>
          )}

          {/* Relatório Comparativo */}
          <Link href="/relatorios/comparativo" className={cardClass}>
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 text-base group-hover:scale-110 transition-all">📈</div>
              <h3 className="text-xs sm:text-sm font-semibold">Relatório Comparativo</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Análise de preços por fornecedor.</p>
            </div>
            <span className="text-[11px] font-semibold mt-4 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              Acessar <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </span>
          </Link>

        </div>
      </div>
    </section>
  );
}