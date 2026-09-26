'use client';

import { useSyncExternalStore } from 'react';

interface OrderItem {
  productId: string;
  description: string;
  quantity: number;
  price: number;
}

interface QuotationSupplier {
  supplierId: string;
  name?: string | null;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function subscribe() {
  return () => {};
}

export function OrdersClientView({ quotationId, suppliers, quotationTitle }: { quotationId: string; suppliers: QuotationSupplier[]; quotationTitle: string }) {
  const savedOrdersJson = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(`quotation_orders_${quotationId}`) || '{}',
    () => '{}'
  );

  const ordersMap: Record<string, OrderItem[]> = JSON.parse(savedOrdersJson);

  if (Object.keys(ordersMap).length === 0) {
    return (
      <div className="rounded-2xl border border-slate-500/10 p-16 text-center text-xs opacity-50 font-medium bg-slate-50 dark:bg-slate-950/50 dark:border-slate-800">
        Nenhum pedido encontrado para esta cotação ou nenhum item foi selecionado.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(ordersMap).map(([supplierId, items]) => {
        const supplierInfo = suppliers.find((s) => s.supplierId === supplierId);
        const supplierName = supplierInfo?.name || 'Distribuidor';
        const totalOrder = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

        return (
          <div key={supplierId} className="rounded-2xl border border-slate-500/10 overflow-hidden shadow-sm transition-all bg-white dark:bg-slate-950/60 dark:border-slate-800">
            
            <div className="border-b border-slate-500/10 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/50">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider">📦 Pedido para: {supplierName}</h2>
                <p className="text-[11px] opacity-60 mt-0.5">{items.length} item(ns) selecionado(s)</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider">Total do Pedido:</span>
                <p className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(totalOrder)}</p>
              </div>
            </div>

            <div className="p-6 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-500/10 uppercase tracking-wider text-[11px] font-extrabold text-slate-500 bg-slate-50/60 dark:border-slate-800 dark:text-slate-400 dark:bg-slate-900/30">
                    <th className="px-4 py-3 font-extrabold">Produto</th>
                    <th className="px-4 py-3 font-extrabold text-center">Quantidade</th>
                    <th className="px-4 py-3 font-extrabold text-right">Preço Unitário</th>
                    <th className="px-4 py-3 font-extrabold text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-500/10">
                  {items.map((item, idx) => (
                    <tr key={idx} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-sm tracking-tight">{item.description}</td>
                      <td className="px-4 py-3 text-center font-mono font-black">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-mono opacity-80">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-500/10 px-6 py-4 flex flex-wrap justify-end gap-3 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40">
              <button
                type="button"
                onClick={() => {
                  const text = `*Pedido de Compra - ${quotationTitle}*\n*Fornecedor:* ${supplierName}\n\n` +
                    items.map(i => `- ${i.description} | Qtd: ${i.quantity} | Preço: ${formatCurrency(i.price)}`).join('\n') +
                    `\n\n*Total:* ${formatCurrency(totalOrder)}`;
                  navigator.clipboard.writeText(text);
                  alert(`Pedido para ${supplierName} copiado para a área de transferência!`);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm bg-white border-slate-300 hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-white"
              >
                📋 Copiar Pedido para Envio
              </button>
              
              <button
                type="button"
                onClick={() => {
                  const text = encodeURIComponent(
                    `*Pedido de Compra - ${quotationTitle}*\n\n` +
                    items.map(i => `- ${i.description} (Qtd: ${i.quantity})`).join('\n') +
                    `\n*Total:* ${formatCurrency(totalOrder)}`
                  );
                  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-emerald-600/25 flex items-center gap-1.5 cursor-pointer"
              >
                💬 Enviar via WhatsApp
              </button>
            </div>

          </div>
        );
      })}
    </div>
  );
}