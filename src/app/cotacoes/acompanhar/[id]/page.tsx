'use client';

import { FormEvent, useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductSelectionModal from '@/components/ProductSelectionModal';
import QuotationBasicInfo from '@/components/QuotationBasicInfo';
import QuotationSuppliersSection from '@/components/QuotationSuppliersSection';
import QuotationItemsSection from '@/components/QuotationItemsSection';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';
import { getCompanyId } from '@/lib/companySession';
import { apiFetch } from '@/lib/apiClient';

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

interface ApiSupplierLink {
  id: string;
  name?: string;
  status?: string;
  token?: string;
}

interface ApiQuotation {
  id: string;
  title?: string;
  paymentTerms?: string | null;
  supplierId?: string | null;
  suppliers?: ApiSupplierLink[];
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  closingTime?: string | null;
  items?: ApiQuotationItem[];
}

const companyId = getCompanyId();

function toDateInputValue(value?: string | Date | null) {
  if (value === null || value === undefined || value === '') return '';

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10);
  }

  const normalizedValue = String(value).trim();
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
  const { isDarkMode } = useTheme();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<ProductFromDb[]>([]);
  
  const [title, setTitle] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Boleto 28 Dias');
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [closingTime, setClosingTime] = useState('');
  
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!quotationId) return;

      try {
        // Utiliza o apiFetch para injetar automaticamente a sessão e o companyId
        const [quotationsRes, suppliersRes, productsRes] = await Promise.all([
          apiFetch('/api/quotations'),
          apiFetch('/api/suppliers'),
          apiFetch('/api/products'),
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
          setLoadingSuppliers(false);
          return;
        }

        setTitle(current.title || '');
        
        const loadedTerms = current.paymentTerms ? String(current.paymentTerms).trim() : 'Boleto 28 Dias';
        setPaymentTerms(loadedTerms);

        const linkedSupplierIds = Array.isArray(current.suppliers)
          ? current.suppliers.map((s: ApiSupplierLink) => s.id)
          : current.supplierId ? [current.supplierId] : [];
        setSelectedSupplierIds(linkedSupplierIds);

        setStartDate(toDateInputValue(current.startDate));
        setEndDate(toDateInputValue(current.endDate));
        setClosingTime(current.closingTime || '');

        setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);

        const rawProdList = Array.isArray(productsData) ? productsData : (productsData as { products?: ProductFromDb[]; data?: ProductFromDb[] }).products || (productsData as { data?: ProductFromDb[] }).data || [];
        const catalogList: ProductFromDb[] = rawProdList as ProductFromDb[];
        setCatalogProducts(catalogList);

        const loadedItems: QuotationItem[] = (current.items || []).map((ci: ApiQuotationItem) => {
          const prod = catalogList.find((p: ProductFromDb) => p.id === ci.productId || p.id === ci.id);
          return {
            id: ci.id || crypto.randomUUID(),
            productId: ci.productId || prod?.id || '',
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
        setLoadingSuppliers(false);
      }
    }

    loadData();
  }, [quotationId]);

  const toggleSupplier = (supplierId: string) => {
    setSelectedSupplierIds((current) =>
      current.includes(supplierId)
        ? current.filter((id) => id !== supplierId)
        : [...current, supplierId],
    );
  };

  const handleRemoveItem = (id: string) => {
    setQuotationItems(prev => prev.filter(item => item.id !== id && item.productId !== id));
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    setQuotationItems(prev => prev.map(i => (i.id === id || i.productId === id) ? { ...i, requestedQuantity: Math.max(1, qty) } : i));
  };

  const handleUpdatePrice = (id: string, price: number) => {
    setQuotationItems(prev => prev.map(i => (i.id === id || i.productId === id) ? { ...i, costPrice: price } : i));
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

    if (!title.trim()) {
      setError('Informe um título para a cotação.');
      return;
    }

    if (selectedSupplierIds.length === 0) {
      setError('Selecione ao menos um fornecedor.');
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
      const response = await apiFetch('/api/quotations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: quotationId,
          companyId,
          title: title.trim(),
          paymentTerms: paymentTerms.trim(),
          supplierIds: selectedSupplierIds,
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

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center text-xs font-medium ${isDarkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
        Carregando cotação...
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <AppHeader
        title="Economia Certa"
        subtitle="Painel gerencial inteligente e controle de compras em tempo real."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-6 sm:px-12 -mt-12 pb-20 relative z-20 space-y-8">
        
        <div>
          <Link href="/cotacoes" className="font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 transition hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-2 text-xs">
            ← Voltar para cotações
          </Link>
        </div>

        <header className={`rounded-3xl border p-8 shadow-2xl flex justify-between items-center transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'
        }`}>
          <div>
            <span className="inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-500 border border-amber-500/20">
              Edição de Cotação
            </span>
            <h1 className="text-xl md:text-2xl font-black tracking-tight mt-2">Modificar Solicitação e Produtos</h1>
            <p className="text-xs opacity-60 mt-1 font-medium">Altere os dados gerais, adicione/remova produtos e ajuste quantidades.</p>
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
          />

          <QuotationItemsSection
            items={quotationItems}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onUpdateQuantity={handleUpdateQuantity}
            onUpdatePrice={handleUpdatePrice}
            onRemoveItem={handleRemoveItem}
            onOpenModal={() => setIsModalOpen(true)}
          />

          <QuotationSuppliersSection
            suppliers={suppliers}
            selectedSupplierIds={selectedSupplierIds}
            onToggleSupplier={toggleSupplier}
            loading={loadingSuppliers}
          />

          {error && <p role="alert" className="rounded-2xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-xs font-semibold text-rose-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/cotacoes" className="rounded-2xl px-6 py-3 text-center text-xs font-bold text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              Cancelar
            </Link>
            <button type="submit" disabled={submitting} className="rounded-2xl bg-amber-600 px-6 py-3 text-xs font-extrabold text-white shadow-xl shadow-amber-600/25 transition hover:bg-amber-500 disabled:opacity-50 cursor-pointer">
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
      </main>

      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId={quotationId} />

    </div>
  );
}