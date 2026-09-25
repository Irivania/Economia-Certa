'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QuotationTable from '@/components/QuotationTable';

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

export default function QuotationComparisonPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const quotationId = resolvedParams?.id;

  const router = useRouter();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500 font-medium">
        Carregando mapa comparativo...
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-md shadow-sm space-y-4">
          <p className="text-sm font-semibold text-red-600">{error || 'Cotação não encontrada.'}</p>
          <Link href="/cotacoes" className="inline-block rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition">
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
    if (updated[productId] === supplierId) {
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
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        
        <div className="flex items-center justify-between text-sm text-slate-500">
          <Link href="/cotacoes" className="font-medium hover:text-indigo-600 transition flex items-center gap-1">
            ← Voltar para cotações
          </Link>
        </div>

        {/* Cabeçalho */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
              Mapa Comparativo de Preços & Rentabilidade
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{quotation.title}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Início: <strong>{formatDate(quotation.startDate)}</strong> | Término: <strong>{formatDate(quotation.endDate)}</strong>
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSmartQuote}
              className="bg-slate-800 text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow hover:bg-slate-900 transition flex items-center gap-2"
            >
              ⚡ Cotação Automática (Mix Mais Barato)
            </button>

            <button
              onClick={handleFinalizeQuotation}
              disabled={saving}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? 'A processar...' : '✅ Finalizar Escolha e Gerar Pedidos'}
            </button>
          </div>
        </div>

        {/* Tabela Isolada em Componente */}
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
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              <div>
                <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  ⚠️ Atenção: Gestão de Pendências
                </span>
                <h3 className="text-base font-bold text-amber-900 mt-1">
                  Produtos sem fornecedor selecionado ou não atendidos ({pendingProducts.length})
                </h3>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}