'use client';

import React, { useState } from 'react';

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
  const [filterType, setFilterType] = useState<'ALL' | 'HIGH' | 'LOW'>('ALL');
  const [targetMargin, setTargetMargin] = useState<number>(40);

  const getProductMarginData = (prod: QuotationItem) => {
    let menorPreco = Infinity;
    let melhorFornecedorId = '';
    let melhorFornecedorNome = 'N/A';
    const selectedSupplierId = selectedChoices[prod.productId];
    let custoEscolhido = 0;

    suppliers.forEach((sup) => {
      const resp = prod.responses[sup.supplierId];
      if (resp && !resp.outOfStock && resp.price > 0) {
        if (resp.price < menorPreco) {
          menorPreco = resp.price;
          melhorFornecedorId = sup.supplierId;
          melhorFornecedorNome = sup.name || 'Fornecedor';
        }
        if (sup.supplierId === selectedSupplierId) {
          custoEscolhido = resp.price;
        }
      }
    });

    const custoReferencia = custoEscolhido > 0 ? custoEscolhido : (menorPreco !== Infinity ? menorPreco : 0);
    const fornecedorAtivo = selectedSupplierId 
      ? (suppliers.find(s => s.supplierId === selectedSupplierId)?.name || 'Fornecedor') 
      : melhorFornecedorNome;

    const precoVenda = prod.sellingPrice || 34.99;
    let margemCalc = 0;
    if (custoReferencia > 0 && precoVenda > 0) {
      margemCalc = ((precoVenda - custoReferencia) / precoVenda) * 100;
    }

    return {
      custo: custoReferencia,
      precoVenda,
      margem: margemCalc,
      fornecedor: fornecedorAtivo,
      bestSupplierId: melhorFornecedorId,
    };
  };

  const filteredProducts = productsList.filter((prod) => {
    const { margem } = getProductMarginData(prod);
    if (filterType === 'HIGH') return margem >= targetMargin;
    if (filterType === 'LOW') return margem < targetMargin;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Barra de Filtros Estratégicos */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Filtro Estratégico por Rentabilidade</h3>
          <p className="text-[11px] text-slate-500">Selecione &quot;Todos&quot; para a disputa completa ou filtre para ver a lista segmentada.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <span className="text-xs text-slate-600 font-medium">Margem Alvo:</span>
            <input
              type="number"
              value={targetMargin}
              onChange={(e) => setTargetMargin(Number(e.target.value) || 0)}
              className="w-16 bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-center font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            />
            <span className="text-xs text-slate-600 font-bold">%</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                filterType === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({productsList.length})
            </button>
            <button
              onClick={() => setFilterType('HIGH')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                filterType === 'HIGH'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              🟢 Acima de {targetMargin}%
            </button>
            <button
              onClick={() => setFilterType('LOW')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                filterType === 'LOW'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              🟠 Abaixo de {targetMargin}%
            </button>
          </div>
        </div>
      </div>

      {/* Renderização Condicional */}
      {filterType === 'ALL' ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Disputa de Menor Preço e Seleção de Compra ({filteredProducts.length} de {productsList.length} itens exibidos)
            </h2>
            <span className="text-[11px] text-slate-500">
              Selecione o fornecedor ou clique novamente para cancelar a compra do item
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold min-w-[220px]">Produto</th>
                  <th className="px-4 py-3 font-semibold text-center">Qtd</th>
                  {suppliers.map((sup) => (
                    <th key={sup.supplierId} className="px-4 py-3 font-semibold text-center min-w-[180px] border-l border-slate-200">
                      <div className="font-bold text-slate-800">{sup.name || 'Fornecedor'}</div>
                      <div className="text-[10px] text-slate-400 font-normal uppercase mb-1.5">{sup.status}</div>
                      <button
                        onClick={() => onSelectAllForSupplier(sup.supplierId)}
                        className="text-[10px] bg-white border border-indigo-200 text-indigo-600 px-2 py-0.5 rounded hover:bg-indigo-50 font-medium transition"
                      >
                        Comprar tudo aqui
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productsList.map((prod) => {
                  let menorPreco = Infinity;
                  suppliers.forEach((sup) => {
                    const resp = prod.responses[sup.supplierId];
                    if (resp && !resp.outOfStock && resp.price > 0 && resp.price < menorPreco) {
                      menorPreco = resp.price;
                    }
                  });

                  return (
                    <tr key={prod.productId} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 min-w-[2.5rem] flex items-center justify-center rounded border bg-white overflow-hidden text-xs">
                            {prod.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={prod.imageUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              '📦'
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{prod.description}</p>
                            <p className="text-[10px] text-slate-400 font-mono">EAN: {prod.ean || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700">{prod.requestedQuantity}</td>

                      {suppliers.map((sup) => {
                        const resp = prod.responses[sup.supplierId];
                        const isVencedor = resp && !resp.outOfStock && resp.price > 0 && resp.price === menorPreco;
                        const isSelected = selectedChoices[prod.productId] === sup.supplierId;

                        return (
                          <td key={sup.supplierId} className={`px-4 py-3 text-center border-l border-slate-100 ${isVencedor ? 'bg-emerald-50/40' : ''}`}>
                            {!resp ? (
                              <span className="text-slate-400 italic">Sem resposta</span>
                            ) : resp.outOfStock ? (
                              <span className="text-red-600 font-semibold text-[10px] bg-red-50 px-2 py-0.5 rounded">Não tem</span>
                            ) : resp.price === 0 ? (
                              <span className="text-slate-400">—</span>
                            ) : (
                              <div className="space-y-1.5 flex flex-col items-center">
                                <p className={`font-bold ${isVencedor ? 'text-emerald-700 text-sm' : 'text-slate-700'}`}>
                                  {formatCurrency(resp.price)}
                                </p>
                                {isVencedor && (
                                  <span className="inline-block bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                    🏆 Menor Preço
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => onSelectChoice(prod.productId, sup.supplierId)}
                                  className={`flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-md cursor-pointer border transition font-medium ${
                                    isSelected
                                      ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  <span>{isSelected ? '✓ Selecionado' : 'Selecionar'}</span>
                                </button>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>

              <tfoot className="bg-slate-100 font-bold text-slate-800 border-t border-slate-200">
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-right uppercase text-[11px] tracking-wider">
                    Total Selecionado por Fornecedor:
                  </td>
                  {suppliers.map((sup) => {
                    const supplierTotal = productsList.reduce((acc, prod) => {
                      if (selectedChoices[prod.productId] === sup.supplierId) {
                        const resp = prod.responses[sup.supplierId];
                        if (resp && !resp.outOfStock) {
                          return acc + resp.price * prod.requestedQuantity;
                        }
                      }
                      return acc;
                    }, 0);

                    return (
                      <td key={sup.supplierId} className="px-4 py-4 text-center border-l border-slate-200 text-indigo-700 text-sm">
                        {formatCurrency(supplierTotal)}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        /* Tela Segmentada (Acima de / Abaixo de) */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex justify-between items-center">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Produtos na Listagem Segmentada ({filteredProducts.length} itens)
            </h4>
            <span className="text-xs text-slate-500">
              Marque a caixa de seleção para incluir ou excluir o item da compra
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-center font-semibold w-16">Incluir</th>
                  <th className="px-4 py-3 font-semibold min-w-[220px]">Produto</th>
                  <th className="px-4 py-3 font-semibold text-center">Qtd</th>
                  <th className="px-4 py-3 font-semibold text-center">Preço de Venda</th>
                  <th className="px-4 py-3 font-semibold text-center">Custo (Melhor Preço)</th>
                  <th className="px-4 py-3 font-semibold text-center">Distribuidor</th>
                  <th className="px-4 py-3 font-semibold text-center">Margem de Lucro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                      Nenhum produto encontrado nesta faixa de margem.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => {
                    const { custo, precoVenda, margem, fornecedor, bestSupplierId } = getProductMarginData(prod);
                    const isSelected = Boolean(selectedChoices[prod.productId]);

                    return (
                      <tr key={prod.productId} className={`hover:bg-slate-50/80 transition ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                onSelectChoice(prod.productId, '');
                              } else if (bestSupplierId) {
                                onSelectChoice(prod.productId, bestSupplierId);
                              }
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 min-w-[2.5rem] flex items-center justify-center rounded border bg-white overflow-hidden text-xs">
                              {prod.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={prod.imageUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                '📦'
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{prod.description}</p>
                              <p className="text-[10px] text-slate-400 font-mono">EAN: {prod.ean || 'N/A'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-center font-bold text-slate-700">{prod.requestedQuantity}</td>
                        <td className="px-4 py-4 text-center font-semibold text-slate-800">{formatCurrency(precoVenda)}</td>
                        <td className="px-4 py-4 text-center font-bold text-emerald-700">{formatCurrency(custo)}</td>
                        <td className="px-4 py-4 text-center font-medium text-slate-700">{fornecedor}</td>

                        <td className="px-4 py-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded text-xs font-extrabold ${
                            margem >= targetMargin ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {margem.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}