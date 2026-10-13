'use client';

import React from 'react';

interface ProductSummaryItem {
  productId: string;
  description: string;
  imageUrl?: string | null;
  requestedQuantity: number;
  responses: Record<string, { price: number; outOfStock: boolean }>;
}

interface SupplierGroup {
  supplier: { id: string; name?: string | null };
  items: ProductSummaryItem[];
}

interface UnrequestedItemSummary {
  product: { productId: string; description: string; imageUrl?: string | null; requestedQuantity: number };
  reason: string;
}

interface QuotationOrdersSummaryProps {
  isDarkMode: boolean;
  totalItemsCount: number;
  unrequestedCount: number;
  summaryTotal: number;
  selectedBySupplier: SupplierGroup[];
  unrequestedSummary: UnrequestedItemSummary[];
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  paymentTerms?: string | null;
  formatCurrency: (val: number) => string;
  formatDate: (val?: string | Date | null) => string;
}

export function QuotationOrdersSummary({
  isDarkMode,
  totalItemsCount,
  unrequestedCount,
  summaryTotal,
  selectedBySupplier,
  unrequestedSummary,
  startDate,
  endDate,
  paymentTerms,
  formatCurrency,
  formatDate,
}: QuotationOrdersSummaryProps) {
  return (
    <section className={`rounded-xl border p-6 sm:p-7 shadow-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'}`}>
      <div className="flex flex-col lg:flex-row justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Resumo da Decisão
          </span>
          <h2 className="text-sm font-bold tracking-tight mt-0.5">Pedidos separados por distribuidora</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Esta é a lista que será preparada para envio após a confirmação.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-right text-xs">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400">Itens escolhidos</span>
            <strong className="text-sm font-bold">{totalItemsCount - unrequestedCount}</strong>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400">Total estimado</span>
            <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(summaryTotal)}</strong>
          </div>
        </div>
      </div>

      <div className="grid gap-4 mt-4 lg:grid-cols-2">
        {selectedBySupplier.map(({ supplier, items }) => {
          const supplierTotal = items.reduce(
            (total, product) => total + (product.responses[supplier.id]?.price || 0) * product.requestedQuantity,
            0,
          );
          return (
            <div key={supplier.id} className={`rounded-lg border p-4 ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/70'}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase">{supplier.name || 'Distribuidora não identificada'}</h3>
                  <p className="text-[11px] text-slate-500">{items.length} produto(s) selecionado(s)</p>
                </div>
                <strong className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(supplierTotal)}</strong>
              </div>
              <div className="space-y-2">
                {items.map((product) => {
                  const price = product.responses[supplier.id]?.price || 0;
                  return (
                    <div key={product.productId} className="flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-2 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="w-8 h-8 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                            📦
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{product.description}</p>
                          <p className="text-[11px] text-slate-400">Qtd.: {product.requestedQuantity}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono font-semibold">{formatCurrency(price)}</p>
                        <p className="text-[11px] text-slate-400">{formatCurrency(price * product.requestedQuantity)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {unrequestedSummary.length > 0 && (
        <div className={`mt-4 rounded-lg border p-4 ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50/80'}`}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Itens não incluídos nos pedidos</h3>
              <p className="text-[11px] text-slate-400">Produtos sem fornecedor selecionado ou sem ofertas disponíveis.</p>
            </div>
            <strong className="text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">{unrequestedSummary.length} item(ns)</strong>
          </div>
          <div className="space-y-2">
            {unrequestedSummary.map(({ product, reason }) => {
              const isUnavailable = reason.includes('nenhuma distribuidora');
              const badgeText = isUnavailable ? 'Indisponível' : 'Não selecionado';
              const badgeColor = isUnavailable 
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';

              return (
                <div key={product.productId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800/80 pt-2 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="w-8 h-8 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0 opacity-80"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                        📦
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="font-semibold truncate block text-slate-700 dark:text-slate-300">{product.description}</span>
                      <span className="text-[11px] text-slate-400 font-mono">Qtd.: {product.requestedQuantity}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shrink-0 ${badgeColor}`}>
                    {badgeText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs sm:grid-cols-3">
        <span><strong>Período:</strong> {formatDate(startDate)} até {formatDate(endDate)}</span>
        <span><strong>Pagamento:</strong> {paymentTerms || 'Não informado'}</span>
        <span><strong>Quantidade:</strong> conforme solicitado na cotação</span>
      </div>
    </section>
  );
}