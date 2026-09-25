'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';

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

interface QuotationData {
  id: string;
  title: string;
  suppliers?: QuotationSupplier[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function QuotationOrdersPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const quotationId = resolvedParams?.id;

  const [quotation, setQuotation] = useState<QuotationData | null>(null);
  const [ordersMap, setOrdersMap] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Carrega dados da cotação
        const res = await fetch(`/api/quotations/${quotationId}`);
        if (res.ok) {
          const data = await res.json();
          setQuotation(data);
        }

        // Recupera os pedidos salvos no localStorage gerados na tela anterior
        const savedOrders = localStorage.getItem(`quotation_orders_${quotationId}`);
        if (savedOrders) {
          setOrdersMap(JSON.parse(savedOrders));
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
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">A carregar pedidos gerados...</div>;
  }

  const suppliers = quotation?.suppliers || [];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        
        <div className="flex items-center justify-between text-sm text-slate-500">
          <Link href="/cotacoes" className="font-medium hover:text-indigo-600 transition flex items-center gap-1">
            ← Voltar para listagem de cotações
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            ✅ Pedidos de Compra Gerados
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            {quotation?.title ? `Pedidos para: ${quotation.title}` : 'Ordens de Compra'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Abaixo estão separados os pedidos oficiais de cada distribuidora com base no mix de menor preço selecionado.
          </p>
        </div>

        {Object.keys(ordersMap).length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
            Nenhum pedido encontrado para esta cotação ou nenhum item foi selecionado.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(ordersMap).map(([supplierId, items]) => {
              const supplierInfo = suppliers.find((s) => s.supplierId === supplierId);
              const supplierName = supplierInfo?.name || 'Distribuidor';
              const totalOrder = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

              return (
                <div key={supplierId} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">📦 Pedido para: {supplierName}</h2>
                      <p className="text-[11px] text-slate-500">{items.length} item(ns) selecionado(s)</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Total do Pedido:</span>
                      <p className="text-base font-bold text-emerald-700">{formatCurrency(totalOrder)}</p>
                    </div>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2 font-semibold">Produto</th>
                          <th className="px-4 py-2 font-semibold text-center">Quantidade</th>
                          <th className="px-4 py-2 font-semibold text-right">Preço Unitário</th>
                          <th className="px-4 py-2 font-semibold text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-medium text-slate-800">{item.description}</td>
                            <td className="px-4 py-3 text-center font-bold text-slate-700">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.price)}</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrency(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-50/60 border-t border-slate-200 px-6 py-3 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        const text = `*Pedido de Compra - ${quotation?.title}*\n*Fornecedor:* ${supplierName}\n\n` +
                          items.map(i => `- ${i.description} | Qtd: ${i.quantity} | Preço: ${formatCurrency(i.price)}`).join('\n') +
                          `\n\n*Total:* ${formatCurrency(totalOrder)}`;
                        navigator.clipboard.writeText(text);
                        alert(`Pedido para ${supplierName} copiado para a área de transferência!`);
                      }}
                      className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-lg text-xs font-semibold transition shadow-xs"
                    >
                      📋 Copiar Pedido para Envio
                    </button>
                    
                    <button
                      onClick={() => {
                        const text = encodeURIComponent(
                          `*Pedido de Compra - ${quotation?.title}*\n\n` +
                          items.map(i => `- ${i.description} (Qtd: ${i.quantity})`).join('\n') +
                          `\n*Total:* ${formatCurrency(totalOrder)}`
                        );
                        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-xs flex items-center gap-1.5"
                    >
                      💬 Enviar via WhatsApp
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}