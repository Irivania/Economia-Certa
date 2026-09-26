'use client';

import {
  FormEvent,
  useEffect,
  useState,
  useCallback,
  useSyncExternalStore,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductSelectionModal from '@/components/ProductSelectionModal';
import QuotationFormHeader from '@/components/QuotationFormHeader';
import QuotationBasicInfo from '@/components/QuotationBasicInfo';
import QuotationItemsTable from '@/components/QuotationItemsTable';
import QuotationSuppliersSection from '@/components/QuotationSuppliersSection';
import QuotationSuggestionBar from '@/components/QuotationSuggestionBar';
import { ProductImportModal, ItemPendente, Product } from '@/components/ProductImportModal';

interface Supplier {
  id: string;
  name: string;
  contactPerson?: string | null;
}

interface QuotationItem {
  id: string;
  productId: string;
  description: string;
  brand: string | null;
  ean: string | null;
  imageUrl?: string | null;
  stockCurrent: number;
  stockIdeal: number;
  requestedQuantity: number;
}

const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';
const emptySubscribe = () => () => {};

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function NewQuotationPage() {
  const router = useRouter();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);

  const [title, setTitle] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Boleto 28 Dias');
  
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
  
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);

  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProductsAndSuppliers = useCallback(async () => {
    try {
      const [supRes, prodRes] = await Promise.all([
        fetch(`/api/suppliers?companyId=${companyId}`),
        fetch(`/api/products?companyId=${companyId}`)
      ]);

      if (supRes.ok) {
        const supData = await supRes.json();
        setSuppliers(Array.isArray(supData) ? supData : []);
      }

      let prodData = [];
      if (prodRes.ok) {
        prodData = await prodRes.json();
      }
      const productList = Array.isArray(prodData) ? prodData : prodData.products || prodData.data || [];
      setCatalogProducts(productList);
    } catch (loadError) {
      console.error(loadError);
      setError('Não foi possível carregar os dados iniciais.');
    } finally {
      setLoadingSuppliers(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (!isMounted) return;
      await loadProductsAndSuppliers();
    }

    void init();

    return () => {
      isMounted = false;
    };
  }, [loadProductsAndSuppliers]);

  if (!mounted) {
    return null;
  }

  const toggleSupplier = (supplierId: string) => {
    setSelectedSupplierIds((current) =>
      current.includes(supplierId)
        ? current.filter((id) => id !== supplierId)
        : [...current, supplierId],
    );
  };

  const handleSelectAllSuppliers = () => {
    setSelectedSupplierIds(suppliers.map((sup) => sup.id));
  };

  const handleDeselectAllSuppliers = () => {
    setSelectedSupplierIds([]);
  };

  const handleRemoveItem = (id: string) => {
    setQuotationItems(prev => prev.filter(item => item.id !== id && item.productId !== id));
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    setQuotationItems(prev => prev.map(i => (i.id === id || i.productId === id) ? { ...i, requestedQuantity: qty } : i));
  };

  const handleApplyStockSuggestion = () => {
    setQuotationItems(prev => prev.map(item => {
      const stockIdeal = item.stockIdeal || 0;
      const stockCurrent = item.stockCurrent || 0;
      const suggestedQty = stockIdeal > stockCurrent ? stockIdeal - stockCurrent : item.requestedQuantity;
      return {
        ...item,
        requestedQuantity: suggestedQty > 0 ? suggestedQty : item.requestedQuantity,
      };
    }));
    alert('Sugestão de reposição aplicada com sucesso!');
  };

  const handleAddSelectedProducts = (selectedProductIds: string[]) => {
    const productsToAdd = catalogProducts.filter(p => selectedProductIds.includes(p.id));

    const newItems: QuotationItem[] = productsToAdd
      .filter(p => !quotationItems.some(existing => existing.productId === p.id))
      .map(p => {
        const stockCurrent = p.stockCurrent || 0;
        const stockIdeal = p.stockIdeal || 0;
        const autoQty = stockIdeal > stockCurrent ? stockIdeal - stockCurrent : 0;

        return {
          id: p.id,
          productId: p.id,
          description: p.description,
          brand: p.brand || null,
          ean: p.ean || null,
          imageUrl: p.imageUrl || null,
          stockCurrent,
          stockIdeal,
          requestedQuantity: autoQty,
        };
      });

    setQuotationItems(prev => [...prev, ...newItems]);
  };

  const handleQuickRegister = async (itemPendente: ItemPendente) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          description: itemPendente.descricaoPadronizada,
          code: itemPendente.ean || null,
          salePrice: itemPendente.precoVenda || 34.99,
          stockIdeal: 10,
          stockCurrent: 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar produto.');

      await loadProductsAndSuppliers();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!title.trim() || !paymentTerms.trim() || selectedSupplierIds.length === 0 || quotationItems.length === 0) {
      setError('Preencha todos os campos obrigatórios, selecione fornecedores e adicione itens.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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

      if (!response.ok) throw new Error('Não foi possível criar a cotação.');
      router.push('/cotacoes');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Erro ao criar cotação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 font-sans text-slate-800">
      <div className="mx-auto max-w-5xl space-y-6">
        <QuotationFormHeader onOpenModal={() => setIsCatalogModalOpen(true)} />

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

          <ProductImportModal 
            products={catalogProducts} 
            onQuickRegister={handleQuickRegister} 
            onImportComplete={(itensImportados) => {
              setQuotationItems((prev) => {
                const existingIds = new Set(prev.map(i => i.productId));
                const novos = itensImportados.filter(i => !existingIds.has(i.productId));
                return [...prev, ...novos];
              });
            }}
          />

          <QuotationSuggestionBar
            itemsCount={quotationItems.length}
            onApplySuggestion={handleApplyStockSuggestion}
          />

          <QuotationItemsTable
            items={quotationItems}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />

          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Distribuidores / Fornecedores Convidados</h2>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <button type="button" onClick={handleSelectAllSuppliers} className="text-indigo-600 hover:underline">Marcar todos</button>
                <span className="text-slate-300">|</span>
                <button type="button" onClick={handleDeselectAllSuppliers} className="text-slate-500 hover:underline">Desmarcar todos</button>
              </div>
            </div>

            <QuotationSuppliersSection
              suppliers={suppliers}
              selectedSupplierIds={selectedSupplierIds}
              onToggleSupplier={toggleSupplier}
              loading={loadingSuppliers}
            />
          </div>

          {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link href="/cotacoes" className="rounded-lg px-5 py-2.5 text-center text-sm font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-100">Cancelar</Link>
            <button type="submit" disabled={submitting || loadingSuppliers || suppliers.length === 0} className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50">
              {submitting ? 'Criando...' : 'Criar cotação'}
            </button>
          </div>
        </form>

        <ProductSelectionModal
          isOpen={isCatalogModalOpen}
          onClose={() => setIsCatalogModalOpen(false)}
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