'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ProductForm } from '@/components/ProductForm';
import { ProductImportModal, ItemPendente } from '@/components/ProductImportModal';
import { ProductTable } from '@/components/ProductTable';
import { getCestByNcm } from '@/utils/fiscal';

export interface Product {
  id: string;
  internalCode?: string;
  description: string;
  brand?: string;
  category?: string;
  costPrice?: string;
  salePrice?: string;
  ncm?: string;
  cest?: string;
  imageUrl?: string;
  stockCurrent?: number;
  stockMin?: number;
  stockIdeal?: number;
  stockMax?: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface Brand {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);

  // Formulário & Estoque
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [marginPercent, setMarginPercent] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [ncm, setNcm] = useState('');
  const [cest, setCest] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stockCurrent, setStockCurrent] = useState('');
  const [stockMin, setStockMin] = useState('');
  const [stockIdeal, setStockIdeal] = useState('');
  const [stockMax, setStockMax] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, brandRes] = await Promise.all([
        fetch(`/api/products?companyId=${companyId}`),
        fetch(`/api/categories?companyId=${companyId}`),
        fetch(`/api/brands?companyId=${companyId}`)
      ]);

      if (!prodRes.ok) throw new Error('Erro ao carregar produtos');
      setProducts(prodRes.ok ? await prodRes.json() : []);
      if (catRes.ok) setCategories(await catRes.json());
      if (brandRes.ok) setBrands(await brandRes.json());
    } catch {
      setError('Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        const [prodRes, catRes, brandRes] = await Promise.all([
          fetch(`/api/products?companyId=${companyId}`),
          fetch(`/api/categories?companyId=${companyId}`),
          fetch(`/api/brands?companyId=${companyId}`)
        ]);

        if (isMounted) {
          setProducts(prodRes.ok ? await prodRes.json() : []);
          setCategories(catRes.ok ? await catRes.json() : []);
          setBrands(brandRes.ok ? await brandRes.json() : []);
        }
      } catch {
        if (isMounted) setError('Não foi possível carregar os dados.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [companyId, loadData]);

  // Cálculos fiscais e margem
  const handleNcmChange = (val: string) => {
    setNcm(val);
    const suggestedCest = getCestByNcm(val);
    if (suggestedCest) {
      setCest(suggestedCest);
      showToast(`CEST ${suggestedCest} preenchido automaticamente via NCM!`);
    }
  };

  const handleMarginChange = (marginVal: string) => {
    setMarginPercent(marginVal);
    const cost = parseFloat(costPrice);
    const margin = parseFloat(marginVal);
    if (!isNaN(cost) && !isNaN(margin)) {
      setSalePrice((cost + (cost * (margin / 100))).toFixed(2));
    }
  };

  const handleCostChange = (costVal: string) => {
    setCostPrice(costVal);
    const cost = parseFloat(costVal);
    const margin = parseFloat(marginPercent);
    if (!isNaN(cost) && !isNaN(margin)) {
      setSalePrice((cost + (cost * (margin / 100))).toFixed(2));
    }
  };

  const handleSalePriceChange = (saleVal: string) => {
    setSalePrice(saleVal);
    const cost = parseFloat(costPrice);
    const sale = parseFloat(saleVal);
    if (!isNaN(cost) && !isNaN(sale) && cost > 0) {
      setMarginPercent((((sale - cost) / cost) * 100).toFixed(2));
    }
  };

  // Filtragem e Ordenação Alfabética Automática
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch = 
          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.internalCode && p.internalCode.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategoryFilter === '' || p.category === selectedCategoryFilter;
        const matchesBrand = selectedBrandFilter === '' || p.brand === selectedBrandFilter;
        return matchesSearch && matchesCategory && matchesBrand;
      })
      .sort((a, b) => a.description.localeCompare(b.description, 'pt-BR', { sensitivity: 'accent' }));
  }, [products, searchTerm, selectedCategoryFilter, selectedBrandFilter]);

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = filteredProducts.map((p) => p.id);
    const allSelected = visibleIds.every((id) => selectedProductIds.includes(id));
    if (allSelected) {
      setSelectedProductIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedProductIds(Array.from(new Set([...selectedProductIds, ...visibleIds])));
    }
  };

  const handleGenerateReport = () => {
    if (selectedProductIds.length === 0) {
      alert('Selecione ao menos um produto.');
      return;
    }
    const selectedItems = products.filter((p) => selectedProductIds.includes(p.id));
    let reportText = `📋 LISTA DE ITENS PARA COTAÇÃO\nMelo Perfumaria\n\n`;
    selectedItems.forEach((item, index) => {
      reportText += `${index + 1}. [${item.internalCode || 'N/D'}] ${item.description} | Marca: ${item.brand || '-'}\n`;
    });
    navigator.clipboard.writeText(reportText);
    showToast('Lista copiada para a área de transferência!');
  };

  const handleQuickRegisterFromImport = async (itemPendente: ItemPendente) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId,
        code: itemPendente.codigoExterno || '',
        description: itemPendente.descricaoPadronizada,
        brand: '',
        category: '',
        costPrice: '0',
        salePrice: '0',
        ncm: '',
        cest: '',
        origin: '0',
        unit: 'UN',
        boxQuantity: 1,
        imageUrl: '',
        stockCurrent: 0,
        stockMin: 0,
        stockIdeal: 0,
        stockMax: 0
      }),
    });
    if (!res.ok) throw new Error('Erro ao cadastrar');
    showToast('Produto cadastrado e padronizado com sucesso!');
    await loadData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('A descrição é obrigatória.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/products', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          companyId,
          code,
          description: description.trim().toUpperCase(),
          brand,
          category,
          costPrice: costPrice || '0',
          salePrice: salePrice || '0',
          ncm,
          cest,
          origin: '0',
          unit: 'UN',
          boxQuantity: 1,
          imageUrl: imageUrl.trim() || '',
          stockCurrent: parseInt(stockCurrent) || 0,
          stockMin: parseInt(stockMin) || 0,
          stockIdeal: parseInt(stockIdeal) || 0,
          stockMax: parseInt(stockMax) || 0
        }),
      });

      if (!res.ok) throw new Error('Erro ao salvar');
      resetForm();
      showToast(editingId ? 'Produto e estoque atualizados!' : 'Produto cadastrado com sucesso!');
      loadData();
    } catch {
      alert('Erro ao salvar produto.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setCode(p.internalCode || '');
    setDescription(p.description);
    setBrand(p.brand || '');
    setCategory(p.category || '');
    setCostPrice(p.costPrice || '');
    setSalePrice(p.salePrice || '');
    setNcm(p.ncm || '');
    setCest(p.cest || '');
    setImageUrl(p.imageUrl || '');
    setStockCurrent(p.stockCurrent !== undefined ? String(p.stockCurrent) : '');
    setStockMin(p.stockMin !== undefined ? String(p.stockMin) : '');
    setStockIdeal(p.stockIdeal !== undefined ? String(p.stockIdeal) : '');
    setStockMax(p.stockMax !== undefined ? String(p.stockMax) : '');
    setMarginPercent('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este produto?')) return;
    try {
      const res = await fetch(`/api/products?id=${id}&companyId=${companyId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir');
      showToast('Produto excluído com sucesso!');
      loadData();
    } catch {
      alert('Erro ao excluir.');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setCode(''); setDescription(''); setBrand(''); setCategory('');
    setCostPrice(''); setMarginPercent(''); setSalePrice(''); setNcm(''); setCest(''); setImageUrl('');
    setStockCurrent(''); setStockMin(''); setStockIdeal(''); setStockMax('');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">📦 Gestão de Produtos, Estoque & Conciliação</h1>
            <p className="text-slate-600 text-xs sm:text-sm">Melo Perfumaria - Organizado e Modular.</p>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setShowImportModal(!showImportModal)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              📥 Importar Lista Externa
            </button>
            <Link href="/categorias" className="text-xs font-semibold text-blue-600 hover:underline">🏷️ Categorias</Link>
            <Link href="/marcas" className="text-xs font-semibold text-blue-600 hover:underline">🏢 Marcas</Link>
            <Link href="/" className="text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-semibold">&larr; Dashboard</Link>
          </div>
        </div>

        {showImportModal && (
          <ProductImportModal products={products} onQuickRegister={handleQuickRegisterFromImport} />
        )}

        <ProductForm
          editingId={editingId}
          code={code} setCode={setCode}
          description={description} setDescription={setDescription}
          brand={brand} setBrand={setBrand}
          category={category} setCategory={setCategory}
          costPrice={costPrice} handleCostChange={handleCostChange}
          marginPercent={marginPercent} handleMarginChange={handleMarginChange}
          salePrice={salePrice} handleSalePriceChange={handleSalePriceChange}
          ncm={ncm} handleNcmChange={handleNcmChange}
          cest={cest} setCest={setCest}
          imageUrl={imageUrl} setImageUrl={setImageUrl}
          stockCurrent={stockCurrent} setStockCurrent={setStockCurrent}
          stockMin={stockMin} setStockMin={setStockMin}
          stockIdeal={stockIdeal} setStockIdeal={setStockIdeal}
          stockMax={stockMax} setStockMax={setStockMax}
          submitting={submitting}
          categories={categories}
          brands={brands}
          onSubmit={handleSubmit}
          onCancelEdit={resetForm}
        />

        <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <input
            type="text"
            placeholder="🔍 Pesquisar por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/3 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 uppercase"
          />
          <div className="w-full sm:w-2/3 flex flex-col sm:flex-row gap-3">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700"
            >
              <option value="">Todas as Categorias</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700"
            >
              <option value="">Todas as Marcas</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
            {selectedProductIds.length > 0 && (
              <button
                onClick={handleGenerateReport}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors whitespace-nowrap"
              >
                📋 Gerar Relatório ({selectedProductIds.length})
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-slate-800">Catálogo Alfabético Ordenado ({filteredProducts.length})</h2>
          </div>
          <ProductTable
            products={filteredProducts}
            selectedProductIds={selectedProductIds}
            onToggleSelect={toggleSelectProduct}
            onToggleSelectAll={toggleSelectAllVisible}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
            error={error}
          />
        </div>

      </div>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 px-5 py-3 bg-emerald-600 text-white rounded-lg shadow-lg text-xs sm:text-sm font-semibold transition-all z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}