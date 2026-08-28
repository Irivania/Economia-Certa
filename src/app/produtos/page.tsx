'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  internalCode?: string;
  description: string;
  brand?: string;
  category?: string;
  costPrice?: string;
  salePrice?: string;
  ncm?: string;
  cest?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de Filtros e Busca
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('');

  // Estado de Seleção de Produtos (IDs marcados)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Estados do Formulário e Edição
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
  const [submitting, setSubmitting] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, brandRes] = await Promise.all([
        fetch(`/api/products?companyId=${companyId}`),
        fetch(`/api/categories?companyId=${companyId}`),
        fetch(`/api/brands?companyId=${companyId}`)
      ]);

      if (!prodRes.ok) throw new Error('Erro ao carregar produtos');
      
      const prodData = await prodRes.json();
      const catData = catRes.ok ? await catRes.json() : [];
      const brandData = brandRes.ok ? await brandRes.json() : [];

      setProducts(prodData);
      setCategories(catData);
      setBrands(brandData);
    } catch (err) {
      setError('Não foi possível carregar os dados.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchInitial() {
      try {
        const [prodRes, catRes, brandRes] = await Promise.all([
          fetch(`/api/products?companyId=${companyId}`),
          fetch(`/api/categories?companyId=${companyId}`),
          fetch(`/api/brands?companyId=${companyId}`)
        ]);

        const prodData = prodRes.ok ? await prodRes.json() : [];
        const catData = catRes.ok ? await catRes.json() : [];
        const brandData = brandRes.ok ? await brandRes.json() : [];

        if (isMounted) {
          setProducts(prodData);
          setCategories(catData);
          setBrands(brandData);
        }
      } catch {
        if (isMounted) setError('Erro ao carregar dados.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchInitial();
    return () => { isMounted = false; };
  }, [companyId]);

  // Filtragem inteligente de produtos (Busca, Categoria e Marca)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = 
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.internalCode && p.internalCode.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategoryFilter === '' || p.category === selectedCategoryFilter;
      const matchesBrand = selectedBrandFilter === '' || p.brand === selectedBrandFilter;

      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [products, searchTerm, selectedCategoryFilter, selectedBrandFilter]);

  // Manipulação de Seleção Individual
  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Selecionar / Deselecionar todos os visíveis
  const toggleSelectAllVisible = () => {
    const visibleIds = filteredProducts.map((p) => p.id);
    const allVisibleSelected = visibleIds.every((id) => selectedProductIds.includes(id));

    if (allVisibleSelected) {
      setSelectedProductIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...selectedProductIds, ...visibleIds]));
      setSelectedProductIds(merged);
    }
  };

  // Gerar Relatório / Lista de Itens Selecionados para Envio
  const handleGenerateReport = () => {
    if (selectedProductIds.length === 0) {
      alert('Selecione ao menos um produto na tabela.');
      return;
    }

    const selectedItems = products.filter((p) => selectedProductIds.includes(p.id));
    
    let reportText = `📋 LISTA DE ITENS PARA COTAÇÃO / PEDIDO\n`;
    reportText += `Melo Perfumaria - Data: ${new Date().toLocaleDateString()}\n`;
    reportText += `----------------------------------------\n\n`;

    selectedItems.forEach((item, index) => {
      reportText += `${index + 1}. [Código: ${item.internalCode || 'N/D'}] ${item.description}\n`;
      reportText += `   Marca: ${item.brand || 'N/D'} | Categoria: ${item.category || 'N/D'}\n\n`;
    });

    navigator.clipboard.writeText(reportText);
    showToast('Lista copiada para a área de transferência com sucesso!');
  };

  // Funções de Cálculo de Margem Bidirecional
  const handleMarginChange = (marginVal: string) => {
    setMarginPercent(marginVal);
    const cost = parseFloat(costPrice);
    const margin = parseFloat(marginVal);

    if (!isNaN(cost) && !isNaN(margin)) {
      const calculatedSale = cost + (cost * (margin / 100));
      setSalePrice(calculatedSale.toFixed(2));
    }
  };

  const handleCostChange = (costVal: string) => {
    setCostPrice(costVal);
    const cost = parseFloat(costVal);
    const margin = parseFloat(marginPercent);

    if (!isNaN(cost) && !isNaN(margin)) {
      const calculatedSale = cost + (cost * (margin / 100));
      setSalePrice(calculatedSale.toFixed(2));
    }
  };

  const handleSalePriceChange = (saleVal: string) => {
    setSalePrice(saleVal);
    const cost = parseFloat(costPrice);
    const sale = parseFloat(saleVal);

    if (!isNaN(cost) && !isNaN(sale) && cost > 0) {
      const calculatedMargin = ((sale - cost) / cost) * 100;
      setMarginPercent(calculatedMargin.toFixed(2));
    }
  };

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
        id: editingId,
        companyId,
        code,
        description,
        brand,
        category,
        costPrice: costPrice || '0',
        salePrice: salePrice || '0',
        ncm,
        cest,
        origin: '0',
        unit: 'UN',
        boxQuantity: 1
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) throw new Error('Erro ao salvar produto');

      resetForm();
      showToast(editingId ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
      loadData();
    } catch (err) {
      console.error(err);
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
    setMarginPercent('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este produto?')) return;

    try {
      const res = await fetch(`/api/products?id=${id}&companyId=${companyId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao excluir produto');

      showToast('Produto removido com sucesso!');
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir produto.');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setCode('');
    setDescription('');
    setBrand('');
    setCategory('');
    setCostPrice('');
    setMarginPercent('');
    setSalePrice('');
    setNcm('');
    setCest('');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">📦 Gestão de Produtos (Loja)</h1>
            <p className="text-slate-600 text-xs sm:text-sm">Melo Perfumaria - Busca avançada, filtros por categoria/marca e seleção para relatório.</p>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/categorias" className="text-xs font-semibold text-blue-600 hover:underline">🏷️ Categorias</Link>
            <Link href="/marcas" className="text-xs font-semibold text-blue-600 hover:underline">🏢 Marcas</Link>
            <Link href="/" className="text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-semibold">&larr; Dashboard</Link>
            <Link href="/cotacoes" className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-semibold">Cotações &rarr;</Link>
          </div>
        </div>

        {/* Formulário de Cadastro / Edição */}
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 mb-10">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-slate-800">
              {editingId ? '✏️ Editar Produto' : '➕ Cadastro Manual de Produto'}
            </h2>
            {editingId && (
              <button 
                type="button" 
                onClick={resetForm} 
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Cancelar Edição
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Código / EAN"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700"
              >
                <option value="">Selecione a Categoria...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <input
              type="text"
              placeholder="Descrição do Produto (Ex: Perfume Femme 100ml)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700"
              >
                <option value="">Selecione a Marca...</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="NCM (Obrigatório Fiscal)"
                value={ncm}
                onChange={(e) => setNcm(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="CEST"
                value={cest}
                onChange={(e) => setCest(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Preço Custo R$"
                value={costPrice}
                onChange={(e) => handleCostChange(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Margem Lucro %"
                value={marginPercent}
                onChange={(e) => handleMarginChange(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Preço Venda R$"
                value={salePrice}
                onChange={(e) => handleSalePriceChange(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 font-semibold text-emerald-700"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full text-white text-xs font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 mt-2 ${
                editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {submitting ? 'Salvando...' : editingId ? 'Atualizar Produto' : 'Salvar Produto'}
            </button>
          </form>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-1/3">
            <input
              type="text"
              placeholder="🔍 Pesquisar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800"
            />
          </div>

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

        {/* Tabela de Produtos */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-slate-800">
              Catálogo Filtrado ({filteredProducts.length} de {products.length})
            </h2>
            {selectedProductIds.length > 0 && (
              <span className="text-xs text-emerald-600 font-semibold">
                ✓ {selectedProductIds.length} produto(s) marcado(s) para envio
              </span>
            )}
          </div>
          
          {loading ? (
            <p className="text-slate-500 text-center py-8 text-xs">Carregando catálogo...</p>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-md text-xs">{error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg">
              <p className="text-slate-400 text-xs">Nenhum produto encontrado com os filtros aplicados.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        onChange={toggleSelectAllVisible}
                        checked={
                          filteredProducts.length > 0 &&
                          filteredProducts.every((p) => selectedProductIds.includes(p.id))
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="p-3 font-semibold">Código</th>
                    <th className="p-3 font-semibold">Descrição</th>
                    <th className="p-3 font-semibold">Marca</th>
                    <th className="p-3 font-semibold">Categoria</th>
                    <th className="p-3 font-semibold">NCM / CEST</th>
                    <th className="p-3 font-semibold text-right">Custo R$</th>
                    <th className="p-3 font-semibold text-right">Venda R$</th>
                    <th className="p-3 font-semibold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    return (
                      <tr 
                        key={p.id} 
                        className={`border-b border-slate-100 transition-colors ${isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectProduct(p.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-3 text-slate-600 font-mono">{p.internalCode || '-'}</td>
                        <td className="p-3 font-medium text-slate-800">{p.description}</td>
                        <td className="p-3 text-slate-600">{p.brand || '-'}</td>
                        <td className="p-3 text-slate-600">{p.category || '-'}</td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">
                          {p.ncm ? `NCM: ${p.ncm}` : ''} 
                          {p.cest ? ` | CEST: ${p.cest}` : ''}
                          {!p.ncm && !p.cest ? '-' : ''}
                        </td>
                        <td className="p-3 text-right text-slate-700">R$ {Number(p.costPrice || 0).toFixed(2)}</td>
                        <td className="p-3 text-right font-semibold text-emerald-600">R$ {Number(p.salePrice || 0).toFixed(2)}</td>
                        <td className="p-3 text-center space-x-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="text-blue-600 hover:underline font-semibold"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="text-rose-600 hover:underline font-semibold"
                          >
                            Excluir
                          </button>
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

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 px-5 py-3 bg-emerald-600 text-white rounded-lg shadow-lg text-xs sm:text-sm font-semibold transition-all z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}