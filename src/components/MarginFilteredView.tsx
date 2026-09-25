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
}

interface MarginFilteredViewProps {
  productsList: QuotationItem[];
  suppliers: QuotationSupplier[];
  selectedChoices: Record<string, string>;
  onSelectChoice: (productId: string, supplierId: string) => void;
  formatCurrency: (value: number | null | undefined) => string;
}

export default function MarginFilteredView({
  productsList,
  suppliers,
  selectedChoices,
  onSelectChoice,
  formatCurrency,
}: MarginFilteredViewProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'HIGH' | 'LOW'>('ALL');
  const [targetMargin, setTargetMargin] = useState<number>(40);

  // Calcula margem e identifica o fornecedor vencedor/escolhido
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

    // Se o utilizador já escolheu um distribuidor específico, usa o custo dele; senão usa o menor preço (referência)
    const custoReferencia = custoEscolhido > 0 ? custoEscolhido : (menorPreco !== Infinity ? menorPreco : 0);
    const fornecedorAtivo = selectedSupplierId 
      ? (suppliers.find(s => s.supplierId === selectedSupplierId)?.name || 'Fornecedor') 
      : melhorFornecedorNome;

    const precoVenda = prod.sellingPrice || 34.99;
    let margem = 0;
    if (custoReferencia > 0 && precoVenda > 0) {
      margem = ((precoVenda - custoReferencia) / precoVenda) * 100;
    }

    return {
      custo: custoReferencia,
      precoVenda,
      margem,
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
    <div className="space-y-6">
      {/* Controlo de Filtro Executivo */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
            Filtro Executivo de Rentabilidade
          </span>
          <h3 className="text-base font-bold text-slate-800 mt-1">Lista Segmentada por Margem</h3>
          <p className="text-xs text-slate-500">Selecione a faixa desejada para gerir e selecionar itens rapidamente.</p>
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

      {/* Tabela da Lista Segmentada */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex justify-between items-center">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Produtos na Listagem ({filteredProducts.length} itens)
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
                      {/* Caixa de Seleção (Incluir / Excluir da Compra) */}
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              // Se já está selecionado, remove (exclui)
                              onSelectChoice(prod.productId, '');
                            } else if (bestSupplierId) {
                              // Se não está selecionado, inclui com o melhor fornecedor por defeito
                              onSelectChoice(prod.productId, bestSupplierId);
                            }
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          title="Marcar para incluir/excluir da compra"
                        />
                      </td>

                      {/* Informações do Produto */}
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

                      {/* Margem Formatada */}
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
    </div>
  );
}