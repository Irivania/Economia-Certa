'use client';

import { useSyncExternalStore } from 'react';

interface OrderItem {
  productId: string;
  description: string;
  imageUrl?: string | null;
  quantity: number;
  price: number;
}
interface StoredOrder {
  orderId?: string;
  items: OrderItem[];
}

interface UnrequestedItem extends OrderItem {
  reason: string;
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

  const savedOrders = JSON.parse(savedOrdersJson) as {
    paymentTerms?: string | null;
    orders?: Record<string, OrderItem[] | StoredOrder>;
    unrequestedItems?: UnrequestedItem[];
  };
  const rawOrdersMap = savedOrders.orders || {};
  const ordersMap = Object.fromEntries(Object.entries(rawOrdersMap).map(([supplierId, value]) => {
    const record = value as OrderItem[] | StoredOrder;
    return [supplierId, Array.isArray(record) ? record : record.items];
  }));
  const paymentTerms = savedOrders.paymentTerms || '';
  const unrequestedItems = savedOrders.unrequestedItems || [];

  if (Object.keys(ordersMap).length === 0 && unrequestedItems.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-xs text-slate-500 font-medium bg-white dark:bg-slate-900/50 shadow-xs">
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
          <div key={supplierId} className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-all bg-white dark:bg-slate-900">
            
            <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50/80 dark:bg-slate-950/40">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">📦 Pedido para: {supplierName}</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">{items.length} item(ns) selecionado(s)</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total do Pedido:</span>
                <p className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(totalOrder)}</p>
              </div>
            </div>

            <div className="p-6 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider text-[11px] font-bold text-slate-500 bg-slate-50/60 dark:text-slate-400 dark:bg-slate-950/30">
                    <th className="px-4 py-3">Imagem</th>
                    <th className="px-4 py-3">Produto</th>
                    <th className="px-4 py-3 text-center">Quantidade</th>
                    <th className="px-4 py-3 text-right">Preço Unitário</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item, idx) => (
                    <tr key={idx} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 align-middle">
                      <td className="px-4 py-3">
                        <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                          ) : (
                            <span className="flex h-full items-center justify-center text-xs">📦</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white">{item.description}</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-3 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Condição de pagamento:</span>{' '}
              {paymentTerms || 'Não informada'}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex flex-wrap justify-end gap-2.5 bg-slate-50/60 dark:bg-slate-950/40">
              <button
                type="button"
                onClick={() => {
                  const text = `*Pedido de Compra - ${quotationTitle}*\n*Fornecedor:* ${supplierName}\n\n` +
                    items.map(i => `- ${i.description} | Qtd: ${i.quantity} | Preço: ${formatCurrency(i.price)}`).join('\n') +
                    `\n\n*Total:* ${formatCurrency(totalOrder)}`;
                  navigator.clipboard.writeText(text);
                  alert(`Pedido para ${supplierName} copiado para a área de transferência!`);
                }}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-xs bg-white border-slate-200 hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-200"
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
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                💬 Enviar via WhatsApp
              </button>
            </div>

          </div>
        );
      })}

      {unrequestedItems.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 overflow-hidden bg-amber-50/50 dark:bg-amber-950/10 shadow-xs">
          <div className="border-b border-amber-200 dark:border-amber-500/20 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">🚫 Itens não pedidos</h2>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-amber-200 dark:border-amber-500/20 text-[11px] uppercase text-amber-700 dark:text-amber-400 font-bold">
                  <th className="px-4 py-3">Imagem</th>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Quantidade</th>
                  <th className="px-4 py-3">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200/50 dark:divide-amber-500/10">
                {unrequestedItems.map((item) => (
                  <tr key={item.productId} className="align-middle">
                    <td className="px-4 py-3">
                      <div className="h-9 w-9 overflow-hidden rounded-md border border-amber-200 dark:border-amber-800 bg-white">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                        ) : <span className="flex h-full items-center justify-center text-xs">📦</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{item.description}</td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">{item.quantity}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}