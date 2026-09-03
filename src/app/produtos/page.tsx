'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
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
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de Filtro e Busca
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  // Estados do formulário de Cadastro / Edição
  const [editingId, setEditingId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [ean, setEan] = useState('');
  const [brand, setBrand] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [unit, setUnit] = useState('UN');
  const [boxQuantity, setBoxQuantity] = useState(1);
  const [costPrice, setCostPrice] = useState('');
  const [lastPurchasePrice, setLastPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stockCurrent, setStockCurrent] = useState(0);
  const [stockMin, setStockMin] = useState(0);
  const [stockIdeal, setStockIdeal] = useState(0);
  const [stockMax, setStockMax] = useState(0);
  const [ncm, setNcm] = useState('');
  const [cest, setCest] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';

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
        imageUrl,
        unit,
        boxQuantity,
        costPrice: costPrice || null,
        lastPurchasePrice: lastPurchasePrice || null,
        salePrice: salePrice || null,
        stockCurrent,
        stockMin,
        stockIdeal,
        stockMax,
        ncm,
        cest,
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
    setStockCurrent(prod.stockCurrent ?? 0);
    setStockMin(prod.stockMin ?? 0);
    setStockIdeal(prod.stockIdeal ?? 0);
    setStockMax(prod.stockMax ?? 0);
    setNcm(prod.ncm || '');
    setCest(prod.cest || '');
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
    setStockCurrent(0);
    setStockMin(0);
    setStockIdeal(0);
    setStockMax(0);
    setNcm('');
    setCest('');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-800">📦 Catálogo e Gestão de Produtos</h1>
            <p className="text-xs text-slate-500">Melo Perfumaria — Gestão de Itens, Imagens, Custos, Estoque e Tributos.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="text-xs font-semibold text-slate-600 hover:underline">
              &larr; Dashboard
            </Link>
            <Link href="/cotacoes" className="text-xs font-semibold text-blue-600 hover:underline">
              Ir para Cotações &rarr;
            </Link>
          </div>
        </div>

        {/* Formulário Modularizado */}
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
          boxQuantity={boxQuantity}
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
        />

        {/* Tabela Modularizada */}
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

      {toastMessage && (
        <div className="fixed bottom-5 right-5 px-5 py-3 bg-emerald-600 text-white rounded-lg shadow-lg text-sm font-semibold transition-all z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}