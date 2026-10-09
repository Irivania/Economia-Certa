'use client';

import React, { use, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QuotationTable from '@/components/QuotationTable';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';

interface QuotationItem {
  id: string;
  productId: string;
  supplierId?: string | null;
  requestedQuantity?: number | string | null;
  price?: number | string | null;
  outOfStock?: boolean | null;
  description?: string;
  brand?: string | null;
  ean?: string | null;
  imageUrl?: string | null;
  sellingPrice?: number | string | null;
}

interface QuotationSupplier {
  id: string;
  supplierId: string;
  brandId?: string | null;
  brandName?: string | null;
  name?: string | null;
  status?: string | null;
  observation?: string | null;
}

interface QuotationSupplierItem {
  id: string;
  quotationSupplierId: string;
  productId: string;
  price: string | number;
  outOfStock: boolean | null;
}

interface Quotation {
  id: string;
  title: string;
  paymentTerms?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  suppliers?: QuotationSupplier[];
  items?: QuotationItem[];
  supplierItems?: QuotationSupplierItem[];
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(value?: string | Date | null) {
  if (!value) return 'Não definido';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Não definido';
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

export default function QuotationResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const quotationId = resolvedParams?.id;
  const { isDarkMode } = useTheme();

  const router = useRouter();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
  const [ignoredProducts, setIgnoredProducts] = useState<Set<string>>(new Set());
  const [isCmdOpen, setIsCmdOpen] = useState(false);

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
      if (!quotationId) {
        setError('Identificador de cotação inválido.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/quotations/${quotationId}`);
        if (!res.ok) throw new Error('Não foi possível carregar os dados.');
        const data = await res.json();
        setQuotation({
          ...data,
          suppliers: (data.suppliers || []).map((supplier: QuotationSupplier & { quotationSupplierId?: string }) => ({
            ...supplier,
            id: supplier.quotationSupplierId || supplier.id,
            name: supplier.brandName || supplier.name,
          })),
        });

        const initialChoices: Record<string, string> = {};
        const rawItems = data.items || [];
        const suppliers = data.suppliers || [];
        const supplierItems = data.supplierItems || [];

        // Mapeia os preços respondidos por cada quotationSupplierId para o supplierId correspondente
        const supplierMapping: Record<string, string> = {};
        suppliers.forEach((sup: QuotationSupplier) => {
          supplierMapping[sup.id] = sup.id;
        });

        const tempMap: Record<string, { responses: Record<string, { price: number; outOfStock: boolean }> }> = {};
        
        rawItems.forEach((item: QuotationItem) => {
          const prodKey = item.productId;
          if (!tempMap[prodKey]) {
            tempMap[prodKey] = { responses: {} };
          }
        });

        supplierItems.forEach((si: QuotationSupplierItem) => {
          const supId = supplierMapping[si.quotationSupplierId];
          const prodKey = si.productId;
          if (supId && tempMap[prodKey]) {
            tempMap[prodKey].responses[supId] = {
              price: Number(si.price || 0),
              outOfStock: Boolean(si.outOfStock),
            };
          }
        });

        Object.entries(tempMap).forEach(([prodKey, prodData]) => {
          let bestSup = '';
          let lowest = Infinity;
          suppliers.forEach((sup: QuotationSupplier) => {
            const resp = prodData.responses[sup.id];
            if (resp && !resp.outOfStock && resp.price > 0 && resp.price < lowest) {
              lowest = resp.price;
              bestSup = sup.id;
            }
          });
          if (bestSup) {
            initialChoices[prodKey] = bestSup;
          }
        });

        setSelectedChoices(initialChoices);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar o mapa comparativo.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [quotationId]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center text-xs font-medium ${isDarkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
        Carregando mapa comparativo...
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className={`border rounded-3xl p-8 text-center max-w-md shadow-2xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <p className="text-xs font-semibold text-rose-500">{error || 'Cotação não encontrada.'}</p>
          <Link href="/cotacoes" className="inline-block rounded-2xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/25">
            Voltar para listagem
          </Link>
        </div>
      </div>
    );
  }

  const suppliers = quotation.suppliers || [];
  const rawItems = quotation.items || [];
  const supplierItems = quotation.supplierItems || [];

  const supplierMapping: Record<string, string> = {};
  suppliers.forEach((sup) => {
    supplierMapping[sup.id] = sup.id;
  });

  const productsMap: Record<string, { 
    productId: string; 
    description: string; 
    ean?: string | null; 
    brand?: string | null; 
    imageUrl?: string | null; 
    requestedQuantity: number; 
    sellingPrice: number;
    responses: Record<string, { price: number; outOfStock: boolean }> 
  }> = {};

  rawItems.forEach((item) => {
    const prodKey = item.productId;
    if (!productsMap[prodKey]) {
      productsMap[prodKey] = {
        productId: item.productId,
        description: item.description || 'Produto sem descrição',
        ean: item.ean,
        brand: item.brand,
        imageUrl: item.imageUrl,
        requestedQuantity: Number(item.requestedQuantity || 1),
        sellingPrice: Number(item.sellingPrice || 34.99),
        responses: {},
      };
    }
  });

  supplierItems.forEach((si) => {
    const supId = supplierMapping[si.quotationSupplierId];
    const prodKey = si.productId;
    if (supId && productsMap[prodKey]) {
      productsMap[prodKey].responses[supId] = {
        price: Number(si.price || 0),
        outOfStock: Boolean(si.outOfStock),
      };
    }
  });

  const productsList = Object.values(productsMap);

  const handleSmartQuote = () => {
    const newChoices: Record<string, string> = {};
    productsList.forEach((prod) => {
      if (ignoredProducts.has(prod.productId)) return;
      let bestSup = '';
      let lowest = Infinity;
      suppliers.forEach((sup) => {
        const resp = prod.responses[sup.id];
        if (resp && !resp.outOfStock && resp.price > 0 && resp.price < lowest) {
          lowest = resp.price;
          bestSup = sup.id;
        }
      });
      if (bestSup) {
        newChoices[prod.productId] = bestSup;
      }
    });
    setSelectedChoices(newChoices);
  };

  const handleSelectChoice = (productId: string, supplierId: string) => {
    if (ignoredProducts.has(productId)) return;
    const updated = { ...selectedChoices };
    if (!supplierId || updated[productId] === supplierId) {
      delete updated[productId];
    } else {
      updated[productId] = supplierId;
    }
    setSelectedChoices(updated);
  };

  const handleToggleIgnoredProduct = (productId: string) => {
    setIgnoredProducts((current) => {
      const next = new Set(current);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
        setSelectedChoices((choices) => {
          const updated = { ...choices };
          delete updated[productId];
          return updated;
        });
      }
      return next;
    });
  };

  const handleSelectAllForSupplier = (supplierId: string) => {
    const newChoices = { ...selectedChoices };
    productsList.forEach((prod) => {
      if (ignoredProducts.has(prod.productId)) return;
      const resp = prod.responses[supplierId];
      if (resp && !resp.outOfStock && resp.price > 0) {
        newChoices[prod.productId] = supplierId;
      }
    });
    setSelectedChoices(newChoices);
  };

  const handleFinalizeQuotation = async () => {
    try {
      setSaving(true);
      const ordersMap: Record<string, Array<{
        productId: string;
        description: string;
        imageUrl?: string | null;
        quantity: number;
        price: number;
      }>> = {};

      Object.entries(selectedChoices).forEach(([productId, supplierId]) => {
        if (ignoredProducts.has(productId)) return;
        const product = productsList.find(p => p.productId === productId);
        if (product && product.responses[supplierId]) {
          if (!ordersMap[supplierId]) {
            ordersMap[supplierId] = [];
          }
          ordersMap[supplierId].push({
            productId,
            description: product.description,
            imageUrl: product.imageUrl,
            quantity: product.requestedQuantity,
            price: product.responses[supplierId].price,
          });
        }
      });

      const unrequestedItems = productsList
        .filter((product) => ignoredProducts.has(product.productId) || !selectedChoices[product.productId])
        .map((product) => ({
          productId: product.productId,
          description: product.description,
          imageUrl: product.imageUrl,
          quantity: product.requestedQuantity,
          reason: ignoredProducts.has(product.productId)
            ? 'Não desejado pelo lojista'
            : 'Sem fornecedor disponível ou não selecionado',
        }));

      if (Object.keys(ordersMap).length === 0 && unrequestedItems.length === 0) {
        alert('Selecione um fornecedor ou marque os produtos que não serão comprados.');
        setSaving(false);
        return;
      }

      const orderSnapshot = {
        paymentTerms: quotation.paymentTerms || '',
        orders: ordersMap,
        unrequestedItems,
      };
      localStorage.setItem(`quotation_orders_${quotationId}`, JSON.stringify(orderSnapshot));

      const finalizeResponse = await fetch(`/api/quotations/${quotationId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          choices: selectedChoices,
          orders: ordersMap,
          unrequestedItems,
          paymentTerms: quotation.paymentTerms || '',
        }),
      });

      if (!finalizeResponse.ok) {
        const failure = await finalizeResponse.json().catch(() => ({}));
        throw new Error(failure.error || 'Não foi possível registrar os pedidos.');
      }

      const finalized = await finalizeResponse.json() as {
        orders: Array<{ id: string; supplierId: string; quotationSupplierId?: string | null }>;
      };
      const ordersWithIds = finalized.orders.reduce<Record<string, unknown>>((result, order) => {
        const orderKey = order.quotationSupplierId || order.supplierId;
        result[orderKey] = {
          orderId: order.id,
          status: 'SENT',
          items: ordersMap[orderKey] || ordersMap[order.supplierId],
        };
        return result;
      }, {});
      localStorage.setItem(`quotation_orders_${quotationId}`, JSON.stringify({
        paymentTerms: quotation.paymentTerms || '',
        orders: ordersWithIds,
        unrequestedItems,
      }));

      alert('Cotação finalizada com sucesso! Os pedidos de compra foram gerados.');
      router.push(`/cotacoes/pedidos/${quotationId}`);
    } catch (err) {
      console.error(err);
      alert('Erro ao finalizar a cotação.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportSelection = () => {
    const headers = ['Produto', 'EAN', 'Quantidade', 'Distribuidora escolhida', 'Preço unitário', 'Total', 'Decisão'];
    const rows = productsList.map((product) => {
      const supplierId = selectedChoices[product.productId];
      const supplier = suppliers.find((item) => item.id === supplierId);
      const response = supplierId ? product.responses[supplierId] : undefined;
      const ignored = ignoredProducts.has(product.productId);
      const quantity = product.requestedQuantity;
      const price = response?.price || 0;
      return [
        product.description,
        product.ean || '',
        quantity,
        supplier?.name || '',
        price.toFixed(2),
        (price * quantity).toFixed(2),
        ignored ? 'Não comprar' : supplier ? 'Comprar' : 'Sem seleção',
      ];
    });
    const escapeCsv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(';')).join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `decisao-${quotation.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const pendingProducts = productsList.filter((prod) => {
    const hasChoice = selectedChoices[prod.productId];
    const allOutOfStock = suppliers.every((sup) => {
      const resp = prod.responses[sup.id];
      return !resp || resp.outOfStock || resp.price === 0;
    });
    return !ignoredProducts.has(prod.productId) && (!hasChoice || allOutOfStock);
  });

  const selectedBySupplier = suppliers.map((supplier) => ({
    supplier,
    items: productsList.filter((product) => selectedChoices[product.productId] === supplier.id),
  })).filter((group) => group.items.length > 0);

  const unrequestedSummary = productsList
    .filter((product) => ignoredProducts.has(product.productId) || !selectedChoices[product.productId])
    .map((product) => {
      const hasResponse = suppliers.some((supplier) => {
        const response = product.responses[supplier.id];
        return response && !response.outOfStock && response.price > 0;
      });
      return {
        product,
        reason: ignoredProducts.has(product.productId)
          ? 'Não comprar: escolha do lojista'
          : hasResponse
            ? 'Não comprado: fornecedor não selecionado'
            : 'Não atendido: nenhuma distribuidora informou disponibilidade',
      };
    });

  const summaryTotal = selectedBySupplier.reduce(
    (total, group) => total + group.items.reduce(
      (groupTotal, product) => groupTotal + (product.responses[group.supplier.id]?.price || 0) * product.requestedQuantity,
      0,
    ),
    0,
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* HEADER GLOBAL UNIFICADO */}
      <AppHeader
        title="Economia Certa"
        subtitle="Painel gerencial inteligente e controle de compras em tempo real."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 -mt-12 pb-20 relative z-20 space-y-8">
        
        <div>
          <Link href="/cotacoes" className="font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 transition hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-2 text-xs">
            ← Voltar para listagem de cotações
          </Link>
        </div>

        {/* Cabeçalho de Cotação */}
        <div className={`rounded-3xl border p-8 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'
        }`}>
          <div>
            <span className="inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-500 border border-indigo-500/20">
              Mapa Comparativo de Preços & Rentabilidade
            </span>
            <h1 className="text-xl md:text-2xl font-black tracking-tight mt-2">{quotation.title}</h1>
            <p className="text-xs opacity-60 mt-1 font-medium">
              Início: <strong>{formatDate(quotation.startDate)}</strong> • Término: <strong>{formatDate(quotation.endDate)}</strong>
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSmartQuote}
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold shadow-xl transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              ⚡ Cotação Automática (Mix Mais Barato)
            </button>

            <button
              type="button"
              onClick={handleExportSelection}
              className="px-5 py-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              📥 Baixar decisão
            </button>

            <button
              type="button"
              onClick={handleFinalizeQuotation}
              disabled={saving}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-xl shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? 'A processar...' : '✅ Finalizar Escolha e Gerar Pedidos'}
            </button>
          </div>
        </div>

        {/* Tabela de Comparação */}
        <QuotationTable
          productsList={productsList}
          suppliers={suppliers}
          paymentTerms={quotation.paymentTerms}
          selectedChoices={selectedChoices}
          ignoredProducts={ignoredProducts}
          onToggleIgnoredProduct={handleToggleIgnoredProduct}
          onSelectChoice={handleSelectChoice}
          onSelectAllForSupplier={handleSelectAllForSupplier}
          formatCurrency={formatCurrency}
        />

        {/* Resumo pronto para confirmação e envio */}
        <section className={`rounded-3xl border p-6 md:p-8 shadow-xl ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col lg:flex-row justify-between gap-4 border-b border-slate-500/10 pb-5">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Resumo da decisão
              </span>
              <h2 className="text-lg font-black tracking-tight mt-1">Pedidos separados por distribuidora</h2>
              <p className="text-xs opacity-60 mt-1">
                Esta é a lista que será preparada para envio após a confirmação.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-right text-xs">
              <div>
                <span className="block text-[10px] uppercase tracking-wider opacity-50">Itens escolhidos</span>
                <strong className="text-base">{productsList.length - unrequestedSummary.length}</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-wider opacity-50">Total estimado</span>
                <strong className="text-base text-emerald-600 dark:text-emerald-400">{formatCurrency(summaryTotal)}</strong>
              </div>
            </div>
          </div>

          <div className="grid gap-4 mt-5 lg:grid-cols-2">
            {selectedBySupplier.map(({ supplier, items }) => {
              const supplierTotal = items.reduce(
                (total, product) => total + (product.responses[supplier.id]?.price || 0) * product.requestedQuantity,
                0,
              );
              return (
                <div key={supplier.id} className={`rounded-2xl border p-5 ${
                  isDarkMode ? 'border-slate-700 bg-slate-950/50' : 'border-slate-200 bg-slate-50/70'
                }`}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-sm font-black">{supplier.name || 'Distribuidora não identificada'}</h3>
                      <p className="text-[11px] opacity-60">{items.length} produto(s) selecionado(s)</p>
                    </div>
                    <strong className="text-sm text-emerald-600 dark:text-emerald-400">{formatCurrency(supplierTotal)}</strong>
                  </div>
                  <div className="space-y-2">
                    {items.map((product) => {
                      const price = product.responses[supplier.id]?.price || 0;
                      return (
                        <div key={product.productId} className="flex items-center justify-between gap-3 border-t border-slate-500/10 pt-2 text-xs">
                          <div className="min-w-0">
                            <p className="font-bold truncate">{product.description}</p>
                            <p className="text-[11px] opacity-60">Qtd.: {product.requestedQuantity}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-mono font-bold">{formatCurrency(price)}</p>
                            <p className="text-[11px] opacity-60">{formatCurrency(price * product.requestedQuantity)}</p>
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
            <div className={`mt-5 rounded-2xl border p-5 ${
              isDarkMode ? 'border-amber-500/30 bg-amber-500/10' : 'border-amber-200 bg-amber-50'
            }`}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-sm font-black text-amber-700 dark:text-amber-300">Itens não pedidos</h3>
                  <p className="text-[11px] opacity-70">Eles não serão enviados a nenhuma distribuidora.</p>
                </div>
                <strong className="text-xs">{unrequestedSummary.length} item(ns)</strong>
              </div>
              <div className="space-y-2">
                {unrequestedSummary.map(({ product, reason }) => (
                  <div key={product.productId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-t border-amber-500/20 pt-2 text-xs">
                    <span className="font-bold">{product.description} <span className="font-normal opacity-70">• Qtd.: {product.requestedQuantity}</span></span>
                    <span className="text-[11px] opacity-75">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-2 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs sm:grid-cols-3">
            <span><strong>Período:</strong> {formatDate(quotation.startDate)} até {formatDate(quotation.endDate)}</span>
            <span><strong>Pagamento:</strong> {quotation.paymentTerms || 'Não informado'}</span>
            <span><strong>Quantidade:</strong> conforme solicitado na cotação</span>
          </div>
        </section>

        {/* Painel de Pendências */}
        {pendingProducts.length > 0 && (
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-6 shadow-xl space-y-2">
            <span className="inline-flex rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-500">
              ⚠️ Atenção: Gestão de Pendências
            </span>
            <h3 className="text-sm font-black tracking-tight text-amber-600 dark:text-amber-400">
              Produtos sem fornecedor selecionado ou não atendidos ({pendingProducts.length})
            </h3>
            <p className="text-xs opacity-70">
              Certifique-se de alocar todos os itens necessários antes de despachar os pedidos de compra para os distribuidores.
            </p>
          </div>
        )}

      </main>

      {/* MENU DE COMANDOS */}
      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId={quotationId} />

    </div>
  );
}