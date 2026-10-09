'use client';

import { useState } from 'react';

interface OrderItem {
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  imageUrl?: string | null;
}

export interface PortalPurchaseOrder {
  id: string;
  quotationId: string;
  quotationSupplierId?: string | null;
  supplierId: string;
  supplierName?: string | null;
  brandId?: string | null;
  brandName?: string | null;
  paymentTerms?: string | null;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

interface PurchaseOrdersPanelProps {
  isDarkMode: boolean;
  orders: PortalPurchaseOrder[];
  onOrderStatusChange: (orderId: string, quotationId: string, status: 'CLOSED') => Promise<void>;
}

const statusLabels: Record<string, string> = {
  SENT: 'Pedido enviado pelo lojista',
  DISPATCHED: 'Encaminhado pela empresa',
  RECEIVED: 'Mercadoria recebida',
  CLOSED: 'Cotação encerrada e registrada',
};

export function PurchaseOrdersPanel({ isDarkMode, orders, onOrderStatusChange }: PurchaseOrdersPanelProps) {
  const [closingOrderId, setClosingOrderId] = useState<string | null>(null);

  const closeOrder = async (order: PortalPurchaseOrder) => {
    if (closingOrderId) return;
    setClosingOrderId(order.id);
    try {
      await onOrderStatusChange(order.id, order.quotationId, 'CLOSED');
    } finally {
      setClosingOrderId(null);
    }
  };

  if (!orders.length) return null;

  return (
    <section className={`rounded-[2.5rem] border p-6 sm:p-8 shadow-2xl ${
      isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-200'
    }`}>
      <div className="flex items-center justify-between border-b border-slate-500/10 pb-4">
        <div>
          <h2 className="text-base font-black uppercase">📦 Pedidos recebidos dos lojistas</h2>
          <p className="text-[11px] opacity-60 mt-1">Pedidos gerados após a escolha das propostas.</p>
        </div>
        <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-bold text-indigo-500">
          {orders.length} pedido(s)
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <article key={order.id} className={`rounded-2xl border p-5 ${
            isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">
                  {statusLabels[order.status] || order.status}
                </span>
                <p className="mt-1 text-xs opacity-70">
                  Distribuidora: <strong>{order.brandName || order.supplierName || 'Distribuidora não identificada'}</strong>
                </p>
                <p className="mt-1 text-xs opacity-70">
                  Condição: <strong>{order.paymentTerms || 'Não informada'}</strong>
                </p>
              </div>
              <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                {order.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
            </div>
            {order.status === 'SENT' && (
              <button
                type="button"
                onClick={() => void closeOrder(order)}
                disabled={closingOrderId === order.id}
                className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {closingOrderId === order.id ? 'Registrando encerramento...' : '✓ Marcar cotação como encerrada'}
              </button>
            )}

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {order.items.map((item) => (
                <div key={`${order.id}-${item.description}`} className="flex items-center gap-3 rounded-xl border border-slate-500/10 p-2">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-500/10">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : <span className="flex h-full items-center justify-center">📦</span>}
                  </div>
                  <div className="min-w-0 text-[11px]">
                    <p className="truncate font-bold">{item.description}</p>
                    <p className="opacity-60">Qtd. {item.quantity} · {item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
