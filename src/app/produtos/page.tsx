'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';
import { ProductForm } from '@/components/ProductForm';
import { ProductTable } from '@/components/ProductTable';
import { getCompanyId } from '@/lib/companySession';
import { apiFetch } from '@/lib/apiClient';

interface Product {
  id: string;
  description: string;
  ean?: string | null;
  brand?: string | null;
  imageUrl?: string | null;
  unit: string;
  boxQuantity: number;
  costPrice?: string | null;
  lastPurchasePrice?: string | null;
  salePrice?: string | null;
  stockCurrent: number;
  stockMin: number;
  stockIdeal: number;
  stockMax: number;
  ncm?: string | null;
  cest?: string | null;
  classTrib?: string | null;
  anvisaRegistry?: string | null;
  manufacturerName?: string | null;
  weight?: string | null;
  dimensions?: string | null;
}

function ProductsContent() {
  const router = useRouter();
  const { isDarkMode, mounted } = useTheme();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const [formMode, setFormMode] = useState<'minimal' | 'complete'>('minimal');
  const [isFromImport] = useState(() => !!searchParams.get('description'));

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [description, setDescription] = useState(() => searchParams.get('description') || '');
  const [ean, setEan] = useState(() => searchParams.get('ean') || '');
  const [brand, setBrand] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [unit, setUnit] = useState('UN');
  const [boxQuantity, setBoxQuantity] = useState<number | ''>(1);
  const [costPrice, setCostPrice] = useState('');
  const [lastPurchasePrice, setLastPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState(() => searchParams.get('salePrice') || '');
  
  const [stockCurrent, setStockCurrent] = useState<number | ''>(() => {
    const stock = searchParams.get('stockCurrent');
    return stock ? Number(stock) : '';
  });
  const [stockMin, setStockMin] = useState<number | ''>('');
  const [stockIdeal, setStockIdeal] = useState<number | ''>(() => {
    const stock = searchParams.get('stockIdeal');
    return stock ? Number(stock) : '';
  });
  const [stockMax, setStockMax] = useState<number | ''>('');

  const [ncm, setNcm] = useState('');
  const [cest, setCest] = useState('');
  const [classTrib, setClassTrib] = useState('');

  const [anvisaRegistry, setAnvisaRegistry] = useState('');
  const [manufacturerName, setManufacturerName] = useState('');
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const companyId = getCompanyId();
  const latestQuotationId = '';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshProducts = useCallback(async () => {
    try {
      const res = await apiFetch('/api/products');
      if (!res.ok) throw new Error('Erro ao carregar produtos.');
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setProducts(data);
        const uniqueBrands = Array.from(
          new Set(data.map((p: Product) => p.brand).filter(Boolean))
        ) as string[];
        setBrands(uniqueBrands);
      }
      setError(null);
    } catch (err) {
      setError('Não foi possível buscar os produtos.');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const res = await apiFetch('/api/products');
        if (!res.ok) throw new Error('Erro ao carregar produtos.');
        const data = await res.json();
        
        if (isMounted && Array.isArray(data)) {
          setProducts(data);
          const uniqueBrands = Array.from(
            new Set(data.map((p: Product) => p.brand).filter(Boolean))
          ) as string[];
          setBrands(uniqueBrands);
        }
      } catch (err) {
        if (isMounted) {
          setError('Não foi possível buscar os produtos.');
        }
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('A descrição do produto é obrigatória.');
      return;
    }

    try {
      setSubmitting(true);
      const url = '/api/products';
      const method = editingId ? 'PUT' : 'POST';
      
      const bodyData = {
        id: editingId || undefined,
        companyId,
        code: ean,
        description,
        brand,
        imageUrl: formMode === 'complete' ? imageUrl : null,
        unit: formMode === 'complete' ? unit : 'UN',
        boxQuantity: formMode === 'complete' && boxQuantity !== '' ? Number(boxQuantity) : 1,
        costPrice: formMode === 'complete' && costPrice ? costPrice.replace(/\./g, '').replace(',', '.') : null,
        lastPurchasePrice: formMode === 'complete' && lastPurchasePrice ? lastPurchasePrice.replace(/\./g, '').replace(',', '.') : null,
        salePrice: salePrice ? salePrice.replace(/\./g, '').replace(',', '.') : null,
        stockCurrent: stockCurrent === '' || stockCurrent === undefined ? 0 : Number(stockCurrent),
        stockMin: formMode === 'complete' && stockMin !== '' ? Number(stockMin) : 0,
        stockIdeal: formMode === 'complete' && stockIdeal !== '' ? Number(stockIdeal) : 0,
        stockMax: formMode === 'complete' && stockMax !== '' ? Number(stockMax) : 0,
        ncm: formMode === 'complete' ? ncm : null,
        cest: formMode === 'complete' ? cest : null,
        classTrib: formMode === 'complete' ? classTrib : null,
        anvisaRegistry: formMode === 'complete' ? anvisaRegistry : null,
        manufacturerName: formMode === 'complete' ? manufacturerName : null,
        weight: formMode === 'complete' ? weight : null,
        dimensions: formMode === 'complete' ? dimensions : null,
      };

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao salvar produto.');
      }

      resetForm();
      showToast(editingId ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
      await refreshProducts();

      // Redirecionar automaticamente de volta para a nota manual ou cotação se o parâmetro returnTo existir
      if (returnTo && !editingId) {
        setTimeout(() => {
          router.push(returnTo);
        }, 1200);
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Erro ao salvar produto.';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (prod: Product) => {
    setEditingId(prod.id);
    setDescription(prod.description || '');
    setEan(prod.ean || '');
    setBrand(prod.brand || '');
    setImageUrl(prod.imageUrl || '');
    setUnit(prod.unit || 'UN');
    setBoxQuantity(prod.boxQuantity ?? 1);
    setCostPrice(prod.costPrice || '');
    setLastPurchasePrice(prod.lastPurchasePrice || '');
    setSalePrice(prod.salePrice || '');
    setStockCurrent(prod.stockCurrent ?? '');
    setStockMin(prod.stockMin ?? '');
    setStockIdeal(prod.stockIdeal ?? '');
    setStockMax(prod.stockMax ?? '');
    setNcm(prod.ncm || '');
    setCest(prod.cest || '');
    setClassTrib(prod.classTrib || '');
    setAnvisaRegistry(prod.anvisaRegistry || '');
    setManufacturerName(prod.manufacturerName || '');
    setWeight(prod.weight || '');
    setDimensions(prod.dimensions || '');
    setFormMode('complete');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este produto?')) return;

    try {
      const res = await apiFetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao excluir produto.');

      showToast('Produto excluído com sucesso!');
      await refreshProducts();
    } catch (err) {
      console.error(err);
      alert('Não foi possível excluir o produto.');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setDescription('');
    setEan('');
    setBrand('');
    setImageUrl('');
    setUnit('UN');
    setBoxQuantity(1);
    setCostPrice('');
    setLastPurchasePrice('');
    setSalePrice('');
    setStockCurrent('');
    setStockMin('');
    setStockIdeal('');
    setStockMax('');
    setNcm('');
    setCest('');
    setClassTrib('');
    setAnvisaRegistry('');
    setManufacturerName('');
    setWeight('');
    setDimensions('');
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <AppHeader
        title="Catálogo & Gestão de Produtos"
        subtitle="Controle de itens, custos, estoque, tributos, ANVISA e logística."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20 relative z-20 space-y-6">
        
        {returnTo && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-lg flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-400">
              ⚡ Você foi redirecionado para cadastrar um produto em falta. Conclua o cadastro abaixo e será retornado automaticamente!
            </span>
            <Link
              href={returnTo}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition shadow-xs"
            >
              &larr; Voltar de onde veio
            </Link>
          </div>
        )}

        <div className={`p-6 sm:p-7 rounded-xl shadow-xs border space-y-5 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/90'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                {editingId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Selecione o modo de preenchimento ideal para a sua operação.</p>
            </div>

            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setFormMode('minimal')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  formMode === 'minimal'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ⚡ Rápido
              </button>
              <button
                type="button"
                onClick={() => setFormMode('complete')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  formMode === 'complete'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                📋 Completo (Fiscal, Custos, ANVISA & Logística)
              </button>
            </div>
          </div>

          <ProductForm
            editingId={editingId}
            description={description}
            setDescription={setDescription}
            ean={ean}
            setEan={setEan}
            brand={brand}
            setBrand={setBrand}
            brandsList={brands}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            unit={unit}
            setUnit={setUnit}
            boxQuantity={boxQuantity === '' ? 1 : boxQuantity}
            setBoxQuantity={setBoxQuantity}
            costPrice={costPrice}
            setCostPrice={setCostPrice}
            lastPurchasePrice={lastPurchasePrice}
            setLastPurchasePrice={setLastPurchasePrice}
            salePrice={salePrice}
            setSalePrice={setSalePrice}
            stockCurrent={stockCurrent}
            setStockCurrent={setStockCurrent}
            stockMin={stockMin}
            setStockMin={setStockMin}
            stockIdeal={stockIdeal}
            setStockIdeal={setStockIdeal}
            stockMax={stockMax}
            setStockMax={setStockMax}
            ncm={ncm}
            setNcm={setNcm}
            cest={cest}
            setCest={setCest}
            classTrib={classTrib}
            setClassTrib={setClassTrib}
            anvisaRegistry={anvisaRegistry}
            setAnvisaRegistry={setAnvisaRegistry}
            manufacturerName={manufacturerName}
            setManufacturerName={setManufacturerName}
            weight={weight}
            setWeight={setWeight}
            dimensions={dimensions}
            setDimensions={setDimensions}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancelEdit={resetForm}
            isFromImport={isFromImport}
            formMode={formMode}
          />
        </div>

        <div className={`p-6 sm:p-7 rounded-xl shadow-xs border space-y-5 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/90'}`}>
          <ProductTable
            products={products}
            brands={brands}
            loading={loading}
            error={error}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

      </main>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 px-4 py-2.5 bg-emerald-600 text-white rounded-lg shadow-xl text-xs font-semibold transition-all z-50">
          {toastMessage}
        </div>
      )}

      <CommandMenu 
        isOpen={isCmdOpen} 
        onClose={() => setIsCmdOpen(false)} 
        isDarkMode={isDarkMode} 
        latestQuotationId={latestQuotationId} 
      />

    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-500">A carregar catálogo...</div>}>
      <ProductsContent />
    </Suspense>
  );
}