'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';
import { ProductForm } from '@/components/ProductForm';
import { ProductTable } from '@/components/ProductTable';

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
}

export default function ProductsPage() {
  const { isDarkMode, mounted } = useTheme();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  // Modo de Cadastro: 'minimal' (Rápido) ou 'complete' (Fiscal & Custos)
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

  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';
  const latestQuotationId = 'd7f46ae7-19c2-409d-8ab4-dfbb458c5248';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch(`/api/products?companyId=${companyId}`);
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
  }, [companyId]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const res = await fetch(`/api/products?companyId=${companyId}`);
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
  }, [companyId]);

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
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao salvar produto.');
      }

      resetForm();
      showToast(editingId ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
      await refreshProducts();
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
    setFormMode('complete'); // Abre automaticamente no modo completo ao editar
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este produto?')) return;

    try {
      const res = await fetch(`/api/products?id=${id}&companyId=${companyId}`, {
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
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Cabeçalho Global Unificado */}
      <AppHeader
        title="Catálogo & Gestão de Produtos"
        subtitle="Melo Perfumaria — Controle de itens, custos, estoque e tributos."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-6 sm:px-12 -mt-12 pb-20 relative z-20 space-y-8">
        
        {returnTo && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400">
              ⚡ Você veio da criação de uma cotação. Cadastre o item e retorne para continuar!
            </span>
            <Link
              href={returnTo}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-md"
            >
              &larr; Voltar para Nova Cotação
            </Link>
          </div>
        )}

        {/* Seletor de Modo de Cadastro (Abas Sênior) */}
        <div className={`p-8 rounded-3xl shadow-2xl border space-y-6 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/80'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5 border-slate-500/10">
            <div>
              <h2 className="text-base font-black tracking-tight">
                {editingId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h2>
              <p className="text-xs opacity-60 mt-0.5">Selecione o modo de preenchimento ideal para a sua operação.</p>
            </div>

            {/* Alternador de Abas */}
            <div className="flex items-center p-1 bg-slate-500/10 rounded-2xl border border-slate-500/20">
              <button
                type="button"
                onClick={() => setFormMode('minimal')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  formMode === 'minimal'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                ⚡ Cadastro Rápido (Mínimo)
              </button>
              <button
                type="button"
                onClick={() => setFormMode('complete')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  formMode === 'complete'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                📋 Cadastro Completo (Fiscal & Custos)
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
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancelEdit={resetForm}
            isFromImport={isFromImport}
            formMode={formMode}
          />
        </div>

        <div className={`p-8 rounded-3xl shadow-2xl border space-y-6 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/80'}`}>
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
        <div className="fixed bottom-5 right-5 px-5 py-3 bg-emerald-600 text-white rounded-2xl shadow-2xl text-xs font-bold transition-all z-50">
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