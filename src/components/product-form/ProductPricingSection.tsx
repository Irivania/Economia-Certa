'use client';

interface ProductPricingSectionProps {
  costPrice: string;
  lastPurchasePrice: string;
  salePrice: string;
  margin: string;
  onPriceChange: (type: 'cost' | 'margin' | 'sale', val: string) => void;
  onLastPurchaseChange: (val: string) => void;
  formMode: 'minimal' | 'complete';
}

export function ProductPricingSection({
  costPrice,
  lastPurchasePrice,
  salePrice,
  margin,
  onPriceChange,
  onLastPurchaseChange,
  formMode,
}: ProductPricingSectionProps) {
  return (
    <div>
      <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
        {formMode === 'minimal' ? 'Preço de Venda' : 'Preços, Custos e Margem'}
      </h3>
      
      {formMode === 'minimal' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Preço de Venda (R$) *</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0,00"
              value={salePrice}
              onChange={(e) => onPriceChange('sale', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 font-bold text-emerald-800 dark:text-emerald-200"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Preço de Custo Atual (R$)</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0,00"
              value={costPrice}
              onChange={(e) => onPriceChange('cost', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Valor Última Compra (R$)</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0,00"
              value={lastPurchasePrice}
              onChange={(e) => onLastPurchaseChange(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Margem de Lucro (%)</label>
            <input
              type="number"
              step="0.01"
              placeholder="Ex: 100"
              value={margin}
              onChange={(e) => onPriceChange('margin', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-amber-50 dark:bg-amber-950/30 font-semibold text-amber-800 dark:text-amber-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Preço de Venda (R$)</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0,00"
              value={salePrice}
              onChange={(e) => onPriceChange('sale', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 font-semibold text-emerald-800 dark:text-emerald-200"
            />
          </div>
        </div>
      )}
    </div>
  );
}