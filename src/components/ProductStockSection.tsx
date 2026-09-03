'use client';

interface ProductStockSectionProps {
  stockCurrent: number;
  setStockCurrent: (val: number) => void;
  stockMin: number;
  setStockMin: (val: number) => void;
  stockIdeal: number;
  setStockIdeal: (val: number) => void;
  stockMax: number;
  setStockMax: (val: number) => void;
}

export function ProductStockSection({
  stockCurrent,
  setStockCurrent,
  stockMin,
  setStockMin,
  stockIdeal,
  setStockIdeal,
  stockMax,
  setStockMax,
}: ProductStockSectionProps) {
  return (
    <div>
      <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Parâmetros de Estoque</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Estoque Atual</label>
          <input
            type="number"
            value={stockCurrent}
            onChange={(e) => setStockCurrent(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Estoque Mínimo</label>
          <input
            type="number"
            value={stockMin}
            onChange={(e) => setStockMin(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Estoque Ideal</label>
          <input
            type="number"
            value={stockIdeal}
            onChange={(e) => setStockIdeal(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Estoque Máximo</label>
          <input
            type="number"
            value={stockMax}
            onChange={(e) => setStockMax(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          />
        </div>
      </div>
    </div>
  );
}