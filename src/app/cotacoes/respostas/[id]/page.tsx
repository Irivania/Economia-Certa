'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

  const productsMap: Record<string, { productId: string; description: string; ean?: string | null; brand?: string | null; imageUrl?: string | null; requestedQuantity: number; responses: Record<string, { price: number; outOfStock: boolean }> }> = {};

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

      // Guarda os pedidos no localStorage para exibição na tela de destino
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
              Mapa Comparativo de Preços
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

        {/* Tabela Comparativa */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Disputa de Menor Preço e Seleção de Compra
            </h2>
            <span className="text-[11px] text-slate-500">
              Selecione o fornecedor ou clique novamente para cancelar a compra do item (enviar para pendências)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold min-w-[220px]">Produto</th>
                  <th className="px-4 py-3 font-semibold text-center">Qtd</th>
                  {suppliers.map((sup) => (
                    <th key={sup.supplierId} className="px-4 py-3 font-semibold text-center min-w-[180px] border-l border-slate-200">
                      <div className="font-bold text-slate-800">{sup.name || 'Fornecedor'}</div>
                      <div className="text-[10px] text-slate-400 font-normal uppercase mb-1.5">{sup.status}</div>
                      <button
                        onClick={() => handleSelectAllForSupplier(sup.supplierId)}
                        className="text-[10px] bg-white border border-indigo-200 text-indigo-600 px-2 py-0.5 rounded hover:bg-indigo-50 font-medium transition"
                      >
                        Comprar tudo aqui
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productsList.map((prod) => {
                  let menorPreco = Infinity;
                  suppliers.forEach((sup) => {
                    const resp = prod.responses[sup.supplierId];
                    if (resp && !resp.outOfStock && resp.price > 0 && resp.price < menorPreco) {
                      menorPreco = resp.price;
                    }
                  });

                  return (
                    <tr key={prod.productId} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 min-w-[2.5rem] flex items-center justify-center rounded border bg-white overflow-hidden text-xs">
                            {prod.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={prod.imageUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              '📦'
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{prod.description}</p>
                            <p className="text-[10px] text-slate-400 font-mono">EAN: {prod.ean || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700">{prod.requestedQuantity}</td>

                      {suppliers.map((sup) => {
                        const resp = prod.responses[sup.supplierId];
                        const isVencedor = resp && !resp.outOfStock && resp.price > 0 && resp.price === menorPreco;
                        const isSelected = selectedChoices[prod.productId] === sup.supplierId;

                        return (
                          <td key={sup.supplierId} className={`px-4 py-3 text-center border-l border-slate-100 ${isVencedor ? 'bg-emerald-50/40' : ''}`}>
                            {!resp ? (
                              <span className="text-slate-400 italic">Sem resposta</span>
                            ) : resp.outOfStock ? (
                              <span className="text-red-600 font-semibold text-[10px] bg-red-50 px-2 py-0.5 rounded">Não tem</span>
                            ) : resp.price === 0 ? (
                              <span className="text-slate-400">—</span>
                            ) : (
                              <div className="space-y-1.5 flex flex-col items-center">
                                <p className={`font-bold ${isVencedor ? 'text-emerald-700 text-sm' : 'text-slate-700'}`}>
                                  {formatCurrency(resp.price)}
                                </p>
                                {isVencedor && (
                                  <span className="inline-block bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                    🏆 Menor Preço
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = { ...selectedChoices };
                                    if (isSelected) {
                                      delete updated[prod.productId]; // Desseleciona e envia para pendências
                                    } else {
                                      updated[prod.productId] = sup.supplierId; // Seleciona
                                    }
                                    setSelectedChoices(updated);
                                  }}
                                  className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded cursor-pointer border transition font-medium ${
                                    isSelected
                                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  <span>{isSelected ? '✓ Selecionado' : 'Selecionar'}</span>
                                </button>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>

              <tfoot className="bg-slate-100 font-bold text-slate-800 border-t border-slate-200">
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-right uppercase text-[11px] tracking-wider">
                    Total Selecionado por Fornecedor:
                  </td>
                  {suppliers.map((sup) => {
                    const supplierTotal = productsList.reduce((acc, prod) => {
                      if (selectedChoices[prod.productId] === sup.supplierId) {
                        const resp = prod.responses[sup.supplierId];
                        if (resp && !resp.outOfStock) {
                          return acc + resp.price * prod.requestedQuantity;
                        }
                      }
                      return acc;
                    }, 0);

                    return (
                      <td key={sup.supplierId} className="px-4 py-4 text-center border-l border-slate-200 text-indigo-700 text-sm">
                        {formatCurrency(supplierTotal)}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

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
                <p className="text-xs text-amber-700">
                  Estes itens não tiveram propostas válidas, ficaram esgotados em todos os fornecedores ou o preço foi rejeitado pelo comprador.
                </p>
              </div>

              <button
                onClick={() => {
                  const titles = pendingProducts
                    .map((p) => `- ${p.description} (Qtd: ${p.requestedQuantity})`)
                    .join('\n');
                  alert(`Lista de Pendências:\n\n${titles}`);
                }}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow hover:bg-amber-700 transition"
              >
                📋 Gerar Relatório / Nova Cotação para Pendentes
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {pendingProducts.map((prod) => (
                <div key={prod.productId} className="bg-white border border-amber-200 rounded-lg p-3 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="h-8 w-8 min-w-[2rem] flex items-center justify-center rounded border bg-slate-50 text-xs">
                      {prod.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={prod.imageUrl} alt="" className="h-full w-full object-cover rounded" />
                      ) : (
                        '📦'
                      )}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{prod.description}</p>
                      <p className="text-[10px] text-slate-500">
                        Qtd Solicitada: <strong>{prod.requestedQuantity}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded font-semibold whitespace-nowrap">
                    Pendente
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}