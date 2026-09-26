'use client';

import React, { use, useEffect, useState, useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';

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

  const ordersMap: Record<string, OrderItem[]> = JSON.parse(savedOrdersJson);

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
      
      {/* HEADER GLOBAL UNIFICADO */}
      <AppHeader
        title="Economia Certa"
        subtitle="Painel gerencial inteligente e controle de compras em tempo real."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 -mt-12 pb-20 relative z-25 space-y-8">
        
        {/* Cartão Principal */}
        <div className={`rounded-3xl border p-8 shadow-2xl transition-all space-y-6 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900 shadow-slate-200/50'
        }`}>
          
          {/* Cabeçalho do Cartão e Navegação */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-500/10 gap-4">
            <div>
              <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
                ✅ Pedidos de Compra Gerados
              </span>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">
                {quotation?.title ? `Pedidos para: ${quotation.title}` : 'Ordens de Compra'}
              </h1>
              <p className="text-xs opacity-60 mt-1 font-medium">
                Abaixo estão separados os pedidos oficiais de cada distribuidora com base no mix de menor preço selecionado.
              </p>
            </div>

            <Link href="/cotacoes" className="text-xs font-bold opacity-70 hover:opacity-100 transition flex items-center gap-1.5">
              &larr; Voltar para listagem de cotações
            </Link>
          </div>

          {Object.keys(ordersMap).length === 0 ? (
            <div className={`rounded-2xl border p-16 text-center text-xs opacity-50 font-medium ${
              isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              Nenhum pedido encontrado para esta cotação ou nenhum item foi selecionado.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(ordersMap).map(([supplierId, items]) => {
                const supplierInfo = suppliers.find((s) => s.supplierId === supplierId);
                const supplierName = supplierInfo?.name || 'Distribuidor';
                const totalOrder = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

                return (
                  <div key={supplierId} className={`rounded-2xl border overflow-hidden shadow-sm transition-all ${
                    isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    
                    {/* Cabeçalho do Fornecedor */}
                    <div className={`border-b px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${
                      isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50/80'
                    }`}>
                      <div>
                        <h2 className="text-xs font-black uppercase tracking-wider">📦 Pedido para: {supplierName}</h2>
                        <p className="text-[11px] opacity-60 mt-0.5">{items.length} item(ns) selecionado(s)</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider">Total do Pedido:</span>
                        <p className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(totalOrder)}</p>
                      </div>
                    </div>

                    {/* Tabela de Itens do Pedido */}
                    <div className="p-6 overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className={`border-b uppercase tracking-wider text-[11px] font-extrabold ${
                            isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-900/30' : 'border-slate-200 text-slate-500 bg-slate-50/60'
                          }`}>
                            <th className="px-4 py-3 font-extrabold">Produto</th>
                            <th className="px-4 py-3 font-extrabold text-center">Quantidade</th>
                            <th className="px-4 py-3 font-extrabold text-right">Preço Unitário</th>
                            <th className="px-4 py-3 font-extrabold text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-500/10">
                          {items.map((item, idx) => (
                            <tr key={idx} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}`}>
                              <td className="px-4 py-3 font-bold text-sm tracking-tight">{item.description}</td>
                              <td className="px-4 py-3 text-center font-mono font-black">{item.quantity}</td>
                              <td className="px-4 py-3 text-right font-mono opacity-80">{formatCurrency(item.price)}</td>
                              <td className="px-4 py-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Ações do Pedido (Copiar & WhatsApp) */}
                    <div className={`border-t px-6 py-4 flex flex-wrap justify-end gap-3 ${
                      isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50/60'
                    }`}>
                      <button
                        type="button"
                        onClick={() => {
                          const text = `*Pedido de Compra - ${quotation?.title}*\n*Fornecedor:* ${supplierName}\n\n` +
                            items.map(i => `- ${i.description} | Qtd: ${i.quantity} | Preço: ${formatCurrency(i.price)}`).join('\n') +
                            `\n\n*Total:* ${formatCurrency(totalOrder)}`;
                          navigator.clipboard.writeText(text);
                          alert(`Pedido para ${supplierName} copiado para a área de transferência!`);
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-white' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        📋 Copiar Pedido para Envio
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const text = encodeURIComponent(
                            `*Pedido de Compra - ${quotation?.title}*\n\n` +
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
          )}

        </div>

      </main>

      {/* MENU DE COMANDOS */}
      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId={quotationId} />

    </div>
  );
}