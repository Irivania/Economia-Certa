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
  name?: string | null;
  status?: string | null;
}

interface Quotation {
  id: string;
  title: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  suppliers?: QuotationSupplier[];
  items?: QuotationItem[];
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

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const quotationId = resolvedParams?.id;
  const { isDarkMode } = useTheme();

  const router = useRouter();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
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
        setQuotation(data);

        const initialChoices: Record<string, string> = {};
        const rawItems = data.items || [];
        const suppliers = data.suppliers || [];

        const tempMap: Record<string, { responses: Record<string, { price: number; outOfStock: boolean }> }> = {};
        rawItems.forEach((item: QuotationItem) => {
          const prodKey = item.productId;
          if (!tempMap[prodKey]) {
            tempMap[prodKey] = { responses: {} };
          }
          if (item.supplierId) {
            tempMap[prodKey].responses[item.supplierId] = {
              price: Number(item.price || 0),
              outOfStock: Boolean(item.outOfStock),
            };
          }
        });

        Object.entries(tempMap).forEach(([prodKey, prodData]) => {
          let bestSup = '';
          let lowest = Infinity;
          suppliers.forEach((sup: QuotationSupplier) => {
            const resp = prodData.responses[sup.supplierId];
            if (resp && !resp.outOfStock && resp.price > 0 && resp.price < lowest) {
              lowest = resp.price;
              bestSup = sup.supplierId;
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

    if (item.supplierId) {
      productsMap[prodKey].responses[item.supplierId] = {
        price: Number(item.price || 0),
        outOfStock: Boolean(item.outOfStock),
      };
    }
  });

  const productsList = Object.values(productsMap);

  const handleSmartQuote = () => {
    const newChoices: Record<string, string> = {};
    productsList.forEach((prod) => {
      let bestSup = '';
      let lowest = Infinity;
      suppliers.forEach((sup) => {
        const resp = prod.responses[sup.supplierId];
        if (resp && !resp.outOfStock && resp.price > 0 && resp.price < lowest) {
          lowest = resp.price;
          bestSup = sup.supplierId;
        }
      });
      if (bestSup) {
        newChoices[prod.productId] = bestSup;
      }
    });
    setSelectedChoices(newChoices);
  };

  const handleSelectChoice = (productId: string, supplierId: string) => {
    const updated = { ...selectedChoices };
    if (!supplierId || updated[productId] === supplierId) {
      delete updated[productId];
    } else {
      updated[productId] = supplierId;
    }
    setSelectedChoices(updated);
  };

  const handleSelectAllForSupplier = (supplierId: string) => {
    const newChoices = { ...selectedChoices };
    productsList.forEach((prod) => {
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
      const ordersMap: Record<string, Array<{ productId: string; description: string; quantity: number; price: number }>> = {};

      Object.entries(selectedChoices).forEach(([productId, supplierId]) => {
        const product = productsList.find(p => p.productId === productId);
        if (product && product.responses[supplierId]) {
          if (!ordersMap[supplierId]) {
            ordersMap[supplierId] = [];
          }
          ordersMap[supplierId].push({
            productId,
            description: product.description,
            quantity: product.requestedQuantity,
            price: product.responses[supplierId].price,
          });
        }
      });

      if (Object.keys(ordersMap).length === 0) {
        alert('Nenhum item foi selecionado para compra. Verifique as escolhas.');
        setSaving(false);
        return;
      }

      localStorage.setItem(`quotation_orders_${quotationId}`, JSON.stringify(ordersMap));

      await fetch(`/api/quotations/${quotationId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choices: selectedChoices, orders: ordersMap }),
      }).catch(() => {});

      alert('Cotação finalizada com sucesso! Os pedidos de compra foram gerados.');
      router.push(`/cotacoes/pedidos/${quotationId}`);
    } catch (err) {
      console.error(err);
      alert('Erro ao finalizar a cotação.');
    } finally {
      setSaving(false);
    }
  };

  const pendingProducts = productsList.filter((prod) => {
    const hasChoice = selectedChoices[prod.productId];
    const allOutOfStock = suppliers.every((sup) => {
      const resp = prod.responses[sup.supplierId];
      return !resp || resp.outOfStock || resp.price === 0;
    });
    return !hasChoice || allOutOfStock;
  });

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
        
        <div className="flex items-center justify-between text-xs">
          <Link href="/cotacoes" className="font-bold opacity-70 hover:opacity-100 transition flex items-center gap-1.5">
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
          selectedChoices={selectedChoices}
          onSelectChoice={handleSelectChoice}
          onSelectAllForSupplier={handleSelectAllForSupplier}
          formatCurrency={formatCurrency}
        />

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
              Certifique-se de alocar todos os itens necessários antes de despachar os pedidos de compra para os distribuidores da Melo Perfumaria.
            </p>
          </div>
        )}

      </main>

      {/* MENU DE COMANDOS */}
      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId={quotationId} />

    </div>
  );
}