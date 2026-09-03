'use client';

// Lista oficial de CESTs para seleção rápida ou preenchimento automático
export const cestOptions = [
  { cest: '20.015.00', label: '20.015.00 - Perfumes e águas-de-colônia (NCM 3303)' },
  { cest: '20.017.00', label: '20.017.00 - Xampus para o cabelo (NCM 3305.10)' },
  { cest: '20.020.00', label: '20.020.00 - Máscaras, finalizadores e outras prep. capilares (NCM 3305.90)' },
  { cest: '20.021.00', label: '20.021.00 - Condicionadores de cabelo (NCM 3305.90)' },
  { cest: '20.022.00', label: '20.022.00 - Tintura para o cabelo (NCM 3305.90)' },
  { cest: '20.033.00', label: '20.033.00 - Desodorantes corporais e antiperspirantes (NCM 3307.20)' },
  { cest: '20.054.00', label: '20.054.00 - Produtos para os lábios / Batons (NCM 3304.10)' },
  { cest: '20.056.00', label: '20.056.00 - Sombras, delineadores e rímel (NCM 3304.20)' },
  { cest: '20.063.00', label: '20.063.00 - Cremes corporais, loções e hidratantes (NCM 3304.99)' },
  { cest: '20.049.00', label: '20.049.00 - Cremes dentais / Dentifrícios (NCM 3306.10)' },
];

// Dicionário NCM -> CEST
const ncmToCestMap: Record<string, string> = {
  '33030010': '20.015.00',
  '33030020': '20.015.00',
  '33051000': '20.017.00',
  '33059000': '20.020.00',
  '33059010': '20.021.00',
  '33059020': '20.022.00',
  '33049990': '20.063.00',
  '33041000': '20.054.00',
  '33042010': '20.056.00',
  '33061000': '20.049.00',
  '33072010': '20.033.00',
};

interface ProductTaxSectionProps {
  ncm: string;
  setNcm: (val: string) => void;
  cest: string;
  setCest: (val: string) => void;
}

export function ProductTaxSection({ ncm, setNcm, cest, setCest }: ProductTaxSectionProps) {
  const handleNcmChange = (val: string) => {
    setNcm(val);
    const cleanNcm = val.replace(/\D/g, '');

    // Se o NCM bater com o dicionário, preenche o CEST automaticamente
    if (ncmToCestMap[cleanNcm]) {
      setCest(ncmToCestMap[cleanNcm]);
    }
  };

  return (
    <div>
      <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Tributação e Impostos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">NCM (8 Dígitos)</label>
          <input
            type="text"
            placeholder="Ex: 33059000"
            value={ncm}
            onChange={(e) => handleNcmChange(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            CEST (Automático ou Seleção Manual)
          </label>
          <select
            value={cest}
            onChange={(e) => setCest(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono"
          >
            <option value="">Selecione ou digite o CEST...</option>
            {cestOptions.map((item) => (
              <option key={item.cest} value={item.cest}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}