'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
  suppliers?: QuotationSupplier[];
  items?: QuotationItem[];
}

const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function ComparativeReportPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string>('');
  const [detailedQuotation, setDetailedQuotation] = useState<Quotation | null>(null);
  const [loadingQuotations, setLoadingQuotations] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    async function fetchQuotations() {
      try {
        const res = await fetch(`/api/quotations?companyId=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setQuotations(data);
            setSelectedQuotationId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar cotações:', err);
      } finally {
        setLoadingQuotations(false);
      }
    }
    fetchQuotations();
  }, []);

  useEffect(() => {
    if (!selectedQuotationId) return;

    async function loadQuotationDetails() {
      try {
        setLoadingDetails(true);
        const res = await fetch(`/api/quotations/${selectedQuotationId}`);
        if (res.ok) {
          const data = await res.json();
          setDetailedQuotation(data);
        } else {
          setDetailedQuotation(null);
        }
      } catch (err) {
        console.error('Erro ao carregar detalhes da cotação:', err);
        setDetailedQuotation(null);
      } finally {
        setLoadingDetails(false);
      }
    }

    loadQuotationDetails();
  }, [selectedQuotationId]);

  const suppliers = detailedQuotation?.suppliers || [];
  const rawItems = detailedQuotation?.items || [];

  const productsMap: Record<string, {
    productId: string;
    description: string;
    requestedQuantity: number;
    responses: Record<string, { price: number; outOfStock: boolean }>;
  }> = {};

  rawItems.forEach((item) => {
    const prodKey = item.productId;
    if (!productsMap[prodKey]) {
      productsMap[prodKey] = {
        productId: item.productId,
        description: item.description || 'Produto sem descrição',
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm">
        <Link href="/" className="font-medium text-slate-500 transition hover:text-indigo-600">
          ← Voltar para o Dashboard
        </Link>
        <div className="space-x-4">
          <Link href="/cotacoes" className="text-indigo-600 font-medium hover:underline">
            Gerenciar Cotações →
          </Link>
          {selectedQuotationId && (
            <Link href={`/cotacoes/pedidos/${selectedQuotationId}`} className="text-emerald-600 font-medium hover:underline">
              📦 Ver Pedidos desta Cotação →
            </Link>
          )}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-800">📈 Relatório Comparativo de Preços</h1>
        <p className="mt-1 text-sm text-slate-500">Análise lado a lado de preços por fornecedor baseada na cotação selecionada.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-1/3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Selecione a Cotação
          </label>
          <select
            value={selectedQuotationId}
            onChange={(e) => setSelectedQuotationId(e.target.value)}
            disabled={loadingQuotations}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
          >
            {loadingQuotations ? (
              <option>Carregando cotações...</option>
            ) : quotations.length === 0 ? (
              <option>Nenhuma cotação encontrada</option>
            ) : (
              quotations.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="w-full sm:w-2/3 flex items-end">
          <p className="text-xs text-slate-400">
            * O relatório cruza automaticamente os valores respondidos por cada distribuidora nesta cotação.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loadingDetails ? (
          <div className="p-12 text-center text-slate-400 text-sm">Carregando dados comparativos...</div>
        ) : productsList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Nenhum dado encontrado para esta cotação.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
                <tr>
                  <th className="p-4 font-semibold min-w-[220px]">Produto</th>
                  <th className="p-4 text-center font-semibold">Qtd</th>
                  {suppliers.map((sup) => (
                    <th key={sup.supplierId} className="p-4 text-center font-semibold border-l border-slate-200">
                      {sup.name || 'Fornecedor'}
                    </th>
                  ))}
                  <th className="p-4 text-center font-semibold text-emerald-700 bg-emerald-50/50 border-l border-slate-200">Melhor Preço</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productsList.map((prod) => {
                  let menorPreco = Infinity;
                  let melhorFornecedor = '';

                  suppliers.forEach((sup) => {
                    const resp = prod.responses[sup.supplierId];
                    if (resp && !resp.outOfStock && resp.price > 0 && resp.price < menorPreco) {
                      menorPreco = resp.price;
                      melhorFornecedor = sup.name || 'Fornecedor';
                    }
                  });

                  return (
                    <tr key={prod.productId} className="hover:bg-slate-50/50">
                      <td className="p-4 font-medium text-slate-800">{prod.description}</td>
                      <td className="p-4 text-center text-slate-600">{prod.requestedQuantity}</td>

                      {suppliers.map((sup) => {
                        const resp = prod.responses[sup.supplierId];
                        const isBest = resp && !resp.outOfStock && resp.price > 0 && resp.price === menorPreco;

                        return (
                          <td
                            key={sup.supplierId}
                            className={`p-4 text-center border-l border-slate-100 ${
                              isBest ? 'bg-emerald-50/40 font-bold text-emerald-800' : 'text-slate-600'
                            }`}
                          >
                            {!resp ? (
                              <span className="text-slate-400 italic text-xs">Sem resposta</span>
                            ) : resp.outOfStock ? (
                              <span className="text-red-600 font-semibold text-xs bg-red-50 px-2 py-0.5 rounded">Não tem</span>
                            ) : resp.price === 0 ? (
                              <span className="text-slate-400">—</span>
                            ) : (
                              <div>
                                <span>{formatCurrency(resp.price)}</span>
                                {isBest && (
                                  <div className="text-[10px] text-emerald-600 font-bold uppercase mt-0.5">🏆 Menor Preço</div>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}

                      <td className="p-4 text-center font-bold text-emerald-700 bg-emerald-50/50 border-l border-slate-200">
                        {menorPreco !== Infinity ? `${formatCurrency(menorPreco)} (${melhorFornecedor})` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}