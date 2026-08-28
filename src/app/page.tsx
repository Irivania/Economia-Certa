'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [productCount, setProductCount] = useState(0);
  const [quotationCount, setQuotationCount] = useState(0);
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
          const products = await pRes.json();
          setProductCount(Array.isArray(products) ? products.length : 0);
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
              <a href="/produtos" className="text-blue-600 hover:text-blue-800 text-xs font-semibold">
                Ver catálogo completo &rarr;
              </a>
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
              <a href="/cotacoes" className="text-blue-600 hover:text-blue-800 text-xs font-semibold">
                Gerenciar cotações &rarr;
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Módulo de Importação</p>
              <h3 className="text-lg font-bold text-slate-700 mt-2">Planilhas & Dados</h3>
            </div>
            <div className="mt-4">
              <a href="/importar" className="text-blue-600 hover:text-blue-800 text-xs font-semibold">
                Acessar importador &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* Atalhos Rápidos e Ações */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Acessos Rápidos do Sistema</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <a
              href="/cotacoes"
              className="p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
            >
              <h3 className="font-bold text-slate-800 group-hover:text-blue-600 text-sm">📊 Comparador de Preços</h3>
              <p className="text-xs text-slate-500 mt-1">Cruze cotações e descubra o melhor fornecedor.</p>
            </a>

            <a
              href="/produtos"
              className="p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
            >
              <h3 className="font-bold text-slate-800 group-hover:text-blue-600 text-sm">📦 Catálogo de Produtos</h3>
              <p className="text-xs text-slate-500 mt-1">Visualize itens e preços cadastrados.</p>
            </a>

            <a
              href="/importar"
              className="p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
            >
              <h3 className="font-bold text-slate-800 group-hover:text-blue-600 text-sm">📥 Central de Importação</h3>
              <p className="text-xs text-slate-500 mt-1">Importe produtos e dados em lote.</p>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}