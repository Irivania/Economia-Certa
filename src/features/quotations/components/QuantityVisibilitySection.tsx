'use client';

import { memo } from 'react';

interface QuantityVisibilitySectionProps {
  showQuantities: boolean;
  setShowQuantities: (val: boolean) => void;
  isDarkMode: boolean;
}

export const QuantityVisibilitySection = memo(function QuantityVisibilitySection({
  showQuantities,
  setShowQuantities,
  isDarkMode,
}: QuantityVisibilitySectionProps) {
  return (
    <div className={`rounded-xl border p-5 ${isDarkMode ? 'border-indigo-900/60 bg-indigo-950/20' : 'border-indigo-100 bg-indigo-50/60'}`}>
      <h2 className="text-xs font-bold uppercase tracking-wider">Quantidade enviada aos representantes</h2>
      <p className="mt-0.5 text-xs text-slate-500">
        Escolha se os representantes verão a quantidade solicitada ao responder.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition ${
          showQuantities ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-200 dark:border-slate-800'
        }`}>
          <input
            type="radio"
            name="quantity-visibility"
            checked={showQuantities}
            onChange={() => setShowQuantities(true)}
            aria-label="Enviar com quantidade"
            className="mt-0.5 accent-emerald-600"
          />
          <span>
            <span className="block text-xs font-bold">Enviar com quantidade</span>
            <span className="mt-0.5 block text-[11px] text-slate-500">O representante verá a quantidade de cada item.</span>
          </span>
        </label>
        <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition ${
          !showQuantities ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-200 dark:border-slate-800'
        }`}>
          <input
            type="radio"
            name="quantity-visibility"
            checked={!showQuantities}
            onChange={() => setShowQuantities(false)}
            aria-label="Enviar sem quantidade"
            className="mt-0.5 accent-indigo-600"
          />
          <span>
            <span className="block text-xs font-bold">Enviar sem quantidade</span>
            <span className="mt-0.5 block text-[11px] text-slate-500">O representante informará os preços sem ver a quantidade.</span>
          </span>
        </label>
      </div>
    </div>
  );
});