'use client';

import React from 'react';

interface ProductItem {
  productId: string;
  description: string;
  ean?: string | null;
  brand?: string | null;
  imageUrl?: string | null;
  requestedQuantity: number;
  responses: Record<string, { price: number; outOfStock: boolean }>;
}

interface QuotationSupplier {
  id: string;
  supplierId: string;
  name?: string | null;
  status?: string | null;
}

interface QuotationComparisonTableProps {
  productsList: ProductItem[];
  suppliers: QuotationSupplier[];
  selectedChoices: Record<string, string>;
  onSelectChoice: (productId: string, supplierId: string | null) => void;
  onSelectAllForSupplier: (supplierId: string) => void;
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function QuotationComparisonTable({
  productsList,
  suppliers,
  selectedChoices,
  onSelectChoice,
  onSelectAllForSupplier,
}: QuotationComparisonTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 flex justify-between items-center">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Disputa de Menor Preço e Seleção de Compra
        </h2>
        <span className="text-[11px] text-slate-500">
          Selecione o fornecedor ou clique novamente para cancelar a compra do item (enviar para pendências)
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

                            {/* Botão para alternar ou cancelar a seleção (enviar para pendências) */}
                            <button
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  // Se já estava selecionado deste fornecedor, remove a escolha para não comprar de nenhum
                                  onSelectChoice(prod.productId, null);
                                } else {
                                  // Seleciona este fornecedor
                                  onSelectChoice(prod.productId, sup.supplierId);
                                }
                              }}
                              className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded cursor-pointer border transition font-medium ${
                                isSelected
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
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
  );
}