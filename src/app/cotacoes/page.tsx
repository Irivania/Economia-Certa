'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  description: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface QuotationItem {
  id: string;
  productId: string;
  supplierId: string;
  requestedQuantity: string;
  unitPrice: string;
  product?: { description: string };
  supplier?: { name: string };
}

interface Quotation {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  items?: QuotationItem[];
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para o formulário de nova cotação
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Estados para adicionar item na cotação selecionada
  const [selectedQuotationId, setSelectedQuotationId] = useState<string>('');
  const [productId, setProductId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [itemSubmitting, setItemSubmitting] = useState(false);

  // Estado para Toast de feedback visual
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // UUID real e oficial da Melo Perfumaria
  const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [qRes, pRes, sRes] = await Promise.all([
          fetch(`/api/quotations?companyId=${companyId}`),
          fetch(`/api/products?companyId=${companyId}`),
          fetch(`/api/suppliers?companyId=${companyId}`),
        ]);

        if (!qRes.ok || !pRes.ok) throw new Error('Falha ao carregar dados.');

        const qData = await qRes.json();
        const pData = await pRes.json();
        const sData = sRes.ok ? await sRes.json() : [];

        if (isMounted) {
          setQuotations(qData);
          setProducts(pData);
          setSuppliers(sData);
        }
      } catch (err) {
        if (isMounted) setError('Não foi possível carregar os dados das cotações.');
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('O título da cotação é obrigatório.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, title, items: [] }),
      });

      if (!response.ok) throw new Error('Erro ao criar cotação.');

      setTitle('');
      showToast('Cotação criada com sucesso!');
      
      window.location.reload();
    } catch (err) {
      setFormError('Erro ao salvar a cotação.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuotationId || !productId || !supplierId || !unitPrice) {
      alert('Preencha todos os campos do item (Cotação, Produto, Fornecedor e Preço).');
      return;
    }

    try {
      setItemSubmitting(true);
      const res = await fetch('/api/quotations/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationId: selectedQuotationId,
          productId,
          supplierId,
          requestedQuantity: Number(quantity),
          unitPrice: Number(unitPrice),
        }),
      });

      if (!res.ok) throw new Error('Erro ao adicionar item.');

      setUnitPrice('');
      showToast('Proposta de preço adicionada com sucesso!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar item na cotação.');
    } finally {
      setItemSubmitting(false);
    }
  };

  const exportToCSV = (quotationTitle: string, items: QuotationItem[]) => {
    let csvContent = "data:text/csv;charset=utf-8,Produto,Fornecedor,Quantidade,Preco Unitario,Total\n";
    
    items.forEach((item) => {
      const row = [
        `"${item.product?.description || 'Produto'}"`,
        `"${item.supplier?.name || 'Fornecedor'}"`,
        item.requestedQuantity,
        item.unitPrice,
        Number(item.requestedQuantity) * Number(item.unitPrice)
      ].join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cotacao_${quotationTitle.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Relatório exportado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">📊 Painel de Cotações & Comparador</h1>
            <p className="text-slate-600 text-sm">Melo Perfumaria - Gestão de compras e melhores preços.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors">
              &larr; Dashboard
            </Link>
            <Link href="/produtos" className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors">
              Ir para Produtos &rarr;
            </Link>
          </div>
        </div>

        {/* Formulário para Nova Cotação */}
        <form onSubmit={handleCreateQuotation} className="mb-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h2 className="text-md font-bold text-slate-800 mb-3">Criar Nova Cotação</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Ex: Cotação de Perfumaria - Setembro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : 'Criar Cotação'}
            </button>
          </div>
          {formError && <p className="text-xs text-red-600 mt-2">{formError}</p>}
        </form>

        {/* Formulário para Adicionar Item / Preço do Fornecedor */}
        {quotations.length > 0 && (
          <form onSubmit={handleAddItem} className="mb-8 p-6 bg-blue-50/40 rounded-lg border border-blue-100">
            <h2 className="text-md font-bold text-slate-800 mb-3">Adicionar Proposta de Fornecedor</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <select
                value={selectedQuotationId}
                onChange={(e) => setSelectedQuotationId(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="">Selecione a Cotação</option>
                {quotations.map((q) => (
                  <option key={q.id} value={q.id}>{q.title}</option>
                ))}
              </select>

              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="">Selecione o Produto</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.description}</option>
                ))}
              </select>

              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="">Selecione o Fornecedor</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Qtd"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              />

              <input
                type="number"
                step="0.01"
                placeholder="Preço Unit. R$"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={itemSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {itemSubmitting ? 'Adicionando...' : '+ Adicionar Preço à Cotação'}
              </button>
            </div>
          </form>
        )}

        {/* Listagem e Comparativo */}
        {loading ? (
          <p className="text-slate-500 text-center py-10">Carregando cotações...</p>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Cotações Cadastradas & Comparativo</h2>
            {quotations.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                <p className="text-slate-400 mb-1">Nenhuma cotação cadastrada ainda.</p>
              </div>
            ) : (
              quotations.map((q) => {
                const items = q.items || [];
                const lowestPrices: { [productId: string]: number } = {};
                items.forEach((item) => {
                  const price = Number(item.unitPrice);
                  if (!lowestPrices[item.productId] || price < lowestPrices[item.productId]) {
                    lowestPrices[item.productId] = price;
                  }
                });

                return (
                  <div key={q.id} className="border border-slate-200 rounded-lg p-6 bg-white shadow-xs">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-bold text-slate-800 text-base">{q.title}</h3>
                        <p className="text-xs text-slate-400">Criada em: {new Date(q.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {items.length > 0 && (
                          <button
                            onClick={() => exportToCSV(q.title, items)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                          >
                            📥 Exportar Planilha
                          </button>
                        )}
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          {q.status === 'OPEN' ? 'Aberta' : q.status}
                        </span>
                      </div>
                    </div>

                    {items.length > 0 ? (
                      <div className="overflow-x-auto mt-4">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                              <th className="p-2 font-semibold">Produto</th>
                              <th className="p-2 font-semibold">Fornecedor</th>
                              <th className="p-2 font-semibold">Qtd</th>
                              <th className="p-2 font-semibold">Preço Unitário</th>
                              <th className="p-2 font-semibold">Total Item</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, idx) => {
                              const price = Number(item.unitPrice);
                              const isCheapest = price === lowestPrices[item.productId];
                              const total = Number(item.requestedQuantity) * price;

                              return (
                                <tr
                                  key={idx}
                                  className={`border-b border-slate-100 ${
                                    isCheapest ? 'bg-emerald-50/70 font-medium' : 'hover:bg-slate-50'
                                  }`}
                                >
                                  <td className="p-2 text-slate-800">
                                    {item.product?.description || 'Produto'}
                                    {isCheapest && (
                                      <span className="ml-2 px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">
                                        Melhor Preço
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-2 text-slate-600">{item.supplier?.name || 'Fornecedor'}</td>
                                  <td className="p-2 text-slate-600">{item.requestedQuantity}</td>
                                  <td className="p-2 text-slate-600">R$ {price.toFixed(2)}</td>
                                  <td className="p-2 font-semibold text-slate-800">R$ {total.toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center">
                        <p className="text-xs text-slate-500">Nenhum item adicionado a esta cotação ainda. Utilize o formulário acima.</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Componente de Toast / Notificação Visual */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 px-5 py-3 bg-emerald-600 text-white rounded-lg shadow-lg text-sm font-semibold transition-all z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}