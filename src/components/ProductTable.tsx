'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { ProductTableRow } from '@/components/ProductTableRow';

interface Product {
  id: string;
  description: string;
  ean?: string | null;
  brand?: string | null;
  imageUrl?: string | null;
  unit: string;
  boxQuantity: number;
  costPrice?: string | null;
  lastPurchasePrice?: string | null;
  salePrice?: string | null;
  stockCurrent: number;
  stockMin: number;
  stockIdeal: number;
  stockMax: number;
  ncm?: string | null;
  cest?: string | null;
  isKit?: boolean;
}

interface ProductTableProps {
  products: Product[];
  brands: string[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedBrand: string;
  setSelectedBrand: (val: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  companyId?: string;
  onRefresh?: () => void;
}

export function ProductTable({
  products,
  brands,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  selectedBrand,
  setSelectedBrand,
  onEdit,
  onDelete,
  companyId = '',
  onRefresh,
}: ProductTableProps) {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [quickFilter, setQuickFilter] = useState<'all' | 'critical' | 'zero'>('all');

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const desc = p.description?.toLowerCase() || '';
    const brandName = p.brand?.toLowerCase() || '';
    const barcode = p.ean?.toLowerCase() || '';

    const matchesSearch = desc.includes(term) || brandName.includes(term) || barcode.includes(term);
    const matchesBrand = selectedBrand ? p.brand === selectedBrand : true;

    const currentStock = p.stockCurrent ?? 0;
    const minStock = p.stockMin ?? 0;

    let matchesQuickFilter = true;
    if (quickFilter === 'critical') {
      matchesQuickFilter = currentStock <= minStock;
    } else if (quickFilter === 'zero') {
      matchesQuickFilter = currentStock === 0;
    }

    return matchesSearch && matchesBrand && matchesQuickFilter;
  });

  const calculateMargin = (cost?: string | null, sale?: string | null) => {
    const c = parseFloat(cost || '0');
    const s = parseFloat(sale || '0');
    if (c > 0 && s >= c) {
      return (((s - c) / c) * 100).toFixed(0);
    }
    return '0';
  };

  const handleQuickQuote = (productId: string) => {
    router.push(`/cotacoes/nova?productId=${productId}`);
  };

  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      alert('Nenhum produto para exportar.');
      return;
    }

    const headers = ['ID', 'Descricao', 'EAN', 'Marca', 'Unidade', 'Custo (R$)', 'Venda (R$)', 'Margem (%)', 'Estoque Atual', 'Estoque Min', 'Estoque Ideal'];
    const rows = filteredProducts.map((p) => {
      const cost = p.costPrice || '0';
      const sale = p.salePrice || '0';
      const margin = calculateMargin(p.costPrice, p.salePrice);
      return [
        p.id,
        `"${p.description.replace(/"/g, '""')}"`,
        p.ean || '',
        `"${(p.brand || '').replace(/"/g, '""')}"`,
        p.unit,
        cost.replace('.', ','),
        sale.replace('.', ','),
        margin,
        p.stockCurrent,
        p.stockMin,
        p.stockIdeal,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `catalogo_produtos_melo_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`p-8 rounded-3xl shadow-2xl border space-y-6 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/80'}`}>
      
      {/* Cabeçalho, Filtros e Exportação */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-5 border-slate-500/10">
        <div>
          <h2 className="text-base font-black tracking-tight">Catálogo de Produtos Cadastrados</h2>
          <p className="text-xs opacity-60 mt-0.5">Gestão de preços, estoque rápido e auditoria da empresa.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleExportCSV}
            title="Exportar para Excel / CSV"
            className="px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            📊 Exportar Relatório CSV
          </button>

          <span className="text-xs font-mono font-bold opacity-70 bg-slate-500/10 px-3 py-2.5 rounded-xl whitespace-nowrap">
            {filteredProducts.length} itens
          </span>
        </div>
      </div>

      {/* Botões de Filtros Rápidos por Grupo */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider opacity-60 mr-2">Filtro Rápido:</span>
        <button
          type="button"
          onClick={() => setQuickFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            quickFilter === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-500/10 opacity-70 hover:opacity-100'
          }`}
        >
          Todos
        </button>
        <button
          type="button"
          onClick={() => setQuickFilter('critical')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            quickFilter === 'critical' ? 'bg-rose-600 text-white shadow-md' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
          }`}
        >
          🔴 Estoque Crítico
        </button>
        <button
          type="button"
          onClick={() => setQuickFilter('zero')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            quickFilter === 'zero' ? 'bg-amber-600 text-white shadow-md' : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
          }`}
        >
          📦 Sem Estoque (Zero)
        </button>
      </div>

      {/* Busca e Filtro de Marcas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Pesquise por descrição, marca ou código de barras (EAN)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-4 py-3 text-xs border rounded-2xl outline-none font-medium transition-all ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'
            }`}
          />
        </div>

        <div>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className={`w-full px-4 py-3 text-xs border rounded-2xl outline-none font-medium transition-all ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value="">Todas as Marcas</option>
            {brands.map((brandName) => (
              <option key={brandName} value={brandName}>{brandName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Listagem em Tabela */}
      {loading ? (
        <p className="text-xs opacity-60 text-center py-16 font-medium">Carregando catálogo de produtos...</p>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-xs font-semibold">{error}</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-500/20 rounded-3xl">
          <p className="opacity-60 text-xs font-medium">Nenhum produto encontrado com os filtros informados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b uppercase tracking-wider text-[11px] font-bold ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                <th className="p-3 w-12 text-center">Foto</th>
                <th className="p-3 font-bold">Produto / Marca / EAN</th>
                <th className="p-3 font-bold text-right">Custo</th>
                <th className="p-3 font-bold text-right">Venda (R$) / Margem</th>
                <th className="p-3 font-bold text-center">Estoque Atual (⚡ Rápido)</th>
                <th className="p-3 font-bold text-center">Mín / Ideal / Máx</th>
                <th className="p-3 font-bold text-right">Ações & Cotação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-500/10">
              {filteredProducts.map((p) => (
                <ProductTableRow
                  key={p.id}
                  product={p}
                  isDarkMode={isDarkMode}
                  companyId={companyId}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onQuickQuote={handleQuickQuote}
                  onRefresh={onRefresh}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}