'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  description: string;
  internalCode?: string;
  stockCurrent?: number;
  stockMin?: number;
}

export default function DashboardPage() {
  const [productCount, setProductCount] = useState(0);
  const [quotationCount, setQuotationCount] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // UUID real e oficial da Melo Perfumaria
  const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';

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

          // Filtra produtos com estoque crítico (atual <= mínimo)
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

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Cabeçalho */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">✨ Economia Certa ERP</h1>
            <p className="text-slate-600 text-sm mt-1">Melo Perfumaria — Painel Gerencial e Controle de Compras</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
              Ambiente Ativo
            </span>
          </div>
        </div>

        {/* Alerta Inteligente de Estoque Crítico */}
        {!loading && lowStockProducts.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-rose-800 flex items-center gap-2">
                <span>🚨</span> Alerta de Reposição Urgente ({lowStockProducts.length} itens críticos)
              </h3>
              <p className="text-xs text-rose-600 mt-1">
                Existem produtos com estoque atual igual ou abaixo do mínimo estabelecido. Recomendamos iniciar uma cotação.
              </p>
            </div>
            <Link
              href="/produtos"
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Verificar Produtos &rarr;
            </Link>
          </div>
        )}

        {/* Cards de Métricas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Produtos Cadastrados</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-2">
                {loading ? '...' : productCount}
              </h3>
            </div>
            <div className="mt-4">
              <Link href="/produtos" className="text-blue-600 hover:text-blue-800 text-xs font-semibold">
                Ver catálogo completo &rarr;
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cotações Abertas</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-2">
                {loading ? '...' : quotationCount}
              </h3>
            </div>
            <div className="mt-4">
              <Link href="/cotacoes" className="text-blue-600 hover:text-blue-800 text-xs font-semibold">
                Gerenciar cotações &rarr;
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Módulo de Importação</p>
              <h3 className="text-lg font-bold text-slate-700 mt-2">Planilhas & Dados</h3>
            </div>
            <div className="mt-4">
              <Link href="/importar" className="text-blue-600 hover:text-blue-800 text-xs font-semibold">
                Acessar importador &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Atalhos Rápidos e Ações */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Acessos Rápidos do Sistema</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              href="/cotacoes"
              className="p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
            >
              <h3 className="font-bold text-slate-800 group-hover:text-blue-600 text-sm">📊 Comparador de Preços</h3>
              <p className="text-xs text-slate-500 mt-1">Cruze cotações e descubra o melhor fornecedor.</p>
            </Link>

            <Link
              href="/produtos"
              className="p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
            >
              <h3 className="font-bold text-slate-800 group-hover:text-blue-600 text-sm">📦 Catálogo de Produtos</h3>
              <p className="text-xs text-slate-500 mt-1">Visualize itens, imagens e estoques cadastrados.</p>
            </Link>

            <Link
              href="/importar"
              className="p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
            >
              <h3 className="font-bold text-slate-800 group-hover:text-blue-600 text-sm">📥 Central de Importação</h3>
              <p className="text-xs text-slate-500 mt-1">Importe produtos e dados em lote.</p>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}