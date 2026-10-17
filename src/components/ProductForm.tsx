'use client';

import { useState } from 'react';
import { ProductTaxSection } from '@/components/ProductTaxSection';
import { ProductStockSection } from '@/components/ProductStockSection';
import { ProductBasicSection } from '@/components/product-form/ProductBasicSection';
import { ProductPricingSection } from '@/components/product-form/ProductPricingSection';
import { ProductRegulatorySection } from '@/components/product-form/ProductRegulatorySection';
import { apiFetch } from '@/lib/apiClient';

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
  stockCurrent: number | '';
  setStockCurrent: (val: number | '') => void;
  stockMin: number | '';
  setStockMin: (val: number | '') => void;
  stockIdeal: number | '';
  setStockIdeal: (val: number | '') => void;
  stockMax: number | '';
  setStockMax: (val: number | '') => void;
  ncm: string;
  setNcm: (val: string) => void;
  cest: string;
  setCest: (val: string) => void;
  classTrib: string;
  setClassTrib: (val: string) => void;
  anvisaRegistry: string;
  setAnvisaRegistry: (val: string) => void;
  manufacturerName: string;
  setManufacturerName: (val: string) => void;
  weight: string;
  setWeight: (val: string) => void;
  dimensions: string;
  setDimensions: (val: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
  brandsList?: string[];
  isFromImport?: boolean;
  formMode?: 'minimal' | 'complete';
}

function formatarMoedaInput(valorStr: string): string {
  const apenasDigitos = valorStr.replace(/\D/g, '');
  if (!apenasDigitos) return '';
  const numero = Number(apenasDigitos) / 100;
  return numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseMoedaParaFloat(valorStr: string): number {
  if (!valorStr) return 0;
  const limpo = valorStr.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(limpo);
  return isNaN(num) ? 0 : num;
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
  classTrib, setClassTrib,
  anvisaRegistry, setAnvisaRegistry,
  manufacturerName, setManufacturerName,
  weight, setWeight,
  dimensions, setDimensions,
  submitting,
  onSubmit,
  onCancelEdit,
  brandsList = [],
  isFromImport = false,
  formMode = 'complete',
}: ProductFormProps) {
  const [margin, setMargin] = useState<string>('');
  const [isNewBrandMode, setIsNewBrandMode] = useState(false);

  const handleEanBlur = async () => {
    if (!ean || ean.trim().length < 8) return;
    try {
      const res = await apiFetch(`/api/products/lookup?ean=${ean.trim()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data && (data.source === 'local' || data.source === 'external_simulation')) {
        if (!description && data.description) setDescription(data.description);
        if (!brand && data.brand) setBrand(data.brand);
        if (!ncm && data.ncm) setNcm(data.ncm);
        if (!cest && data.cest) setCest(data.cest);
        if (!classTrib && data.classTrib) setClassTrib(data.classTrib);
        if (!imageUrl && data.imageUrl) setImageUrl(data.imageUrl);
      }
    } catch (err) {
      console.error('Erro ao buscar dados automáticos do EAN:', err);
    }
  };

  const handlePriceChange = (type: 'cost' | 'margin' | 'sale', val: string) => {
    let formattedVal = val;
    if (type === 'cost' || type === 'sale') {
      formattedVal = formatarMoedaInput(val);
      if (type === 'cost') setCostPrice(formattedVal);
      if (type === 'sale') setSalePrice(formattedVal);
    } else {
      setMargin(val);
    }

    const cost = type === 'cost' ? parseMoedaParaFloat(formattedVal) : parseMoedaParaFloat(costPrice);
    const m = type === 'margin' ? parseFloat(val) : parseFloat(margin);
    const sale = type === 'sale' ? parseMoedaParaFloat(formattedVal) : parseMoedaParaFloat(salePrice);

    if (type === 'cost' || type === 'sale') {
      if (cost > 0 && sale >= cost) {
        setMargin((((sale - cost) / cost) * 100).toFixed(2));
      } else if (!val) {
        setMargin('');
      }
    }

    if (type === 'margin') {
      if (cost > 0 && !isNaN(m)) {
        const novoPreco = cost + (cost * m) / 100;
        setSalePrice(
          novoPreco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        );
      } else if (!val) {
        setSalePrice('');
      }
    }
  };

  const handleLastPurchaseChange = (val: string) => {
    setLastPurchasePrice(formatarMoedaInput(val));
  };

  return (
    <form onSubmit={onSubmit} className="mb-10 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 transition-all">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          {editingId ? 'Editar Produto' : formMode === 'minimal' ? '⚡ Cadastro Rápido (Mínimo)' : '📋 Cadastro Completo (Fiscal, Custos, ANVISA & Logística)'}
        </h2>
        {editingId && (
          <button type="button" onClick={onCancelEdit} className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer">
            Cancelar Edição
          </button>
        )}
      </div>

      <ProductBasicSection
        description={description} setDescription={setDescription}
        ean={ean} setEan={setEan} onEanBlur={handleEanBlur}
        brand={brand} setBrand={setBrand} brandsList={brandsList}
        isNewBrandMode={isNewBrandMode} setIsNewBrandMode={setIsNewBrandMode}
        imageUrl={imageUrl} setImageUrl={setImageUrl}
        unit={unit} setUnit={setUnit}
        boxQuantity={boxQuantity} setBoxQuantity={setBoxQuantity}
        stockCurrent={stockCurrent} setStockCurrent={setStockCurrent}
        formMode={formMode}
      />

      <hr className="border-slate-200 dark:border-slate-800" />

      <ProductPricingSection
        costPrice={costPrice}
        lastPurchasePrice={lastPurchasePrice}
        salePrice={salePrice}
        margin={margin}
        onPriceChange={handlePriceChange}
        onLastPurchaseChange={handleLastPurchaseChange}
        formMode={formMode}
      />

      {formMode === 'complete' && (
        <>
          <hr className="border-slate-200 dark:border-slate-800" />
          <ProductStockSection
            stockCurrent={stockCurrent} setStockCurrent={setStockCurrent}
            stockMin={stockMin} setStockMin={setStockMin}
            stockIdeal={stockIdeal} setStockIdeal={setStockIdeal}
            stockMax={stockMax} setStockMax={setStockMax}
          />
          <hr className="border-slate-200 dark:border-slate-800" />
          <ProductTaxSection 
            ncm={ncm} setNcm={setNcm} 
            cest={cest} setCest={setCest} 
            classTrib={classTrib} setClassTrib={setClassTrib}
          />
          <hr className="border-slate-200 dark:border-slate-800" />
          <ProductRegulatorySection
            anvisaRegistry={anvisaRegistry} setAnvisaRegistry={setAnvisaRegistry}
            manufacturerName={manufacturerName} setManufacturerName={setManufacturerName}
            weight={weight} setWeight={setWeight}
            dimensions={dimensions} setDimensions={setDimensions}
          />
        </>
      )}

      <div className="flex justify-between items-center pt-2">
        {isFromImport ? (
          <a href="/importar" className="text-xs font-bold text-indigo-500 hover:underline bg-indigo-500/10 px-4 py-2.5 rounded-xl border border-indigo-500/20 transition-colors flex items-center gap-1.5">
            &larr; Voltar para Central de Importação
          </a>
        ) : <span />}

        <button
          type="submit"
          disabled={submitting}
          className={`text-xs font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg text-white ${
            editingId ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
          } disabled:opacity-50 cursor-pointer`}
        >
          {submitting ? 'Salvando...' : editingId ? 'Salvar Alterações do Produto' : '+ Cadastrar Produto no Catálogo'}
        </button>
      </div>
    </form>
  );
}