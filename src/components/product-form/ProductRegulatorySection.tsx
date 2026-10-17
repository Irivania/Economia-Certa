'use client';

import { uppercaseText } from '@/lib/text';

interface ProductRegulatorySectionProps {
  anvisaRegistry: string;
  setAnvisaRegistry: (val: string) => void;
  manufacturerName: string;
  setManufacturerName: (val: string) => void;
  weight: string;
  setWeight: (val: string) => void;
  dimensions: string;
  setDimensions: (val: string) => void;
}

// Máscara oficial ajustada para o formato completo de 17 dígitos: 25351.063988/2024-44
function formatAnvisaMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 17);
  
  let formatted = digits;
  if (digits.length > 5) {
    formatted = `${digits.slice(0, 5)}.${digits.slice(5)}`;
  }
  if (digits.length > 11) {
    formatted = `${digits.slice(0, 5)}.${digits.slice(5, 11)}/${digits.slice(11)}`;
  }
  if (digits.length > 15) {
    formatted = `${digits.slice(0, 5)}.${digits.slice(5, 11)}/${digits.slice(11, 15)}-${digits.slice(15)}`;
  }
  return formatted;
}

export function ProductRegulatorySection({
  anvisaRegistry, setAnvisaRegistry,
  manufacturerName, setManufacturerName,
  weight, setWeight,
  dimensions, setDimensions,
}: ProductRegulatorySectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Conformidade Regulatória, ANVISA & Logística
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Dados essenciais para comercialização em marketplaces e cálculo de frete em cotações.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Nº de Registo / Notificação ANVISA
          </label>
          <input
            type="text"
            placeholder="Ex: 25351.063988/2024-44"
            maxLength={20}
            value={anvisaRegistry}
            onChange={(e) => setAnvisaRegistry(formatAnvisaMask(e.target.value))}
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white uppercase font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Nome do Fabricante / Indústria
          </label>
          <input
            type="text"
            placeholder="Ex: Indústria Cosmética Ltda"
            value={manufacturerName}
            onChange={(e) => setManufacturerName(uppercaseText(e.target.value))}
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white uppercase"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Peso Bruto / Líquido
          </label>
          <input
            type="text"
            placeholder="Ex: 0.250 kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Dimensões (CxLxA em cm)
          </label>
          <input
            type="text"
            placeholder="Ex: 10 x 5 x 15 cm"
            value={dimensions}
            onChange={(e) => setDimensions(uppercaseText(e.target.value))}
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
          />
        </div>
      </div>
    </div>
  );
}