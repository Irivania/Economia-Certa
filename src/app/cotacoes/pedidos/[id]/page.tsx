'use client';

import React, { use, useEffect, useState, useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';

interface OrderItem {
  productId: string;
  description: string;
  imageUrl?: string | null;
  quantity: number;
  price: number;
}
interface StoredOrder {
  orderId?: string;
  status?: 'SENT' | 'DISPATCHED' | 'RECEIVED' | 'CLOSED';
  items: OrderItem[];
}

interface UnrequestedItem extends OrderItem {
  reason: string;
}

interface QuotationSupplier {
  quotationSupplierId?: string;
  supplierId: string;
  name?: string | null;
  observation?: string | null;
}

interface QuotationData {
  id: string;
  companyId?: string;
  title: string;
  paymentTerms?: string | null;
  suppliers?: QuotationSupplier[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function subscribe() {
  return () => {};
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const quotationId = resolvedParams?.id;

  const { isDarkMode } = useTheme();
  const [quotation, setQuotation] = useState<QuotationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const savedOrdersJson = useSyncExternalStore(
    subscribe,
    () => (typeof window !== 'undefined' ? localStorage.getItem(`quotation_orders_${quotationId}`) || '{}' : '{}'),
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
    return [supplierId, Array.isArray(record) ? record : record.items || []];
  }));
  const orderIds = Object.fromEntries(Object.entries(rawOrdersMap).map(([supplierId, value]) => [
    supplierId,
    Array.isArray(value) ? null : (value as StoredOrder).orderId || null,
  ]));
  const paymentTerms = savedOrders.paymentTerms || quotation?.paymentTerms || '';
  const [unrequestedItems, setUnrequestedItems] = useState<UnrequestedItem[]>(
    savedOrders.unrequestedItems || [],
  );
  const [orderStatuses, setOrderStatuses] = useState<Record<string, 'SENT' | 'DISPATCHED' | 'RECEIVED' | 'CLOSED'>>({});
  const [sendingOrders, setSendingOrders] = useState<Record<string, boolean>>({});
  const [sentOrderIds, setSentOrderIds] = useState<Record<string, string | null>>(orderIds);

  const sendOrderToRepresentative = async (orderKey: string) => {
    const items = ordersMap[orderKey];
    if (!items?.length || sentOrderIds[orderKey] || sendingOrders[orderKey]) return;

    setSendingOrders((current) => ({ ...current, [orderKey]: true }));
    try {
      const response = await fetch(`/api/quotations/${quotationId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orders: { [orderKey]: items },
          paymentTerms,
          unrequestedItems,
        }),
      });
      const result = await response.json() as {
        orders?: Array<{ id: string; supplierId: string; quotationSupplierId?: string | null }>;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || 'Não foi possível enviar o pedido.');
      }

      const order = result.orders?.find((item) =>
        (item.quotationSupplierId || item.supplierId) === orderKey,
      );
      if (!order) {
        throw new Error('A API não retornou o pedido enviado.');
      }

      setSentOrderIds((current) => ({ ...current, [orderKey]: order.id }));
      const updatedOrders = Object.fromEntries(Object.entries(rawOrdersMap).map(([id, value]) => [
        id,
        id === orderKey
          ? { orderId: order.id, status: 'SENT', items: ordersMap[id] }
          : value,
      ]));
      localStorage.setItem(`quotation_orders_${quotationId}`, JSON.stringify({
        paymentTerms,
        orders: updatedOrders,
        unrequestedItems,
      }));
      alert('Pedido enviado ao representante.');
    } catch (error) {
      console.error('Erro ao enviar pedido ao representante:', error);
      alert(error instanceof Error ? error.message : 'Não foi possível enviar o pedido.');
    } finally {
      setSendingOrders((current) => ({ ...current, [orderKey]: false }));
    }
  };

  const updateOrderStatus = async (orderKey: string, status: 'RECEIVED' | 'CLOSED') => {
    const orderId = sentOrderIds[orderKey];
    if (!orderId) return;
    const response = await fetch(`/api/quotations/${quotationId}/finalize`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status, actorRole: 'STORE' }),
    });
    if (!response.ok) {
      alert('Não foi possível dar baixa no recebimento.');
      return;
    }
    setOrderStatuses((current) => ({ ...current, [orderKey]: status }));
  };

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
    async function loadData() {
      try {
        const res = await fetch(`/api/quotations/${quotationId}`);
        if (res.ok) {
          const data = await res.json();
          setQuotation(data);
          if (data.companyId) {
            const ordersResponse = await fetch(`/api/portal/orders?companyId=${data.companyId}`);
            if (ordersResponse.ok) {
              const persistedOrders = await ordersResponse.json() as Array<{
                supplierId: string;
                quotationSupplierId?: string | null;
                status: 'SENT' | 'DISPATCHED' | 'RECEIVED' | 'CLOSED';
              }>;
              setOrderStatuses(Object.fromEntries(
                persistedOrders.map((order) => [
                  order.quotationSupplierId || order.supplierId,
                  order.status,
                ]),
              ));
            }
            const unrequestedResponse = await fetch(`/api/quotations/${quotationId}/finalize`);
            if (unrequestedResponse.ok) {
              const persisted = await unrequestedResponse.json() as { unrequestedItems?: UnrequestedItem[] };
              if (persisted.unrequestedItems) {
                setUnrequestedItems(persisted.unrequestedItems);
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (quotationId) loadData();
  }, [quotationId]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center text-xs font-medium ${isDarkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
        A carregar pedidos gerados...
      </div>
    );
  }

  const suppliers = quotation?.suppliers || [];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Cabeçalho isolado para evitar sobreposição */}
      <div className="pb-8">
        <AppHeader
          title="Economia Certa"
          subtitle="Painel gerencial inteligente e controle de compras em tempo real."
          onOpenCmd={() => setIsCmdOpen(true)}
        />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10" role="main">
        
        <div className={`rounded-xl border p-6 sm:p-7 shadow-xs transition-all space-y-5 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900'
        }`}>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
            <div>
              <span className="inline-flex rounded-md bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
                ✅ Pedidos de Compra Gerados
              </span>
              <h1 className="text-base md:text-lg font-bold tracking-tight">
                {quotation?.title ? `Pedidos para: ${quotation.title}` : 'Ordens de Compra'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Abaixo estão separados os pedidos oficiais de cada distribuidora com base no mix de menor preço selecionado.
              </p>
            </div>

            <Link href="/cotacoes" className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-lg shadow-xs border border-slate-200 dark:border-slate-800 transition hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1.5">
              &larr; Voltar para listagem
            </Link>
          </div>

          {Object.keys(ordersMap).length === 0 && unrequestedItems.length === 0 ? (
            <div className={`rounded-lg border p-12 text-center text-xs text-slate-500 font-medium ${
              isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              Nenhum pedido encontrado para esta cotação ou nenhum item foi selecionado.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(ordersMap).map(([orderKey, items]) => {
                const supplierInfo = suppliers.find((s) =>
                  (s.quotationSupplierId || s.supplierId) === orderKey,
                );
                const supplierName = supplierInfo?.name || 'Distribuidor';
                const totalOrder = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

                return (
                  <div key={orderKey} className={`rounded-xl border overflow-hidden shadow-xs transition-all ${
                    isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}>
                    
                    <div className={`border-b px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                      isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/70'
                    }`}>
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">📦 Pedido para: {supplierName}</h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">{items.length} item(ns) selecionado(s)</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total do Pedido:</span>
                        <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(totalOrder)}</p>
                        {sentOrderIds[orderKey] && (
                          <div className="mt-2 flex flex-wrap justify-end gap-2">
                            <button type="button" onClick={() => void updateOrderStatus(orderKey, 'RECEIVED')} disabled={orderStatuses[orderKey] === 'RECEIVED' || orderStatuses[orderKey] === 'CLOSED'} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-xs disabled:opacity-50 cursor-pointer">
                              {orderStatuses[orderKey] === 'RECEIVED' || orderStatuses[orderKey] === 'CLOSED' ? '✓ Recebido' : 'Confirmar recebimento'}
                            </button>
                            <button type="button" onClick={() => void updateOrderStatus(orderKey, 'CLOSED')} disabled={orderStatuses[orderKey] !== 'RECEIVED'} className="rounded-lg bg-slate-700 px-3 py-1.5 text-[10px] font-bold text-white shadow-xs disabled:opacity-50 cursor-pointer">
                              {orderStatuses[orderKey] === 'CLOSED' ? '✓ Cotação baixada' : 'Dar baixa na cotação'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className={`border-b uppercase tracking-wider text-[11px] font-bold ${
                            isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-900/30' : 'border-slate-100 text-slate-500 bg-slate-50/60'
                          }`}>
                            <th className="px-3.5 py-2.5">Imagem</th>
                            <th className="px-3.5 py-2.5">Produto</th>
                            <th className="px-3.5 py-2.5 text-center">Quantidade</th>
                            <th className="px-3.5 py-2.5 text-right">Preço Unitário</th>
                            <th className="px-3.5 py-2.5 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {items.map((item, idx) => (
                            <tr key={idx} className={`transition-colors align-middle ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}`}>
                              <td className="px-3.5 py-2.5">
                                <div className="h-10 w-10 overflow-hidden rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                  {item.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={item.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                                  ) : (
                                    <span className="flex h-full items-center justify-center text-xs">📦</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3.5 py-2.5 font-semibold text-xs tracking-tight text-slate-900 dark:text-white">{item.description}</td>
                              <td className="px-3.5 py-2.5 text-center font-mono font-bold text-slate-700 dark:text-slate-300">{item.quantity}</td>
                              <td className="px-3.5 py-2.5 text-right font-mono text-slate-600 dark:text-slate-400">{formatCurrency(item.price)}</td>
                              <td className="px-3.5 py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-2.5 text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">Condição de pagamento:</span>{' '}
                      {paymentTerms || 'Não informada'}
                    </div>

                    <div className={`border-t px-5 py-3.5 flex flex-wrap justify-end gap-2.5 ${
                      isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/60'
                    }`}>
                      <button
                        type="button"
                        onClick={() => void sendOrderToRepresentative(orderKey)}
                        disabled={Boolean(sentOrderIds[orderKey]) || sendingOrders[orderKey]}
                        className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                      >
                        {sentOrderIds[orderKey]
                          ? '✓ Enviado ao representante'
                          : sendingOrders[orderKey]
                            ? 'Enviando...'
                            : '📤 Enviar ao representante'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const text = `*Pedido de Compra - ${quotation?.title}*\n*Fornecedor:* ${supplierName}\n\n` +
                            `*Condição de pagamento:* ${paymentTerms || 'Não informada'}\n\n` +
                            items.map(i => `- ${i.description} | Qtd: ${i.quantity} | Preço: ${formatCurrency(i.price)}`).join('\n') +
                            `\n\n*Total:* ${formatCurrency(totalOrder)}`;
                          navigator.clipboard.writeText(text);
                          alert(`Pedido para ${supplierName} copiado para a área de transferência!`);
                        }}
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-white' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        📋 Copiar Pedido para Envio
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const text = encodeURIComponent(
                            `*Pedido de Compra - ${quotation?.title}*\n\n` +
                            `*Condição de pagamento:* ${paymentTerms || 'Não informada'}\n\n` +
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
                <div className={`rounded-xl border p-5 shadow-xs ${
                  isDarkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200/90 bg-white'
                }`}>
                  <div className="flex items-center justify-between gap-3 mb-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Itens não incluídos nos pedidos</h2>
                      <p className="text-[11px] text-slate-400">Produtos sem fornecedor selecionado ou sem ofertas disponíveis.</p>
                    </div>
                    <strong className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md">{unrequestedItems.length} item(ns)</strong>
                  </div>
                  <div className="space-y-2">
                    {unrequestedItems.map((item) => {
                      const isUnavailable = item.reason.includes('nenhuma distribuidora') || item.reason.includes('disponível');
                      const badgeText = isUnavailable ? 'Indisponível' : 'Não selecionado';
                      const badgeColor = isUnavailable 
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                        : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';

                      return (
                        <div key={item.productId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-2 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {item.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.imageUrl}
                                alt=""
                                className="w-8 h-8 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0 opacity-80"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                                📦
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="font-semibold truncate block text-slate-700 dark:text-slate-300">{item.description}</span>
                              <span className="text-[11px] text-slate-400 font-mono">Qtd.: {item.quantity}</span>
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
            </div>
          )}

        </div>

      </main>

      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId={quotationId} />

    </div>
  );
}