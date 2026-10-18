'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { getCompanyId } from '@/lib/companySession';
import { apiFetch } from '@/lib/apiClient';

interface ProductMarginItem {
  id: string;
  description: string;
  brand: string;
  ean: string | null;
  imageUrl: string | null;
  costPrice: number;
  salePrice: number;
  stockCurrent: number;
  margin: number;
  status: 'ALERTA_MARGEM' | 'SAUDAVEL';
}

export default function MarginsReportPage() {
  const { isDarkMode } = useTheme();
  const companyId = getCompanyId();

  const [loading, setLoading] = useState(true);
  const [targetMargin, setTargetMargin] = useState<string>('40');
  const [numericTarget, setNumericTarget] = useState<number>(40);
  
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    alertCount: 0,
    averageMargin: 0,
    targetMargin: 40,
  });
  const [products, setProducts] = useState<ProductMarginItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'alert'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [editingPrices, setEditingPrices] = useState<{ [key: string]: string }>({});

  const loadReport = useCallback(async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const res = await apiFetch(`/api/reports/margins?companyId=${companyId}&targetMargin=${numericTarget}`);
      if (!res.ok) throw new Error('Erro ao carregar dados de margem.');
      const data = await res.json();
      
      if (data.success) {
        setMetrics(data.metrics);
        setProducts(data.products);

        const initialPrices: { [key: string]: string } = {};
        data.products.forEach((p: ProductMarginItem) => {
          initialPrices[p.id] = String(p.salePrice || 0);
        });
        setEditingPrices(initialPrices);
      }
    } catch (err) {
      console.error('Erro ao gerar relatório de margens:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId, numericTarget]);

  useEffect(() => {
    let isMounted = true;

    async function fetchMarginsData() {
      if (!companyId) return;
      try {
        if (isMounted) setLoading(true);
        const res = await apiFetch(`/api/reports/margins?companyId=${companyId}&targetMargin=${numericTarget}`);
        if (!res.ok) throw new Error('Erro ao carregar dados de margem.');
        const data = await res.json();
        
        if (isMounted && data.success) {
          setMetrics(data.metrics);
          setProducts(data.products);

          const initialPrices: { [key: string]: string } = {};
          data.products.forEach((p: ProductMarginItem) => {
            initialPrices[p.id] = String(p.salePrice || 0);
          });
          setEditingPrices(initialPrices);
        }
      } catch (err) {
        console.error('Erro ao gerar relatório de margens:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchMarginsData();

    return () => {
      isMounted = false;
    };
  }, [companyId, numericTarget]);

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTargetMargin(val);
    const parsed = Number(val);
    if (!isNaN(parsed) && val.trim() !== '') {
      setNumericTarget(parsed);
    }
  };

  const handleSavePrice = async (productId: string, newSalePrice: number) => {
    try {
      const res = await apiFetch('/api/products/update-price', {
        method: 'PATCH',
        body: JSON.stringify({
          productId,
          companyId,
          salePrice: newSalePrice,
        }),
      });

      if (!res.ok) throw new Error('Erro ao atualizar preço.');
      await loadReport();
    } catch (err) {
      console.error(err);
      alert('Não foi possível atualizar o preço do produto.');
    }
  };

  const handleApplyTargetMargin = async (p: ProductMarginItem) => {
    const cost = Number(p.costPrice || 0);
    if (cost <= 0) {
      alert('Este produto não possui preço de custo válido.');
      return;
    }

    const idealPrice = cost / (1 - numericTarget / 100);
    const roundedPrice = Number(idealPrice.toFixed(2));

    setEditingPrices((prev) => ({ ...prev, [p.id]: String(roundedPrice) }));
    await handleSavePrice(p.id, roundedPrice);
  };

  const filteredProducts = products.filter((p) => {
    const currentSale = Number(editingPrices[p.id] ?? p.salePrice);
    const currentCost = Number(p.costPrice || 0);
    const currentMargin = currentSale > 0 ? ((currentSale - currentCost) / currentSale) * 100 : 0;

    if (filterType === 'alert' && currentMargin >= numericTarget) return false;
    const term = searchTerm.toLowerCase();
    return p.description.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term) || (p.ean && p.ean.includes(term));
  });

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Inteligência de Margens & Lucratividade"
        subtitle="Monitoramento em tempo real do custo de entrada versus preço de venda cadastrado."
        onOpenCmd={() => {}}
      />

      <main className="max-w-7xl mx-auto px-6 -mt-8 pb-20 relative z-20 space-y-6">
        <div>
          <Link href="/" className="font-bold text-xs bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 inline-flex items-center gap-2">
            &larr; Voltar ao Início
          </Link>
        </div>

        {/* KPIs Executivos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-6 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-xs uppercase font-extrabold opacity-60">Margem Média do Catálogo</span>
            <div className="text-2xl font-black font-mono mt-1 text-indigo-600 dark:text-indigo-400">
              {metrics.averageMargin.toFixed(2)}%
            </div>
            <p className="text-[11px] opacity-50 mt-1">Baseado em {metrics.totalProducts} produtos ativos.</p>
          </div>

          <div className={`p-6 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-xs uppercase font-extrabold opacity-60">Meta de Margem Alvo (%)</span>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="number"
                min="1"
                max="99"
                value={targetMargin}
                onChange={handleTargetChange}
                className="w-24 px-3 py-1 text-base font-black font-mono border rounded-xl bg-slate-50 dark:bg-slate-950 text-center text-indigo-600 dark:text-indigo-400 outline-none"
              />
              <span className="text-xs font-bold opacity-85">Dinâmico</span>
            </div>
            <p className="text-[11px] opacity-50 mt-1">Altere o valor para auditar a meta desejada.</p>
          </div>

          <div className={`p-6 rounded-3xl border shadow-xl ${metrics.alertCount > 0 ? (isDarkMode ? 'bg-rose-950/30 border-rose-900/60' : 'bg-rose-50 border-rose-200') : (isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}`}>
            <span className="text-xs uppercase font-extrabold opacity-60">Itens em Alerta (Abaixo da Meta)</span>
            <div className={`text-2xl font-black font-mono mt-1 ${metrics.alertCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {metrics.alertCount} produtos
            </div>
            <p className="text-[11px] opacity-50 mt-1">Requer revisão de preço ou renegociação.</p>
          </div>
        </div>

        {/* Barra de Filtros e Pesquisa */}
        <div className={`p-6 rounded-3xl border shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${filterType === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-500/10 opacity-70'}`}
            >
              Todos os Produtos ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('alert')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${filterType === 'alert' ? 'bg-rose-600 text-white' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}
            >
              ⚠️ Alertas de Margem ({metrics.alertCount})
            </button>
          </div>

          <input
            type="text"
            placeholder="Pesquisar por descrição, marca ou EAN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 px-4 py-2.5 text-xs border border-slate-300 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950"
          />
        </div>

        {/* Tabela de Auditoria de Margens com Edição Inline e Ajuste Rápido */}
        <div className={`p-8 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          {loading ? (
            <p className="text-center py-12 text-xs opacity-50">Calculando margens de lucratividade...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center py-12 text-xs opacity-50">Nenhum produto encontrado com os filtros aplicados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b uppercase tracking-wider text-[11px] font-extrabold opacity-60 border-slate-500/10">
                    <th className="p-3 w-16 text-center">Foto</th>
                    <th className="p-3">Produto / Marca</th>
                    <th className="p-3 text-center">EAN</th>
                    <th className="p-3 text-center">Estoque</th>
                    <th className="p-3 text-right">Custo (R$)</th>
                    <th className="p-3 text-right">Preço Venda (R$) [Editável]</th>
                    <th className="p-3 text-center">Margem Atual</th>
                    <th className="p-3 text-center">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-500/10 font-mono">
                  {filteredProducts.map((p) => {
                    const cost = Number(p.costPrice || 0);
                    const saleInput = editingPrices[p.id] ?? String(p.salePrice || 0);
                    const saleNum = Number(saleInput) || 0;
                    const currentMargin = saleNum > 0 ? ((saleNum - cost) / saleNum) * 100 : 0;
                    const isBelowTarget = currentMargin < numericTarget;

                    return (
                      <tr key={p.id} className="hover:bg-slate-500/5 transition">
                        <td className="p-3 text-center">
                          <div className="w-10 h-10 rounded-xl border border-slate-500/20 bg-slate-500/5 flex items-center justify-center overflow-hidden mx-auto shadow-sm">
                            {p.imageUrl && p.imageUrl.startsWith('http') ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img 
                                src={p.imageUrl} 
                                alt="" 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = 'none';
                                  const fallback = e.currentTarget.nextElementSibling;
                                  if (fallback) (fallback as HTMLElement).style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <span className={`text-xs opacity-50 ${p.imageUrl && p.imageUrl.startsWith('http') ? 'hidden' : 'flex'}`}>📦</span>
                          </div>
                        </td>
                        <td className="p-3 font-sans">
                          <div className="font-bold">{p.description}</div>
                          <div className="text-[10px] opacity-60 uppercase">{p.brand}</div>
                        </td>
                        <td className="p-3 text-center opacity-75">{p.ean || 'N/A'}</td>
                        <td className="p-3 text-center font-bold text-indigo-600 dark:text-indigo-400">{p.stockCurrent} UN</td>
                        <td className="p-3 text-right">R$ {cost.toFixed(2)}</td>
                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-1 justify-end">
                            <span>R$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editingPrices[p.id] ?? ''}
                              onChange={(e) => setEditingPrices({ ...editingPrices, [p.id]: e.target.value })}
                              onBlur={(e) => handleSavePrice(p.id, Number(e.target.value))}
                              className="w-24 px-2 py-1 text-xs font-mono font-bold border rounded-lg bg-white dark:bg-slate-950 text-right outline-none focus:border-indigo-500"
                            />
                          </div>
                        </td>
                        <td className={`p-3 text-center font-bold text-sm ${isBelowTarget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {currentMargin.toFixed(1)}%
                        </td>
                        <td className="p-3 text-center font-sans">
                          <div className="flex items-center justify-center gap-2">
                            {isBelowTarget ? (
                              <span className="inline-block px-2 py-1 rounded-md text-[10px] font-extrabold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                🚨 Alerta
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-1 rounded-md text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                ✓ Saudável
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleApplyTargetMargin(p)}
                              className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition cursor-pointer"
                              title="Ajusta o preço automaticamente para atingir a meta escolhida"
                            >
                              ⚡ Ajustar para {numericTarget}%
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}