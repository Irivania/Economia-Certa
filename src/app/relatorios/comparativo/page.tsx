'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';

interface QuotationItem {
  id: string;
  productId: string;
  supplierId?: string | null;
  requestedQuantity?: number | string | null;
  price?: number | string | null;
  outOfStock?: boolean | null;
  description?: string;
  brand?: string | null;
  ean?: string | null;
}

interface QuotationSupplier {
  id: string;
  supplierId: string;
  name?: string | null;
  status?: string | null;
}

interface Quotation {
  id: string;
  title: string;
  suppliers?: QuotationSupplier[];
  items?: QuotationItem[];
}

const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function Page() {
  const { isDarkMode } = useTheme();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string>('');
  const [detailedQuotation, setDetailedQuotation] = useState<Quotation | null>(null);
  const [loadingQuotations, setLoadingQuotations] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
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

  useEffect(() => {
    async function fetchQuotations() {
      try {
        const res = await fetch(`/api/quotations?companyId=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setQuotations(data);
            setSelectedQuotationId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar cotações:', err);
      } finally {
        setLoadingQuotations(false);
      }
    }
    fetchQuotations();
  }, []);

  useEffect(() => {
    if (!selectedQuotationId) return;

    async function loadQuotationDetails() {
      try {
        setLoadingDetails(true);
        const res = await fetch(`/api/quotations/${selectedQuotationId}`);
        if (res.ok) {
          const data = await res.json();
          setDetailedQuotation(data);
        } else {
          setDetailedQuotation(null);
        }
      } catch (err) {
        console.error('Erro ao carregar detalhes da cotação:', err);
        setDetailedQuotation(null);
      } finally {
        setLoadingDetails(false);
      }
    }

    loadQuotationDetails();
  }, [selectedQuotationId]);

  const suppliers = detailedQuotation?.suppliers || [];
  const rawItems = detailedQuotation?.items || [];

  const productsMap: Record<string, {
    productId: string;
    description: string;
    requestedQuantity: number;
    responses: Record<string, { price: number; outOfStock: boolean }>;
  }> = {};

  rawItems.forEach((item) => {
    const prodKey = item.productId;
    if (!productsMap[prodKey]) {
      productsMap[prodKey] = {
        productId: item.productId,
        description: item.description || 'Produto sem descrição',
        requestedQuantity: Number(item.requestedQuantity || 1),
        responses: {},
      };
    }

    if (item.supplierId) {
      productsMap[prodKey].responses[item.supplierId] = {
        price: Number(item.price || 0),
        outOfStock: Boolean(item.outOfStock),
      };
    }
  });

  const productsList = Object.values(productsMap);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* HEADER GLOBAL UNIFICADO */}
      <AppHeader
        title="Economia Certa"
        subtitle="Painel gerencial inteligente e controle de compras em tempo real."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 -mt-12 pb-20 relative z-25 space-y-8">
        
        {/* Cartão Principal do Relatório */}
        <div className={`rounded-3xl border p-8 shadow-2xl transition-all space-y-6 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900 shadow-slate-200/50'
        }`}>
          
          {/* Cabeçalho do Cartão e Navegação */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-500/10 gap-4">
            <div>
              <span className="inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-500 border border-indigo-500/20 mb-2">
                Inteligência Analítica
              </span>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">📈 Relatório Comparativo de Preços</h1>
              <p className="text-xs opacity-60 mt-1 font-medium">Análise lado a lado de preços por fornecedor baseada na cotação selecionada.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/" className="text-xs font-bold opacity-70 hover:opacity-100 transition flex items-center gap-1.5">
                &larr; Voltar ao Dashboard
              </Link>
              <Link href="/cotacoes" className="rounded-2xl bg-slate-500/10 hover:bg-slate-500/20 px-4 py-2.5 text-xs font-bold transition-all">
                Gerenciar Cotações &rarr;
              </Link>
              {selectedQuotationId && (
                <Link href={`/cotacoes/pedidos/${selectedQuotationId}`} className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/25 transition-all">
                  📦 Ver Pedidos
                </Link>
              )}
            </div>
          </div>

          {/* Seletor de Cotação */}
          <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center gap-4 transition-all ${
            isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className="w-full sm:w-1/3">
              <label className="block text-[10px] font-black uppercase tracking-wider opacity-60 mb-1.5">
                Selecione a Cotação
              </label>
              <select
                value={selectedQuotationId}
                onChange={(e) => setSelectedQuotationId(e.target.value)}
                disabled={loadingQuotations}
                className={`w-full rounded-xl border px-3 py-2 text-xs font-bold outline-none transition-all ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                {loadingQuotations ? (
                  <option>Carregando cotações...</option>
                ) : quotations.length === 0 ? (
                  <option>Nenhuma cotação encontrada</option>
                ) : (
                  quotations.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="w-full sm:w-2/3 flex items-end">
              <p className="text-xs opacity-60 font-medium">
                💡 O relatório cruza automaticamente os valores respondidos por cada distribuidora nesta cotação.
              </p>
            </div>
          </div>

          {/* Tabela de Comparação */}
          <div className="overflow-hidden rounded-2xl border border-slate-500/10 shadow-sm">
            {loadingDetails ? (
              <div className="p-16 text-center text-xs opacity-50 font-medium">Carregando dados comparativos...</div>
            ) : productsList.length === 0 ? (
              <div className="p-16 text-center text-xs opacity-50 font-medium">
                Nenhum dado encontrado para esta cotação.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className={`border-b uppercase tracking-wider text-[11px] font-extrabold ${
                      isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-950/30' : 'border-slate-200 text-slate-500 bg-slate-50/80'
                    }`}>
                      <th className="p-4 font-extrabold min-w-[220px]">Produto</th>
                      <th className="p-4 text-center font-extrabold">Qtd</th>
                      {suppliers.map((sup) => (
                        <th key={sup.supplierId} className="p-4 text-center font-extrabold border-l border-slate-500/10 min-w-[160px]">
                          {sup.name || 'Fornecedor'}
                        </th>
                      ))}
                      <th className="p-4 text-center font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-l border-slate-500/10 min-w-[180px]">
                        Melhor Preço
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-500/10">
                    {productsList.map((prod) => {
                      let menorPreco = Infinity;
                      let melhorFornecedor = '';

                      suppliers.forEach((sup) => {
                        const resp = prod.responses[sup.supplierId];
                        if (resp && !resp.outOfStock && resp.price > 0 && resp.price < menorPreco) {
                          menorPreco = resp.price;
                          melhorFornecedor = sup.name || 'Fornecedor';
                        }
                      });

                      return (
                        <tr key={prod.productId} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}`}>
                          <td className="p-4 font-bold text-sm tracking-tight">{prod.description}</td>
                          <td className="p-4 text-center font-mono font-bold opacity-80">{prod.requestedQuantity}</td>

                          {suppliers.map((sup) => {
                            const resp = prod.responses[sup.supplierId];
                            const isBest = resp && !resp.outOfStock && resp.price > 0 && resp.price === menorPreco;

                            return (
                              <td
                                key={sup.supplierId}
                                className={`p-4 text-center border-l border-slate-500/10 transition-all ${
                                  isBest ? (isDarkMode ? 'bg-emerald-950/40 font-black text-emerald-400' : 'bg-emerald-50/60 font-black text-emerald-800') : 'opacity-80'
                                }`}
                              >
                                {!resp ? (
                                  <span className="opacity-40 italic text-[11px]">Sem resposta</span>
                                ) : resp.outOfStock ? (
                                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                    Não tem
                                  </span>
                                ) : resp.price === 0 ? (
                                  <span className="opacity-40">—</span>
                                ) : (
                                  <div>
                                    <span className="font-mono font-semibold">{formatCurrency(resp.price)}</span>
                                    {isBest && (
                                      <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider mt-0.5">🏆 Menor Preço</div>
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}

                          <td className="p-4 text-center font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-l border-slate-500/10">
                            {menorPreco !== Infinity ? `${formatCurrency(menorPreco)} (${melhorFornecedor})` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* MENU DE COMANDOS */}
      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId={selectedQuotationId} />

    </div>
  );
}