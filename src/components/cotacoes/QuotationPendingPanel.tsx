'use client';

import React from 'react';

interface ProductItem {
  productId: string;
  description: string;
  requestedQuantity: number;
  imageUrl?: string | null;
  responses: Record<string, { price: number; outOfStock: boolean }>;
}

interface QuotationPendingPanelProps {
  productsList: ProductItem[];
  suppliers: Array<{ supplierId: string }>;
  selectedChoices: Record<string, string>;
}

export default function QuotationPendingPanel({
  productsList,
  suppliers,
  selectedChoices,
}: QuotationPendingPanelProps) {
  const pendingProducts = productsList.filter((prod) => {
    const hasChoice = selectedChoices[prod.productId];
    const allOutOfStock = suppliers.every((sup) => {
      const resp = prod.responses[sup.supplierId];
      return !resp || resp.outOfStock || resp.price === 0;
    });
    return !hasChoice || allOutOfStock;
  });

  if (pendingProducts.length === 0) return null;

  const handleGenerateReport = () => {
    const titles = pendingProducts
      .map((p) => `- ${p.description} (Qtd: ${p.requestedQuantity})`)
      .join('\n');
    alert(`Lista de Pendências:\n\n${titles}`);
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
            ⚠️ Atenção: Gestão de Pendências
          </span>
          <h3 className="text-base font-bold text-amber-900 mt-1">
            Produtos sem fornecedor selecionado ou não atendidos ({pendingProducts.length})
          </h3>
          <p className="text-xs text-amber-700">
            Estes itens não tiveram propostas válidas, ficaram esgotados em todos os fornecedores ou o preço foi rejeitado pelo comprador.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow hover:bg-amber-700 transition"
        >
          📋 Gerar Relatório / Nova Cotação para Pendentes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
        {pendingProducts.map((prod) => (
          <div key={prod.productId} className="bg-white border border-amber-200 rounded-lg p-3 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-8 w-8 min-w-[2rem] flex items-center justify-center rounded border bg-slate-50 text-xs">
                {prod.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={prod.imageUrl} alt="" className="h-full w-full object-cover rounded" />
                ) : (
                  '📦'
                )}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 truncate">{prod.description}</p>
                <p className="text-[10px] text-slate-500">
                  Qtd Solicitada: <strong>{prod.requestedQuantity}</strong>
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded font-semibold whitespace-nowrap">
              Pendente
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}