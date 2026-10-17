'use client';

import { uppercaseText } from '@/lib/text';

interface ProductBasicSectionProps {
  description: string;
  setDescription: (val: string) => void;
  ean: string;
  setEan: (val: string) => void;
  onEanBlur: () => void;
  brand: string;
  setBrand: (val: string) => void;
  brandsList: string[];
  isNewBrandMode: boolean;
  setIsNewBrandMode: (val: boolean) => void;
  imageUrl: string;
  setImageUrl: (val: string) => void;
  unit: string;
  setUnit: (val: string) => void;
  boxQuantity: number | '';
  setBoxQuantity: (val: number) => void;
  stockCurrent: number | '';
  setStockCurrent: (val: number | '') => void;
  formMode: 'minimal' | 'complete';
}

export function ProductBasicSection({
  description, setDescription,
  ean, setEan, onEanBlur,
  brand, setBrand, brandsList,
  isNewBrandMode, setIsNewBrandMode,
  imageUrl, setImageUrl,
  unit, setUnit,
  boxQuantity, setBoxQuantity,
  stockCurrent, setStockCurrent,
  formMode,
}: ProductBasicSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${formMode === 'complete' ? 'md:col-span-3' : 'md:col-span-4'}`}>
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descrição do Produto *</label>
          <input
            type="text"
            placeholder="Ex: Perfume Kaiak Tradicional 100ml"
            value={description}
            onChange={(e) => setDescription(uppercaseText(e.target.value))}
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white uppercase font-bold"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Código de Barras (EAN)</label>
          <input
            type="text"
            placeholder="Ex: 7891011121314"
            value={ean}
            onChange={(e) => setEan(e.target.value)}
            onBlur={onEanBlur}
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Marca</label>
            <button
              type="button"
              onClick={() => {
                setIsNewBrandMode(!isNewBrandMode);
                setBrand('');
              }}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer"
            >
              {isNewBrandMode ? '← Selecionar existente' : '+ Nova Marca'}
            </button>
          </div>
          
          {isNewBrandMode || brandsList.length === 0 ? (
            <input
              type="text"
              placeholder="Digite o nome da nova marca..."
              value={brand}
              onChange={(e) => setBrand(uppercaseText(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-indigo-400 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 uppercase font-bold text-indigo-900 dark:text-indigo-200 shadow-sm"
              autoFocus
            />
          ) : (
            <select
              value={brand}
              onChange={(e) => {
                if (e.target.value === '__NEW_BRAND__') {
                  setIsNewBrandMode(true);
                  setBrand('');
                } else {
                  setBrand(uppercaseText(e.target.value));
                }
              }}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white uppercase font-medium"
            >
              <option value="">Selecione a marca...</option>
              <option value="__NEW_BRAND__" className="font-bold text-indigo-600">+ Cadastrar Nova Marca...</option>
              {brandsList.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          )}
        </div>

        {formMode === 'complete' ? (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Unidade / Embalagem</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
              >
                <option value="UN">Unidade (UN)</option>
                <option value="CX C/ 06">Caixa c/ 06</option>
                <option value="CX C/ 12">Caixa c/ 12</option>
                <option value="CX C/ 24">Caixa c/ 24</option>
                <option value="PCT">Pacote (PCT)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Qtd. Itens por Caixa</label>
              <input
                type="number"
                min="1"
                value={boxQuantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setBoxQuantity(isNaN(val) ? 1 : Math.max(1, val));
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Estoque Atual *</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={stockCurrent}
              onChange={(e) => setStockCurrent(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
            />
          </div>
        )}
      </div>

      {formMode === 'complete' && (
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">URL da Imagem</label>
          <input
            type="text"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white mb-2"
          />
          <div className="w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-center overflow-hidden mx-auto shadow-sm">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] text-slate-400">Sem Foto</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}