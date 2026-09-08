'use client';

import { FormEvent, useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ProductSelectionModal from '@/components/ProductSelectionModal';
import QuotationBasicInfo from '@/components/QuotationBasicInfo';

interface Supplier {
  id: string;
  name: string;
  contactPerson?: string | null;
}

interface ProductFromDb {
  id: string;
  description: string;
  brand?: string | null;
  ean?: string | null;
  imageUrl?: string | null;
  stockCurrent: number;
  stockIdeal: number;
}

interface QuotationItem {
  id: string;
  productId: string;
  description?: string;
  brand?: string | null;
  ean?: string | null;
  imageUrl?: string | null;
  requestedQuantity: number;
  costPrice?: number;
}

interface ApiQuotationItem {
  id?: string;
  productId?: string;
  description?: string;
  requestedQuantity?: number | string;
  costPrice?: number | string;
}

interface ApiQuotation {
  id: string;
  title?: string;
  paymentTerms?: string | null;
  supplierId?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  closingTime?: string | null;
  items?: ApiQuotationItem[];
}

const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';

function toDateInputValue(value?: string | Date | null) {
  if (value === null || value === undefined || value === '') return '';

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10);
  }

  const normalizedValue = value.trim();
  if (!normalizedValue) return '';

  const dateOnlyMatch = normalizedValue.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateOnlyMatch) return dateOnlyMatch[1];

  const parsedDate = new Date(normalizedValue);
  return isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString().slice(0, 10);
}

export default function EditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const quotationId = resolvedParams.id;
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<ProductFromDb[]>([]);
  
  const [title, setTitle] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Boleto 28 Dias');
  const [supplierId, setSupplierId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [closingTime, setClosingTime] = useState('');
  
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!quotationId) return;

      try {
        const [quotationsRes, suppliersRes, productsRes] = await Promise.all([
          fetch(`/api/quotations?companyId=${companyId}`),
          fetch(`/api/suppliers?companyId=${companyId}`),
          fetch(`/api/products?companyId=${companyId}`),
        ]);

        if (!quotationsRes.ok || !suppliersRes.ok) {
          throw new Error('Não foi possível carregar os dados.');
        }

        const quotationsData: unknown = await quotationsRes.json();
        const suppliersData = await suppliersRes.json();
        
        let productsData: unknown = [];
        if (productsRes.ok) {
          productsData = await productsRes.json();
        }
        if (!Array.isArray(productsData) || (productsData as unknown[]).length === 0) {
          const fallbackRes = await fetch('/api/products');
          if (fallbackRes.ok) productsData = await fallbackRes.json();
        }

        const quotationPayload = quotationsData as { quotations?: ApiQuotation[] };
        const list: ApiQuotation[] = Array.isArray(quotationsData)
          ? quotationsData as ApiQuotation[]
          : Array.isArray(quotationPayload.quotations)
            ? quotationPayload.quotations
            : [];
        const current = list.find((item: ApiQuotation) => item.id === quotationId);

        if (!current) {
          setError('Cotação não encontrada.');
          setLoading(false);
          return;
        }

        let rawTitle = current.title || '';
        let extractedTerms = 'Boleto 28 Dias';
        const match = rawTitle.match(/^(.*?)\s*\(([^)]+)\)$/);
        if (match) {
          rawTitle = match[1].trim();
          extractedTerms = match[2].trim();
        }

        setTitle(rawTitle);
        setPaymentTerms(current.paymentTerms || extractedTerms);
        setSupplierId(current.supplierId || '');
        setStartDate(toDateInputValue(current.startDate));
        setEndDate(toDateInputValue(current.endDate));
        setClosingTime(current.closingTime || '');

        setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);

        const rawProdList = Array.isArray(productsData) ? productsData : (productsData as { products?: ProductFromDb[]; data?: ProductFromDb[] }).products || (productsData as { data?: ProductFromDb[] }).data || [];
        const catalogList: ProductFromDb[] = rawProdList as ProductFromDb[];
        setCatalogProducts(catalogList);

        const loadedItems: QuotationItem[] = (current.items || []).map((ci: ApiQuotationItem) => {
          const prod = catalogList.find((p: ProductFromDb) => p.id === ci.productId || (ci.description && p.description.toLowerCase() === ci.description.toLowerCase()));
          return {
            id: ci.id || ci.productId || '',
            productId: ci.productId || '',
            description: prod?.description || ci.description || 'Produto sem descrição',
            brand: prod?.brand || null,
            ean: prod?.ean || null,
            imageUrl: prod?.imageUrl || null,
            requestedQuantity: Number(ci.requestedQuantity) || 1,
            costPrice: Number(ci.costPrice) || 0,
          };
        });

        setQuotationItems(loadedItems);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar os dados da cotação.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [quotationId]);

  const handleRemoveItem = (id: string) => {
    setQuotationItems(prev => prev.filter(item => item.id !== id && item.productId !== id));
  };

  const handleAddSelectedProducts = (selectedProductIds: string[]) => {
    const productsToAdd = catalogProducts.filter(p => selectedProductIds.includes(p.id));

    const newItems: QuotationItem[] = productsToAdd
      .filter(p => !quotationItems.some(existing => existing.productId === p.id))
      .map(p => {
        const diff = (p.stockIdeal || 0) - (p.stockCurrent || 0);
        const suggestedQty = diff > 0 ? diff : 1;
        return {
          id: p.id,
          productId: p.id,
          description: p.description,
          brand: p.brand || null,
          ean: p.ean || null,
          imageUrl: p.imageUrl || null,
          requestedQuantity: suggestedQty,
          costPrice: 0,
        };
      });

    setQuotationItems(prev => [...prev, ...newItems]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!title.trim() || !supplierId) {
      setError('Informe o título e selecione um fornecedor.');
      return;
    }

    if (!paymentTerms.trim()) {
      setError('Informe a condição de pagamento.');
      return;
    }

    if (quotationItems.length === 0) {
      setError('Adicione pelo menos um item à cotação.');
      return;
    }

    if (startDate && endDate && endDate < startDate) {
      setError('A data de término deve ser posterior à data de início.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/quotations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: quotationId,
          companyId,
          title: title.trim(),
          paymentTerms: paymentTerms.trim(),
          supplierId,
          startDate: startDate || null,
          endDate: endDate || null,
          closingTime: closingTime || null,
          items: quotationItems,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error((data as { error?: string }).error || 'Não foi possível atualizar a cotação.');

      router.push('/cotacoes');
    } catch (submitError) {
      console.error(submitError);
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível atualizar a cotação.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = quotationItems.filter(item =>
    (item.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.ean || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <main className="min-h-screen bg-slate-50 px-6 py-10"><p className="mx-auto max-w-4xl text-center text-sm text-slate-400">Carregando cotação...</p></main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/cotacoes" className="text-sm font-medium text-slate-500 transition hover:text-indigo-600">← Voltar para cotações</Link>
        
        <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">Edição de Cotação</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Modificar Solicitação e Produtos</h1>
            <p className="mt-1 text-sm text-slate-500">Altere os dados gerais, adicione/remova produtos e ajuste quantidades.</p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2.5 rounded-lg text-sm transition shadow-sm"
            >
              + Adicionar do Catálogo
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <QuotationBasicInfo
            title={title}
            setTitle={setTitle}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            closingTime={closingTime}
            setClosingTime={setClosingTime}
            paymentTerms={paymentTerms}
            setPaymentTerms={setPaymentTerms}
            attachedFile={null}
            onFileChange={() => {}}
            onRemoveFile={() => {}}
          />

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-slate-700 text-sm">Itens da Cotação ({quotationItems.length})</h2>
              <div className="w-72">
                <input
                  type="text"
                  placeholder="Buscar na lista por nome ou EAN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-100">
                    <th className="p-3 font-semibold">Produto / Descrição</th>
                    <th className="p-3 font-semibold">Código de Barras (EAN)</th>
                    <th className="p-3 font-semibold text-center">Qtd. Solicitada</th>
                    <th className="p-3 font-semibold text-center">Preço de Custo (R$)</th>
                    <th className="p-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        Nenhum item adicionado. Clique em &quot;+ Adicionar do Catálogo&quot; acima.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id || item.productId} className="hover:bg-slate-50/50">
                        <td className="p-3 font-medium text-slate-800">
                          <div className="flex items-center gap-3">
                            {item.imageUrl ? (
                              <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-white">
                                <Image
                                  src={item.imageUrl}
                                  alt={item.description || 'Produto'}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-slate-400 text-xs">
                                📦
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-800">{item.description}</p>
                              {item.brand && <p className="text-xs text-slate-400">{item.brand}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600 font-mono text-xs">
                          {item.ean || 'Não informado'}
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.requestedQuantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              setQuotationItems(prev => prev.map(i => (i.id === item.id || i.productId === item.productId) ? { ...i, requestedQuantity: Math.max(1, val) } : i));
                            }}
                            className="w-20 text-center border border-slate-200 rounded-md py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            value={item.costPrice ?? ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setQuotationItems(prev => prev.map(i => (i.id === item.id || i.productId === item.productId) ? { ...i, costPrice: val } : i));
                            }}
                            className="w-28 text-center border border-slate-200 rounded-md py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-amber-50/50 font-medium text-slate-700"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id || item.productId)}
                            className="text-red-500 hover:text-red-700 font-medium text-xs transition"
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Fornecedor / Representante
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              >
                <option value="">Selecione um fornecedor</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
          </div>

          {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/cotacoes" className="rounded-lg px-5 py-2.5 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-100 bg-white border border-slate-200">Cancelar</Link>
            <button type="submit" disabled={submitting} className="rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-50">
              {submitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>

        <ProductSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          products={catalogProducts.map(p => ({
            ...p,
            brand: p.brand || undefined,
            ean: p.ean || undefined,
            imageUrl: p.imageUrl || undefined,
          }))}
          onAddSelectedProducts={handleAddSelectedProducts}
        />
      </div>
    </main>
  );
}