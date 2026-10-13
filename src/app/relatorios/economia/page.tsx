'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { getCompanyId } from '@/lib/companySession';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';

interface SavingItem {
  productId: string;
  description: string;
  quantity: number;
  currentCost: number;
  offeredPrice: number;
  originalTotal: number;
  optimizedTotal: number;
  saving: number;
}

interface Summary {
  totalOriginalCost: number;
  totalOptimizedCost: number;
  totalSavings: number;
  savingsPercentage: number;
}

export default function SavingsReportPage() {
  const { isDarkMode } = useTheme();
  const [companyId] = useState(() => getCompanyId());
  const [quotationId, setQuotationId] = useState('');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [details, setDetails] = useState<SavingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

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

  const fetchSavingsReport = async () => {
    if (!quotationId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/savings?companyId=${companyId}&quotationId=${quotationId}`);
      const json = await response.json();
      if (response.ok) {
        setSummary(json.summary);
        setDetails(json.details);
      } else {
        alert(json.error || 'Erro ao carregar relatório');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* HEADER GLOBAL UNIFICADO */}
      <AppHeader
        title="Economia Certa"
        subtitle="Painel gerencial inteligente e controle de compras em tempo real."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20 relative z-20 space-y-6">
        
        {/* Cartão Principal */}
        <div className={`rounded-xl border p-6 sm:p-7 shadow-xs transition-all space-y-6 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900'
        }`}>
          
          {/* Cabeçalho com Navegação */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-100 dark:border-slate-800 gap-4 print:hidden">
            <div>
              <span className="inline-flex rounded-md bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
                💰 Relatório de Economia Gerada
              </span>
              <h1 className="text-base md:text-lg font-bold tracking-tight">Simulação de redução de custos nas compras</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Analise a diferença de valores entre o custo base e o preço otimizado nas negociações.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5">
              {details.length > 0 && (
                <button
                  onClick={() => window.print()}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  🖨️ Imprimir / PDF
                </button>
              )}
              <Link href="/" className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-lg shadow-xs border border-slate-200 dark:border-slate-800 transition hover:text-indigo-600 dark:hover:text-indigo-400">
                &larr; Dashboard
              </Link>
              <Link href="/cotacoes" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3.5 py-2 rounded-lg border border-indigo-500/20 transition hover:bg-indigo-500/20">
                Ir para Cotações &rarr;
              </Link>
            </div>
          </div>

          {/* Input de Pesquisa */}
          <div className="flex gap-3 mb-6 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 print:hidden items-center">
            <input
              type="text"
              placeholder="Digite o ID da Cotação..."
              value={quotationId}
              onChange={(e) => setQuotationId(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg flex-1 uppercase text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-mono shadow-xs"
            />
            <button
              onClick={fetchSavingsReport}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-emerald-500 transition shadow-xs cursor-pointer"
            >
              {loading ? 'Calculando...' : 'Calcular Economia'}
            </button>
          </div>

          {/* Cards de Resumo */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Custo Total Base (Anterior)</p>
                <p className="text-lg font-bold font-mono text-slate-700 dark:text-slate-300 mt-1">R$ {summary.totalOriginalCost.toFixed(2)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Custo Otimizado (Cotação)</p>
                <p className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">R$ {summary.totalOptimizedCost.toFixed(2)}</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/30 shadow-xs">
                <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">Economia Total Gerada</p>
                <p className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                  R$ {summary.totalSavings.toFixed(2)} ({summary.savingsPercentage.toFixed(1)}%)
                </p>
              </div>
            </div>
          )}

          {/* Tabela de Detalhes */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 uppercase text-[11px] font-bold tracking-wider">
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3 text-center">Qtd</th>
                  <th className="px-4 py-3 text-right">Custo Base Unit.</th>
                  <th className="px-4 py-3 text-right">Preço Ofertado</th>
                  <th className="px-4 py-3 text-right">Economia no Item</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {details.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 font-medium">
                      Nenhum dado encontrado. Informe uma cotação válida para ver a simulação de economia.
                    </td>
                  </tr>
                ) : (
                  details.map((item, index) => (
                    <tr key={`${item.productId}-${index}`} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 align-middle">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{item.description}</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-600 dark:text-slate-400">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">R$ {item.currentCost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">R$ {item.offeredPrice.toFixed(2)}</td>
                      <td className={`px-4 py-3 text-right font-mono font-bold ${item.saving >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                        R$ {item.saving.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </main>

      {/* MENU DE COMANDOS */}
      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId={quotationId} />

    </div>
  );
}