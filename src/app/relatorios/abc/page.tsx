'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { getCompanyId } from '@/lib/companySession';
import { apiFetch } from '@/lib/apiClient';
import { BarChart3 } from 'lucide-react';

interface ABCItem {
  id: string;
  description: string;
  totalRevenue: number;
  totalQuantity: number;
  stockCurrent: number;
  revenueShare: number;
  classification: 'A' | 'B' | 'C';
}

export default function ABCReportPage() {
  const { isDarkMode } = useTheme();
  const companyId = getCompanyId();

  const [products, setProducts] = useState<ABCItem[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');

  useEffect(() => {
    let isMounted = true;

    async function loadABCCurve() {
      if (!companyId) return;
      try {
        setLoading(true);
        const res = await apiFetch(`/api/reports/abc-curve?companyId=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            setProducts(data.products);
            setGrandTotal(data.grandTotalRevenue);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar Curva ABC:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadABCCurve();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const filteredProducts = filterClass === 'ALL' 
    ? products 
    : products.filter(p => p.classification === filterClass);

  const formatMoney = (val: number) => Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const classA = products.filter(p => p.classification === 'A');
  const classB = products.filter(p => p.classification === 'B');
  const classC = products.filter(p => p.classification === 'C');

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Inteligência de Inventário - Curva ABC"
        subtitle="Classificação de Pareto (Classes A, B e C) com base no faturamento de vendas."
        onOpenCmd={() => {}}
      />

      <main className="max-w-6xl mx-auto px-6 -mt-8 pb-20 relative z-20 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link href="/" className="font-bold text-xs bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 inline-flex items-center gap-2">
            &larr; Voltar ao Início
          </Link>

          {/* Filtros por Classe */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              type="button"
              onClick={() => setFilterClass('ALL')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterClass === 'ALL' ? 'bg-indigo-600 text-white shadow-md' : 'opacity-60 hover:opacity-100'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterClass('A')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterClass === 'A' ? 'bg-emerald-600 text-white shadow-md' : 'opacity-60 hover:opacity-100'
              }`}
            >
              Classe A ({classA.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterClass('B')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterClass === 'B' ? 'bg-blue-600 text-white shadow-md' : 'opacity-60 hover:opacity-100'
              }`}
            >
              Classe B ({classB.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterClass('C')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterClass === 'C' ? 'bg-amber-600 text-white shadow-md' : 'opacity-60 hover:opacity-100'
              }`}
            >
              Classe C ({classC.length})
            </button>
          </div>
        </div>

        {/* Resumo Executivo das Classes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-6 rounded-3xl border shadow-xl space-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Classe A (Até 70% Faturamento)</span>
            <div className="text-2xl font-black font-mono">
              {classA.length} <span className="text-xs font-sans opacity-60">itens</span>
            </div>
            <p className="text-[11px] opacity-50 font-mono">Campeões de vendas (Críticos)</p>
          </div>

          <div className={`p-6 rounded-3xl border shadow-xl space-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block">Classe B (Próximos 20%)</span>
            <div className="text-2xl font-black font-mono">
              {classB.length} <span className="text-xs font-sans opacity-60">itens</span>
            </div>
            <p className="text-[11px] opacity-50 font-mono">Importância intermediária</p>
          </div>

          <div className={`p-6 rounded-3xl border shadow-xl space-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">Classe C (Últimos 10%)</span>
            <div className="text-2xl font-black font-mono">
              {classC.length} <span className="text-xs font-sans opacity-60">itens</span>
            </div>
            <p className="text-[11px] opacity-50 font-mono">Baixo giro / Capital parado</p>
          </div>
        </div>

        {/* Tabela de Classificação ABC */}
        <div className={`p-8 rounded-3xl border shadow-xl space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 border-b pb-4 border-slate-500/10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">Matriz Analítica de Pareto (Curva ABC)</h3>
              <p className="text-xs opacity-60">Faturamento total avaliado: {formatMoney(grandTotal)}</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs opacity-50 font-mono">A calcular curva ABC de produtos...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-xs opacity-40 font-mono">Nenhum produto encontrado nesta categoria ou sem histórico de vendas.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b uppercase tracking-wider text-[10px] font-extrabold opacity-60 border-slate-500/10">
                    <th className="p-3 text-center">Classe</th>
                    <th className="p-3">Descrição do Produto</th>
                    <th className="p-3 text-center">Qtd. Vendida</th>
                    <th className="p-3 text-right">Faturamento Total</th>
                    <th className="p-3 text-right">% do Faturamento</th>
                    <th className="p-3 text-center">Stock Atual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-500/10 text-xs">
                  {filteredProducts.map((item) => {
                    const isA = item.classification === 'A';
                    const isB = item.classification === 'B';

                    return (
                      <tr key={item.id} className="hover:bg-slate-500/5 transition">
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-1 rounded-md font-extrabold text-[10px] uppercase ${
                            isA ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                            isB ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                            'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}>
                            Classe {item.classification}
                          </span>
                        </td>
                        <td className="p-3 font-sans font-bold">{item.description}</td>
                        <td className="p-3 text-center font-bold">{item.totalQuantity} un</td>
                        <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(item.totalRevenue)}</td>
                        <td className="p-3 text-right font-bold">{item.revenueShare.toFixed(2)}%</td>
                        <td className="p-3 text-center font-bold">{item.stockCurrent} un</td>
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