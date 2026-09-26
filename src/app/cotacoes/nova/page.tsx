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
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';

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

export default function Page() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
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
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* HEADER GLOBAL UNIFICADO */}
      <AppHeader
        title="Economia Certa"
        subtitle="Painel gerencial inteligente e controle de compras em tempo real."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 -mt-12 pb-20 relative z-25 space-y-8">
        
        {/* Cartão Principal */}
        <div className={`rounded-3xl border p-8 shadow-2xl transition-all space-y-8 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900 shadow-slate-200/50'
        }`}>
          
          <QuotationFormHeader onOpenModal={() => setIsCatalogModalOpen(true)} />

          <form onSubmit={handleSubmit} className="space-y-8">
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

            <div className={`space-y-4 rounded-2xl border p-6 transition-all ${
              isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50/60 border-slate-200/80'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-500/10 pb-4">
                <h2 className="text-sm font-black uppercase tracking-wider">Distribuidores / Fornecedores Convidados</h2>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <button type="button" onClick={handleSelectAllSuppliers} className="text-emerald-600 dark:text-emerald-400 hover:underline">Marcar todos</button>
                  <span className="opacity-30">|</span>
                  <button type="button" onClick={handleDeselectAllSuppliers} className="opacity-75 hover:opacity-100 hover:underline">Desmarcar todos</button>
                </div>
              </div>

              <QuotationSuppliersSection
                suppliers={suppliers}
                selectedSupplierIds={selectedSupplierIds}
                onToggleSupplier={toggleSupplier}
                loading={loadingSuppliers}
              />
            </div>

            {error && <p role="alert" className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-xs font-bold text-rose-500">{error}</p>}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-500/10 pt-6 sm:flex-row sm:justify-end">
              <Link href="/cotacoes" className="rounded-2xl px-6 py-3 text-center text-xs font-bold transition-all border border-slate-500/20 hover:bg-slate-500/10">Cancelar</Link>
              <button type="submit" disabled={submitting || loadingSuppliers || suppliers.length === 0} className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-7 py-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer">
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

      {/* MENU DE COMANDOS */}
      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId="" />

    </div>
  );
}