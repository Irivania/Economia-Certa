'use client';

import { useState } from 'react';
import { ProductTaxSection } from '@/components/ProductTaxSection';
import { ProductStockSection } from '@/components/ProductStockSection';

interface ProductFormProps {
  editingId: string | null;
  description: string;
  setDescription: (val: string) => void;
  ean: string;
  setEan: (val: string) => void;
  brand: string;
  setBrand: (val: string) => void;
  imageUrl: string;
  setImageUrl: (val: string) => void;
  unit: string;
  setUnit: (val: string) => void;
  boxQuantity: number;
  setBoxQuantity: (val: number) => void;
  costPrice: string;
  setCostPrice: (val: string) => void;
  lastPurchasePrice: string;
  setLastPurchasePrice: (val: string) => void;
  salePrice: string;
  setSalePrice: (val: string) => void;
  stockCurrent: number;
  setStockCurrent: (val: number) => void;
  stockMin: number;
  setStockMin: (val: number) => void;
  stockIdeal: number;
  setStockIdeal: (val: number) => void;
  stockMax: number;
  setStockMax: (val: number) => void;
  ncm: string;
  setNcm: (val: string) => void;
  cest: string;
  setCest: (val: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
  brandsList?: string[];
}

export function ProductForm({
  editingId,
  description, setDescription,
  ean, setEan,
  brand, setBrand,
  imageUrl, setImageUrl,
  unit, setUnit,
  boxQuantity, setBoxQuantity,
  costPrice, setCostPrice,
  lastPurchasePrice, setLastPurchasePrice,
  salePrice, setSalePrice,
  stockCurrent, setStockCurrent,
  stockMin, setStockMin,
  stockIdeal, setStockIdeal,
  stockMax, setStockMax,
  ncm, setNcm,
  cest, setCest,
  submitting,
  onSubmit,
  onCancelEdit,
  brandsList = [],
}: ProductFormProps) {
  const [margin, setMargin] = useState<string>('');
  
  // Estado para controlar se o usuário quer digitar uma nova marca ou selecionar da lista
  const [isNewBrandMode, setIsNewBrandMode] = useState(false);

  const handlePriceChange = (type: 'cost' | 'margin' | 'sale', val: string) => {
    if (type === 'cost') setCostPrice(val);
    if (type === 'margin') setMargin(val);
    if (type === 'sale') setSalePrice(val);

    const cost = type === 'cost' ? parseFloat(val) : parseFloat(costPrice);
    const m = type === 'margin' ? parseFloat(val) : parseFloat(margin);
    const sale = type === 'sale' ? parseFloat(val) : parseFloat(salePrice);

    if (type === 'cost' || type === 'sale') {
      if (!isNaN(cost) && cost > 0 && !isNaN(sale) && sale >= cost) {
        setMargin((((sale - cost) / cost) * 100).toFixed(2));
      } else if (!val) setMargin('');
    }

    if (type === 'margin') {
      if (!isNaN(cost) && cost > 0 && !isNaN(m)) {
        setSalePrice((cost + (cost * m) / 100).toFixed(2));
      } else if (!val) setSalePrice('');
    }
  };

  return (
    <form onSubmit={onSubmit} className="mb-10 p-6 bg-slate-50 rounded-lg border border-slate-200 space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {editingId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
        </h2>
        {editingId && (
          <button type="button" onClick={onCancelEdit} className="text-xs text-rose-600 hover:underline font-semibold">
            Cancelar Edição
          </button>
        )}
      </div>

      {/* Seção 1: Informações Básicas e Imagem */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Descrição do Produto *</label>
            <input
              type="text"
              placeholder="Ex: Perfume Kaiak Tradicional 100ml"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white uppercase"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Código de Barras (EAN)</label>
            <input
              type="text"
              placeholder="Ex: 7891011121314"
              value={ean}
              onChange={(e) => setEan(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-600">Marca</label>
              <button
                type="button"
                onClick={() => {
                  setIsNewBrandMode(!isNewBrandMode);
                  setBrand('');
                }}
                className="text-[11px] text-blue-600 hover:underline font-semibold"
              >
                {isNewBrandMode ? '← Selecionar existente' : '+ Nova Marca'}
              </button>
            </div>
            
            {isNewBrandMode || brandsList.length === 0 ? (
              <input
                type="text"
                placeholder="Digite o nome da nova marca"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-blue-300 rounded-lg bg-blue-50/50 uppercase font-medium text-blue-900"
                autoFocus
              />
            ) : (
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white uppercase"
              >
                <option value="">Selecione a marca...</option>
                {brandsList.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Unidade / Embalagem</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="UN">Unidade (UN)</option>
              <option value="CX C/ 06">Caixa c/ 06</option>
              <option value="CX C/ 12">Caixa c/ 12</option>
              <option value="CX C/ 24">Caixa c/ 24</option>
              <option value="PCT">Pacote (PCT)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Qtd. Itens por Caixa</label>
            <input
              type="number"
              min="1"
              value={boxQuantity}
              onChange={(e) => setBoxQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">URL da Imagem</label>
          <input
            type="text"
            placeholder="https://exemplo.com/foto.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white mb-2"
          />
          <div className="w-16 h-16 rounded border border-slate-200 bg-white flex items-center justify-center overflow-hidden mx-auto">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-slate-400">Sem Foto</span>
            )}
          </div>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Seção 2: Preços, Margem e Custos */}
      <div>
        <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Preços, Custos e Margem</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Preço de Custo Atual (R$)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={costPrice}
              onChange={(e) => handlePriceChange('cost', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Valor Última Compra (R$)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={lastPurchasePrice}
              onChange={(e) => setLastPurchasePrice(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Margem de Lucro (%)</label>
            <input
              type="number"
              step="0.01"
              placeholder="Ex: 100"
              value={margin}
              onChange={(e) => handlePriceChange('margin', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-amber-50 font-semibold text-amber-800"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Preço de Venda (R$)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={salePrice}
              onChange={(e) => handlePriceChange('sale', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-emerald-50 font-semibold text-emerald-800"
            />
          </div>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Seção 3: Parâmetros de Estoque */}
      <ProductStockSection
        stockCurrent={stockCurrent} setStockCurrent={setStockCurrent}
        stockMin={stockMin} setStockMin={setStockMin}
        stockIdeal={stockIdeal} setStockIdeal={setStockIdeal}
        stockMax={stockMax} setStockMax={setStockMax}
      />

      <hr className="border-slate-200" />

      {/* Seção 4: Tributação */}
      <ProductTaxSection ncm={ncm} setNcm={setNcm} cest={cest} setCest={setCest} />

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className={`text-xs font-semibold px-6 py-3 rounded-lg transition-colors text-white ${
            editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
          } disabled:opacity-50 shadow-sm`}
        >
          {submitting ? 'Salvando...' : editingId ? 'Salvar Alterações do Produto' : '+ Cadastrar Produto no Catálogo'}
        </button>
      </div>
    </form>
  );
}