'use client';

import React from 'react';

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface ProductFormProps {
  editingId: string | null;
  code: string;
  setCode: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  brand: string;
  setBrand: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  costPrice: string;
  handleCostChange: (val: string) => void;
  marginPercent: string;
  handleMarginChange: (val: string) => void;
  salePrice: string;
  handleSalePriceChange: (val: string) => void;
  ncm: string;
  handleNcmChange: (val: string) => void;
  cest: string;
  setCest: (val: string) => void;
  imageUrl: string;
  setImageUrl: (val: string) => void;
  stockCurrent: string;
  setStockCurrent: (val: string) => void;
  stockMin: string;
  setStockMin: (val: string) => void;
  stockIdeal: string;
  setStockIdeal: (val: string) => void;
  stockMax: string;
  setStockMax: (val: string) => void;
  submitting: boolean;
  categories: Category[];
  brands: Brand[];
  onSubmit: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
}

export function ProductForm({
  editingId,
  code, setCode,
  description, setDescription,
  brand, setBrand,
  category, setCategory,
  costPrice, handleCostChange,
  marginPercent, handleMarginChange,
  salePrice, handleSalePriceChange,
  ncm, handleNcmChange,
  cest, setCest,
  imageUrl, setImageUrl,
  stockCurrent, setStockCurrent,
  stockMin, setStockMin,
  stockIdeal, setStockIdeal,
  stockMax, setStockMax,
  submitting,
  categories, brands,
  onSubmit, onCancelEdit
}: ProductFormProps) {
  return (
    <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 mb-10">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-bold text-slate-800">
          {editingId ? '✏️ Editar Produto & Estoque' : '➕ Cadastro Manual de Produto'}
        </h2>
        {editingId && (
          <button 
            type="button" 
            onClick={onCancelEdit} 
            className="text-xs text-rose-600 hover:underline font-semibold"
          >
            Cancelar Edição
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        
        {/* Campo de URL da Imagem com Preview Visual */}
        <div className="flex gap-4 items-center bg-white p-3 rounded-lg border border-slate-300">
          <div className="w-12 h-12 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="w-full h-full object-cover" 
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} 
              />
            ) : (
              <span className="text-lg">📷</span>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">URL da Imagem do Produto</label>
            <input
              type="url"
              placeholder="https://exemplo.com/foto-produto.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-800"
            />
          </div>
        </div>

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
            {categories.map((cat, index) => (
              <option key={cat.id ? `${cat.id}-${index}` : index} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder="Descrição do Produto (Ex: Perfume Femme 100ml)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 uppercase"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            <option value="">Selecione a Marca...</option>
            {brands.map((b, index) => (
              <option key={b.id ? `${b.id}-${index}` : index} value={b.name}>{b.name}</option>
            ))}
          </select>
          <div className="relative">
            <input
              type="text"
              placeholder="NCM (8 dígitos)"
              value={ncm}
              onChange={(e) => handleNcmChange(e.target.value)}
              maxLength={10}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 font-mono"
            />
            <span className="absolute right-2 top-2 text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
              ⚡ Auto-CEST
            </span>
          </div>
        </div>

        {/* Preços e Margens */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="CEST"
            value={cest}
            onChange={(e) => setCest(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 font-mono"
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

        {/* Parâmetros de Estoque: Atual, Mínimo, Ideal, Máximo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">📦 ESTOQUE ATUAL</label>
            <input
              type="number"
              placeholder="0"
              value={stockCurrent}
              onChange={(e) => setStockCurrent(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 font-semibold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-rose-600 mb-1">📉 ESTOQUE MÍNIMO</label>
            <input
              type="number"
              placeholder="0"
              value={stockMin}
              onChange={(e) => setStockMin(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 font-semibold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-blue-600 mb-1">⭐ ESTOQUE IDEAL</label>
            <input
              type="number"
              placeholder="0"
              value={stockIdeal}
              onChange={(e) => setStockIdeal(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 font-semibold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-emerald-600 mb-1">📈 ESTOQUE MÁXIMO</label>
            <input
              type="number"
              placeholder="0"
              value={stockMax}
              onChange={(e) => setStockMax(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 font-semibold"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full text-white text-xs font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 mt-2 ${
            editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {submitting ? 'Salvando...' : editingId ? 'Atualizar Produto & Estoque' : 'Salvar Produto'}
        </button>
      </form>
    </div>
  );
}