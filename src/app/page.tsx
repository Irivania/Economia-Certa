'use client';

import { useEffect, useState, useSyncExternalStore, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { ToastContainer } from '@/components/ToastContainer';
import { CommandMenu } from '@/components/CommandMenu';

const subscribeToHydration = () => () => {};

interface Product {
  id: string;
  description: string;
  internalCode?: string;
  stockCurrent?: number;
  stockMin?: number;
}

interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'warning';
}

export default function DashboardPage() {
  const { isDarkMode } = useTheme();

  const [productCount, setProductCount] = useState(0);
  const [quotationCount, setQuotationCount] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';
  const latestQuotationId = 'd7f46ae7-19c2-409d-8ab4-dfbb458c5248';

  const addToast = (title: string, description: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      setIsCmdOpen((open) => !open);
    }
    if (e.key === 'Escape') {
      setIsCmdOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        const [pRes, qRes] = await Promise.all([
          fetch(`/api/products?companyId=${companyId}`),
          fetch(`/api/quotations?companyId=${companyId}`),
        ]);

        if (pRes.ok) {
          const products: Product[] = await pRes.json();
          setProductCount(Array.isArray(products) ? products.length : 0);

          const criticalItems = products.filter(
            (p) => (p.stockCurrent ?? 0) <= (p.stockMin ?? 0) && (p.stockMin ?? 0) > 0
          );
          setLowStockProducts(criticalItems);
        }

        if (qRes.ok) {
          const quotations = await qRes.json();
          setQuotationCount(Array.isArray(quotations) ? quotations.length : 0);
        }
      } catch (err) {
        console.error('Erro ao carregar métricas do dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, [companyId]);

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* HEADER GLOBAL UNIFICADO */}
      <AppHeader
        title="Economia Certa"
        subtitle="Painel gerencial inteligente e controle de compras em tempo real."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 -mt-12 pb-20 relative z-20 space-y-8">
        
        <div className={`p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
          <div className="flex items-center gap-2 text-xs">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold">💡 Dica Pro:</span>
            <span>Pressione <kbd className="px-2 py-0.5 rounded bg-slate-500/20 font-mono text-[11px] font-bold">Ctrl + K</kbd> para abrir a busca rápida.</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => addToast('Ação Simulada', 'Link de cotação copiado para o WhatsApp com sucesso!', 'success')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-bold transition-colors border border-emerald-500/20"
            >
              Testar Toast WhatsApp 📲
            </button>
            <button 
              onClick={() => setIsCmdOpen(true)}
              className="text-xs font-bold text-indigo-500 hover:underline px-2"
            >
              Abrir Menu &rarr;
            </button>
          </div>
        </div>

        {/* Alerta de Estoque Crítico */}
        {!loading && lowStockProducts.length > 0 && (
          <div className={`${isDarkMode ? 'bg-rose-950/40 border-rose-900 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'} border backdrop-blur-md rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all`}>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-500/20 rounded-xl text-rose-600 mt-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold">
                  Alerta de Reposição Urgente ({lowStockProducts.length} itens críticos)
                </h3>
                <p className="text-xs opacity-80 mt-0.5">
                  Existem produtos abaixo do estoque mínimo estabelecido. Recomendamos iniciar uma cotação imediata.
                </p>
              </div>
            </div>
            <Link
              href="/produtos"
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-rose-600/25 whitespace-nowrap"
            >
              Ver Produtos &rarr;
            </Link>
          </div>
        )}

        {/* Métricas Principais (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'} rounded-2xl p-6 shadow-xl border flex flex-col justify-between transition-all group`}>
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Produtos Cadastrados</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                  </svg>
                  +14% este mês
                </span>
              </div>
              <div className="text-4xl font-black mt-3">
                {loading ? '...' : productCount}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-500/20 flex items-center justify-between">
              <span className="text-[11px] text-emerald-500 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-md">Ativo no Catálogo</span>
              <Link href="/produtos" className="text-xs font-bold hover:underline flex items-center gap-1">
                Ver catálogo &rarr;
              </Link>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'} rounded-2xl p-6 shadow-xl border flex flex-col justify-between transition-all group`}>
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Cotações Abertas</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7 7 7-7" />
                  </svg>
                  Ativas hoje
                </span>
              </div>
              <div className="text-4xl font-black mt-3">
                {loading ? '...' : quotationCount}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-500/20 flex items-center justify-between">
              <span className="text-[11px] text-amber-500 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-md">Aguardando Respostas</span>
              <Link href="/cotacoes" className="text-xs font-bold hover:underline flex items-center gap-1">
                Gerenciar &rarr;
              </Link>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'} rounded-2xl p-6 shadow-xl border flex flex-col justify-between transition-all group`}>
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Módulo de Importação</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                  </svg>
                  100% Sincronizado
                </span>
              </div>
              <div className="text-2xl font-black mt-3">Planilhas & Dados</div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-500/20 flex items-center justify-between">
              <span className="text-[11px] text-blue-500 font-semibold bg-blue-500/10 px-2.5 py-1 rounded-md">Pronto para uso</span>
              <Link href="/importar" className="text-xs font-bold hover:underline flex items-center gap-1">
                Acessar &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Acessos Rápidos do Sistema */}
        <section className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'} rounded-2xl p-8 shadow-xl border space-y-6`}>
          <div className="border-b border-slate-500/20 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-base font-black tracking-tight">Acessos Rápidos do Sistema</h2>
              <p className="text-xs opacity-60 mt-0.5">Navegue rapidamente pelos principais módulos operacionais da Melo Perfumaria.</p>
            </div>
            <span className="text-xs font-mono font-bold opacity-70 bg-slate-500/10 px-2.5 py-1 rounded-lg">v3.2 Pro</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/fornecedores"
              className={`p-5 rounded-xl border transition-all group flex flex-col justify-between ${isDarkMode ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-950 hover:border-slate-700' : 'border-slate-200/60 bg-slate-50/50 hover:bg-white hover:border-slate-300'}`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  🤝
                </div>
                <h3 className="text-sm font-bold transition-colors">Gestão de Fornecedores</h3>
                <p className="text-xs opacity-60 mt-1">Cadastre distribuidoras e representantes comerciais.</p>
              </div>
              <span className="text-[11px] font-bold mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Acessar módulo &rarr;
              </span>
            </Link>

            <Link
              href={`/cotacoes/respostas/${latestQuotationId}`}
              className={`p-5 rounded-xl border transition-all group flex flex-col justify-between ${isDarkMode ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-950 hover:border-slate-700' : 'border-slate-200/60 bg-slate-50/50 hover:bg-white hover:border-slate-300'}`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  📊
                </div>
                <h3 className="text-sm font-bold transition-colors">Comparador de Preços</h3>
                <p className="text-xs opacity-60 mt-1">Cruze cotações e descubra o melhor fornecedor.</p>
              </div>
              <span className="text-[11px] font-bold mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Acessar módulo &rarr;
              </span>
            </Link>

            <Link
              href={`/cotacoes/pedidos/${latestQuotationId}`}
              className={`p-5 rounded-xl border transition-all group flex flex-col justify-between ${isDarkMode ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-950 hover:border-slate-700' : 'border-slate-200/60 bg-slate-50/50 hover:bg-white hover:border-slate-300'}`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  📦
                </div>
                <h3 className="text-sm font-bold transition-colors">Pedidos para Distribuidores</h3>
                <p className="text-xs opacity-60 mt-1">Visualize e envie os pedidos gerados via WhatsApp.</p>
              </div>
              <span className="text-[11px] font-bold mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Acessar módulo &rarr;
              </span>
            </Link>

            <Link
              href="/produtos"
              className={`p-5 rounded-xl border transition-all group flex flex-col justify-between ${isDarkMode ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-950 hover:border-slate-700' : 'border-slate-200/60 bg-slate-50/50 hover:bg-white hover:border-slate-300'}`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  🏷️
                </div>
                <h3 className="text-sm font-bold transition-colors">Catálogo de Produtos</h3>
                <p className="text-xs opacity-60 mt-1">Visualize itens, imagens e estoques cadastrados.</p>
              </div>
              <span className="text-[11px] font-bold mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Acessar módulo &rarr;
              </span>
            </Link>

            <Link
              href="/importar"
              className={`p-5 rounded-xl border transition-all group flex flex-col justify-between ${isDarkMode ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-950 hover:border-slate-700' : 'border-slate-200/60 bg-slate-50/50 hover:bg-white hover:border-slate-300'}`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  📥
                </div>
                <h3 className="text-sm font-bold transition-colors">Central de Importação</h3>
                <p className="text-xs opacity-60 mt-1">Importe produtos e dados em lote com inteligência.</p>
              </div>
              <span className="text-[11px] font-bold mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Acessar módulo &rarr;
              </span>
            </Link>

            <Link
              href="/relatorios/comparativo"
              className={`p-5 rounded-xl border transition-all group flex flex-col justify-between ${isDarkMode ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-950 hover:border-slate-700' : 'border-slate-200/60 bg-slate-50/50 hover:bg-white hover:border-slate-300'}`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  📈
                </div>
                <h3 className="text-sm font-bold transition-colors">Relatório Comparativo</h3>
                <p className="text-xs opacity-60 mt-1">Análise de preços lado a lado por fornecedor.</p>
              </div>
              <span className="text-[11px] font-bold mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Acessar módulo &rarr;
              </span>
            </Link>

          </div>
        </section>

      </main>

      {/* COMPONENTES MODULARIZADOS */}
      <ToastContainer toasts={toasts} isDarkMode={isDarkMode} />
      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId={latestQuotationId} />

    </div>
  );
}