'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { QuotationFinancialKPIs } from './QuotationFinancialKPIs';
import { QuotationStrategyBar } from './QuotationStrategyBar';

interface QuotationItem {
  productId: string;
  description: string;
  ean?: string | null;
  imageUrl?: string | null;
  requestedQuantity: number;
  sellingPrice: number;
  responses: Record<string, { price: number; outOfStock: boolean }>;
}

interface QuotationSupplier {
  supplierId: string;
  name?: string | null;
  status?: string | null;
}

interface QuotationTableProps {
  productsList: QuotationItem[];
  suppliers: QuotationSupplier[];
  selectedChoices: Record<string, string>;
  onSelectChoice: (productId: string, supplierId: string) => void;
  onSelectAllForSupplier: (supplierId: string) => void;
  formatCurrency: (value: number | null | undefined) => string;
}

export default function QuotationTable({
  productsList,
  suppliers,
  selectedChoices,
  onSelectChoice,
  onSelectAllForSupplier,
  formatCurrency,
}: QuotationTableProps) {
  const { isDarkMode } = useTheme();
  const [filterType, setFilterType] = useState<'ALL' | 'HIGH' | 'LOW'>('ALL');
  const [targetMargin, setTargetMargin] = useState<number>(40);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'winners'>('all');

  let totalAllocatedValue = 0;
  let totalMarketAverageValue = 0;
  let itemsWithValidResponse = 0;

  const supplierTotals: Record<string, number> = {};
  suppliers.forEach((sup) => {
    supplierTotals[sup.supplierId] = 0;
  });

  productsList.forEach((prod) => {
    const validPrices: number[] = [];
    suppliers.forEach((sup) => {
      const resp = prod.responses[sup.supplierId];
      if (resp && !resp.outOfStock && resp.price > 0) {
        validPrices.push(resp.price);
      }
    });

    if (validPrices.length > 0) {
      itemsWithValidResponse++;
      const avgPrice = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;
      totalMarketAverageValue += avgPrice * prod.requestedQuantity;
    }

    const chosenSup = selectedChoices[prod.productId];
    if (chosenSup && prod.responses[chosenSup]) {
      const resp = prod.responses[chosenSup];
      if (resp && !resp.outOfStock && resp.price > 0) {
        const itemTotal = resp.price * prod.requestedQuantity;
        totalAllocatedValue += itemTotal;
        supplierTotals[chosenSup] = (supplierTotals[chosenSup] || 0) + itemTotal;
      }
    }
  });

  const economyAmount = totalMarketAverageValue > totalAllocatedValue ? totalMarketAverageValue - totalAllocatedValue : 0;
  const economyPercent = totalMarketAverageValue > 0 ? (economyAmount / totalMarketAverageValue) * 100 : 0;
  const fulfillmentRate = productsList.length > 0 ? (itemsWithValidResponse / productsList.length) * 100 : 0;

  const getProductMarginData = (prod: QuotationItem) => {
    let menorPreco = Infinity;
    let melhorFornecedorId = '';
    const selectedSupplierId = selectedChoices[prod.productId];
    let custoEscolhido = 0;

    suppliers.forEach((sup) => {
      const resp = prod.responses[sup.supplierId];
      if (resp && !resp.outOfStock && resp.price > 0) {
        if (resp.price < menorPreco) {
          menorPreco = resp.price;
          melhorFornecedorId = sup.supplierId;
        }
        if (sup.supplierId === selectedSupplierId) {
          custoEscolhido = resp.price;
        }
      }
    });

    const custoReferencia = custoEscolhido > 0 ? custoEscolhido : (menorPreco !== Infinity ? menorPreco : 0);
    const precoVenda = prod.sellingPrice || 34.99;
    let margemCalc = 0;
    if (custoReferencia > 0 && precoVenda > 0) {
      margemCalc = ((precoVenda - custoReferencia) / precoVenda) * 100;
    }

    return { margem: margemCalc, bestSupplierId: melhorFornecedorId };
  };

  const filteredProducts = productsList.filter((prod) => {
    const { margem, bestSupplierId } = getProductMarginData(prod);
    if (filterType === 'HIGH' && margem < targetMargin) return false;
    if (filterType === 'LOW' && margem >= targetMargin) return false;

    const term = searchTerm.toLowerCase();
    const matchesSearch = prod.description.toLowerCase().includes(term) || (prod.ean && prod.ean.toLowerCase().includes(term));
    if (!matchesSearch) return false;

    const hasChoice = Boolean(selectedChoices[prod.productId]);
    if (statusFilter === 'pending' && hasChoice) return false;
    if (statusFilter === 'winners') {
      const currentChoice = selectedChoices[prod.productId];
      if (!currentChoice || currentChoice !== bestSupplierId) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <QuotationFinancialKPIs
        totalAllocatedValue={totalAllocatedValue}
        economyAmount={economyAmount}
        economyPercent={economyPercent}
        fulfillmentRate={fulfillmentRate}
        itemsWithValidResponse={itemsWithValidResponse}
        totalProducts={productsList.length}
        formatCurrency={formatCurrency}
      />

      <QuotationStrategyBar
        targetMargin={targetMargin}
        setTargetMargin={setTargetMargin}
        filterType={filterType}
        setFilterType={setFilterType}
        totalProductsCount={productsList.length}
      />

      {/* Tabela de Disputa Principal */}
      <div className={`rounded-3xl shadow-2xl border overflow-hidden transition-all ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-slate-200/50'
      }`}>
        <div className={`border-b p-6 md:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ${
          isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50/80'
        }`}>
          <div>
            <h2 className="text-base font-black tracking-tight">Disputa de Menor Preço e Seleção de Compra</h2>
            <p className="text-xs opacity-60 mt-0.5">{filteredProducts.length} de {productsList.length} itens exibidos no mapa comparativo.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Pesquisar por nome ou EAN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full sm:w-64 px-4 py-2.5 text-xs border rounded-2xl outline-none font-medium transition-all ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600'
              }`}
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-500/10 opacity-70 hover:opacity-100'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'pending' ? 'bg-amber-600 text-white' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                }`}
              >
                ⚠️ Pendentes
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('winners')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'winners' ? 'bg-emerald-600 text-white' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                }`}
              >
                🏆 Vencedores
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b uppercase tracking-wider text-[11px] font-extrabold ${
                isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-950/30' : 'border-slate-200 text-slate-500 bg-slate-50/80'
              }`}>
                <th className="p-5 font-extrabold min-w-[300px]">Produto / EAN / Qtd</th>
                {suppliers.map((sup) => {
                  const isFullySelected = productsList.every((prod) => selectedChoices[prod.productId] === sup.supplierId);
                  const supTotal = supplierTotals[sup.supplierId] || 0;
                  const freeShippingMin = 450;
                  const hasFreeShipping = supTotal >= freeShippingMin;
                  const missingForFree = freeShippingMin - supTotal;

                  return (
                    <th key={sup.supplierId} className="p-5 text-center min-w-[220px] border-l border-slate-500/10">
                      <div className="font-black text-sm tracking-tight">{sup.name || 'Fornecedor'}</div>
                      <div className="mt-2 space-y-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          💳 30/60 Dias Billet
                        </span>
                        <div>
                          {hasFreeShipping ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[8px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              🚚 Frete Grátis Liberado!
                            </span>
                          ) : (
                            <span className="inline-block opacity-75 text-[9px] font-semibold">
                              📦 Faltam {formatCurrency(missingForFree)} p/ Frete Grátis
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => onSelectAllForSupplier(sup.supplierId)}
                          className="text-[11px] bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white px-3.5 py-2 rounded-xl font-bold transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                        >
                          {isFullySelected ? '✓ Todos Selecionados' : '⚡ Comprar tudo aqui'}
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-500/10">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={suppliers.length + 1} className="px-6 py-20 text-center opacity-50 italic text-xs font-semibold">
                    Nenhum produto encontrado com os filtros informados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  let menorPreco = Infinity;
                  let melhorFornecedorId = '';
                  suppliers.forEach((sup) => {
                    const resp = prod.responses[sup.supplierId];
                    if (resp && !resp.outOfStock && resp.price > 0 && resp.price < menorPreco) {
                      menorPreco = resp.price;
                      melhorFornecedorId = sup.supplierId;
                    }
                  });

                  return (
                    <tr key={prod.productId} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}`}>
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl border border-slate-500/20 bg-slate-500/5 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                            {prod.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={prod.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm opacity-50">📦</span>
                            )}
                          </div>
                          <div>
                            <div className="font-black text-sm tracking-tight">{prod.description}</div>
                            <div className="text-[11px] opacity-60 font-mono mt-0.5 flex items-center gap-2">
                              <span>EAN: {prod.ean || 'N/A'}</span>
                              <span>•</span>
                              <strong className="text-indigo-600 dark:text-indigo-400">Qtd: {prod.requestedQuantity}</strong>
                            </div>
                          </div>
                        </div>
                      </td>

                      {suppliers.map((sup) => {
                        const resp = prod.responses[sup.supplierId];
                        const isVencedor = resp && !resp.outOfStock && resp.price > 0 && sup.supplierId === melhorFornecedorId;
                        const isSelected = selectedChoices[prod.productId] === sup.supplierId;

                        return (
                          <td key={sup.supplierId} className={`p-5 text-center border-l border-slate-500/10 transition-all ${
                            isSelected ? (isDarkMode ? 'bg-indigo-950/50' : 'bg-indigo-50/80') : isVencedor ? (isDarkMode ? 'bg-emerald-950/30' : 'bg-emerald-50/40') : ''
                          }`}>
                            {!resp ? (
                              <span className="opacity-40 italic text-xs font-medium">Sem resposta</span>
                            ) : resp.outOfStock ? (
                              <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                Esgotado
                              </span>
                            ) : resp.price === 0 ? (
                              <span className="opacity-40">—</span>
                            ) : (
                              <div className="space-y-2.5 flex flex-col items-center">
                                <div className="flex items-center justify-center gap-2">
                                  <span className={`font-mono font-bold ${isVencedor ? 'text-emerald-600 dark:text-emerald-400 text-sm font-black' : 'opacity-80 text-xs'}`}>
                                    {formatCurrency(resp.price)}
                                  </span>
                                  {isVencedor && (
                                    <span className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                                      🏆 Menor Preço
                                    </span>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => onSelectChoice(prod.productId, sup.supplierId)}
                                  className={`w-full py-2 px-4 rounded-xl text-xs font-extrabold transition-all shadow-sm active:scale-95 cursor-pointer ${
                                    isSelected
                                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                                      : 'bg-slate-500/10 opacity-80 hover:opacity-100 hover:bg-slate-500/20'
                                  }`}
                                >
                                  {isSelected ? '✓ Selecionado' : 'Selecionar'}
                                </button>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>

            <tfoot className={`border-t font-mono font-bold text-xs ${
              isDarkMode ? 'border-slate-800 bg-slate-950/90 text-white' : 'border-slate-200 bg-slate-100 text-slate-900'
            }`}>
              <tr>
                <td className="p-6 uppercase tracking-wider text-xs font-black">Total Alocado por Fornecedor:</td>
                {suppliers.map((sup) => {
                  const supplierTotal = supplierTotals[sup.supplierId] || 0;
                  return (
                    <td key={sup.supplierId} className="p-6 text-center border-l border-slate-500/10">
                      <span className="text-emerald-600 dark:text-emerald-400 text-base font-black">
                        {formatCurrency(supplierTotal)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}