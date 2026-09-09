'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  description?: string;
  brand?: string | null;
  ean?: string | null;
  imageUrl?: string | null;
}

interface QuotationItem {
  id: string;
  productId: string;
  requestedQuantity?: number | string | null;
  price?: number | string | null;
  outOfStock?: boolean | null;
  product?: Product;
}

interface Quotation {
  id: string;
  title: string;
  supplierName?: string | null;
  storeName?: string | null;
  status?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  closingTime?: string | null;
  observation?: string | null;
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

export default function QuotationResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const quotationId = resolvedParams.id;

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuotationDetails() {
      if (!quotationId) {
        setError('Identificador de cotação inválido.');
        setLoading(false);
        return;
      }

      try {
        // Chamada direta e otimizada por ID (Padrão Sênior)
        const res = await fetch(`/api/quotations/${quotationId}`);
        if (!res.ok) {
          throw new Error('Não foi possível carregar os dados desta cotação.');
        }

        const data = await res.json();
        setQuotation(data);
      } catch (err) {
        console.error('Erro ao carregar detalhes da cotação:', err);
        setError('Não foi possível carregar as respostas desta cotação.');
      } finally {
        setLoading(false);
      }
    }

    loadQuotationDetails();
  }, [quotationId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500 font-medium">
        Carregando painel de respostas...
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-md shadow-sm space-y-4">
          <p className="text-sm font-semibold text-red-600">{error || 'Cotação não encontrada.'}</p>
          <Link
            href="/cotacoes"
            className="inline-block rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
          >
            Voltar para listagem
          </Link>
        </div>
      </div>
    );
  }

  const items = quotation.items || [];
  const totalItemsCount = items.length;
  const answeredItemsCount = items.filter((item) => Number(item.price) > 0 || Boolean(item.outOfStock)).length;
  const progressPercentage = totalItemsCount > 0 ? Math.round((answeredItemsCount / totalItemsCount) * 100) : 0;

  const totalValue = items.reduce((sum, item) => {
    if (item.outOfStock || !item.price) return sum;
    const price = Number(item.price);
    const quantity = Number(item.requestedQuantity || 0);
    if (!Number.isFinite(price) || !Number.isFinite(quantity) || quantity <= 0) return sum;
    return sum + price * quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Navegação Voltar */}
        <div className="flex items-center justify-between text-sm text-slate-500">
          <Link href="/cotacoes" className="font-medium hover:text-indigo-600 transition flex items-center gap-1">
            ← Voltar para cotações
          </Link>
        </div>

        {/* Cabeçalho Principal */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-700">
                Auditoria de Respostas
              </span>
              <h1 className="text-2xl font-bold text-slate-900">{quotation.title}</h1>
              <p className="text-sm text-slate-600">
                Fornecedor / Representante: <span className="font-semibold text-slate-800">{quotation.supplierName || quotation.storeName || 'Não informado'}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                {quotation.status === 'OPEN' ? 'Aberta' : quotation.status || 'Ativa'}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {answeredItemsCount}/{totalItemsCount} itens respondidos
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso Visual (UX Avançada) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Progresso de Preenchimento do Fornecedor</span>
            <span className="text-indigo-600">{progressPercentage}% concluído</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Data de Início</p>
            <p className="mt-2 text-base font-semibold text-slate-800">{formatDate(quotation.startDate)}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Data de Término / Limite</p>
            <p className="mt-2 text-base font-semibold text-slate-800">
              {formatDate(quotation.endDate)} {quotation.closingTime ? `às ${quotation.closingTime}` : ''}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Valor Total Ofertado</p>
            <p className="mt-2 text-base font-semibold text-emerald-600">{formatCurrency(totalValue)}</p>
          </div>
        </div>

        {/* Observações do Fornecedor (Se houver) */}
        {quotation.observation && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-800">Observações do Fornecedor</p>
            <p className="text-xs text-slate-700 font-medium whitespace-pre-line">{quotation.observation}</p>
          </div>
        )}

        {/* Tabela de Itens Detalhada */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-700">Detalhamento dos Itens da Cotação</h2>
          </div>

          {items.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Nenhum item foi encontrado nesta cotação.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Produto</th>
                    <th className="px-5 py-3 font-semibold text-center">Qtd. Solicitada</th>
                    <th className="px-5 py-3 font-semibold">Preço Unitário</th>
                    <th className="px-5 py-3 font-semibold">Status do Item</th>
                    <th className="px-5 py-3 font-semibold text-right">Total Calculado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const quantity = Number(item.requestedQuantity || 0);
                    const price = Number(item.price || 0);
                    const isOutOfStock = Boolean(item.outOfStock);
                    const hasResponse = price > 0 || isOutOfStock;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 min-w-[3rem] items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white text-xs text-slate-400">
                              {item.product?.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.product.imageUrl} alt={item.product.description || 'Produto'} className="h-full w-full object-cover" />
                              ) : (
                                '📦'
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-semibold text-slate-800 truncate">{item.product?.description || 'Produto sem descrição'}</p>
                              <p className="text-[11px] text-slate-500 font-mono truncate">
                                EAN: {item.product?.ean || 'N/A'} {item.product?.brand ? `| Marca: ${item.product.brand}` : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center font-medium text-slate-700">{quantity} un</td>
                        <td className="px-5 py-4 text-slate-700">
                          {isOutOfStock ? (
                            <span className="font-medium text-red-600">—</span>
                          ) : hasResponse ? (
                            <span className="font-semibold text-slate-800">{formatCurrency(price)}</span>
                          ) : (
                            <span className="text-slate-400 italic text-xs">Aguardando...</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isOutOfStock ? (
                            <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-red-700">
                              Não tenho
                            </span>
                          ) : hasResponse ? (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                              Respondido
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
                              Pendente
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-slate-800">
                          {isOutOfStock ? '—' : hasResponse ? formatCurrency(price * quantity) : '—'}
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
    </div>
  );
}