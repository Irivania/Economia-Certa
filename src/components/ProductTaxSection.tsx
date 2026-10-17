'use client';

import { uppercaseText } from '@/lib/text';
import { apiFetch } from '@/lib/apiClient';

interface ProductTaxSectionProps {
  ncm: string;
  setNcm: (val: string) => void;
  cest: string;
  setCest: (val: string) => void;
  classTrib: string;
  setClassTrib: (val: string) => void;
}

export function ProductTaxSection({
  ncm,
  setNcm,
  cest,
  setCest,
  classTrib,
  setClassTrib,
}: ProductTaxSectionProps) {

  // Gatilho automático ao sair do campo NCM
  const handleNcmBlur = async () => {
    if (!ncm || ncm.trim().length < 4) return;
    try {
      const res = await apiFetch(`/api/products/lookup?ncm=${ncm.trim()}`);
      if (!res.ok) return;
      const data = await res.json();

      if (data && data.source === 'fiscal_table') {
        if (!cest && data.cest) setCest(data.cest);
        if (!classTrib && data.classTrib) setClassTrib(data.classTrib);
      }
    } catch (err) {
      console.error('Erro ao buscar tributação automática por NCM:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Tributação, Impostos & Reforma Tributária (IBS/CBS)
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Preencha o NCM para preenchimento automático oficial do CEST e Classificação Tributária.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            NCM (8 Dígitos) *
          </label>
          <input
            type="text"
            placeholder="Ex: 33059000"
            maxLength={10}
            value={ncm}
            onChange={(e) => setNcm(e.target.value.replace(/\D/g, ''))}
            onBlur={handleNcmBlur}
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            CEST (Substituição Tributária)
          </label>
          <input
            type="text"
            placeholder="Ex: 20.028.00"
            value={cest}
            onChange={(e) => setCest(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Classificação Tributária (`cClassTrib`)
          </label>
          <input
            type="text"
            placeholder="Ex: 000102"
            value={classTrib}
            onChange={(e) => setClassTrib(uppercaseText(e.target.value))}
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white uppercase font-mono"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">Padrão oficial para transição IBS/CBS.</span>
        </div>
      </div>
    </div>
  );
}