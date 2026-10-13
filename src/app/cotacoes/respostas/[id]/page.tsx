'use client';

import React, { use, useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QuotationTable from '@/components/QuotationTable';
import { QuotationHeader } from '@/components/quotations/QuotationHeader';
import { QuotationOrdersSummary } from '@/components/quotations/QuotationOrdersSummary';
import { QuotationPendingAlert } from '@/components/quotations/QuotationPendingAlert';
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

interface MappedProduct {
  productId: string;
  description: string;
  ean?: string | null;
  brand?: string | null;
  imageUrl?: string | null;
  requestedQuantity: number;
  sellingPrice: number;
  responses: Record<string, { price: number; outOfStock: boolean }>;
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(value?: string | Date | null) {
  if (!value) return 'Não definido';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Não definido';
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

function QuotationResponsesContent({ id }: { id: string }) {
  const quotationId = id;
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
    if (e.key === 'Escape') setIsCmdOpen(false);
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

        const supplierMapping: Record<string, string> = {};
        suppliers.forEach((sup: QuotationSupplier) => {
          supplierMapping[sup.id] = sup.id;
        });

        const tempMap: Record<string, { responses: Record<string, { price: number; outOfStock: boolean }> }> = {};
        rawItems.forEach((item: QuotationItem) => {
          if (!tempMap[item.productId]) tempMap[item.productId] = { responses: {} };
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
          if (bestSup) initialChoices[prodKey] = bestSup;
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
        <div className={`border rounded-xl p-6 text-center max-w-md shadow-xs space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <p className="text-xs font-semibold text-rose-500">{error || 'Cotação não encontrada.'}</p>
          <Link href="/cotacoes" className="inline-block rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-xs">
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

  const productsMap: Record<string, MappedProduct> = {};
  rawItems.forEach((item) => {
    if (!productsMap[item.productId]) {
      productsMap[item.productId] = {
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
    if (supId && productsMap[si.productId]) {
      productsMap[si.productId].responses[supId] = {
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
      if (bestSup) newChoices[prod.productId] = bestSup;
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
          if (!ordersMap[supplierId]) ordersMap[supplierId] = [];
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
          reason: ignoredProducts.has(product.productId) ? 'Não desejado pelo lojista' : 'Sem fornecedor disponível ou não selecionado',
        }));

      if (Object.keys(ordersMap).length === 0 && unrequestedItems.length === 0) {
        alert('Selecione um fornecedor ou marque os produtos que não serão comprados.');
        setSaving(false);
        return;
      }

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
      <AppHeader
        title="Economia Certa"
        subtitle="Painel gerencial inteligente e controle de compras em tempo real."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20 relative z-20 space-y-6">
        <QuotationHeader
          title={quotation.title}
          startDate={quotation.startDate}
          endDate={quotation.endDate}
          saving={saving}
          onSmartQuote={handleSmartQuote}
          onExportSelection={handleExportSelection}
          onFinalize={handleFinalizeQuotation}
        />

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

        <QuotationOrdersSummary
          isDarkMode={isDarkMode}
          totalItemsCount={productsList.length}
          unrequestedCount={unrequestedSummary.length}
          summaryTotal={summaryTotal}
            selectedBySupplier={selectedBySupplier}
          unrequestedSummary={unrequestedSummary}
          startDate={quotation.startDate}
          endDate={quotation.endDate}
          paymentTerms={quotation.paymentTerms}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />

        <QuotationPendingAlert isDarkMode={isDarkMode} pendingCount={pendingProducts.length} />
      </main>

      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId={quotationId} />
    </div>
  );
}

export default function QuotationResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const quotationId = resolvedParams?.id;

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-500">A carregar mapa comparativo...</div>}>
      <QuotationResponsesContent id={quotationId} />
    </Suspense>
  );
}