// Base de conhecimento fiscal oficial simulada (Tabela NCM x CEST x Classificação Tributária)
export interface FiscalData {
  ncm: string;
  cest: string;
  classTrib: string;
  description: string;
}

export const OFFICIAL_FISCAL_DATABASE: Record<string, FiscalData> = {
  '33030010': {
    ncm: '33030010',
    cest: '20.023.00',
    classTrib: '000101', // Tributação padrão / Regime Normal
    description: 'Perfumes (extratos)',
  },
  '33049990': {
    ncm: '33049990',
    cest: '20.063.00',
    classTrib: '000101',
    description: 'Outros produtos de beleza ou de maquiagem preparados',
  },
  '33051000': {
    ncm: '33051000',
    cest: '20.027.00',
    classTrib: '000102', // Alíquota reduzida / Higiene essencial
    description: 'Shampoos para o cabelo',
  },
  '33059000': {
    ncm: '33059000',
    cest: '20.028.00',
    classTrib: '000102',
    description: 'Outras preparações capilares (Condicionadores, Cremes)',
  },
  '34011190': {
    ncm: '34011190',
    cest: '20.041.00',
    classTrib: '000101',
    description: 'Sabonetes de toucador',
  },
};

export function lookupFiscalByNcm(ncmCode: string): FiscalData | null {
  const cleanNcm = ncmCode.replace(/\D/g, '').slice(0, 8);
  return OFFICIAL_FISCAL_DATABASE[cleanNcm] || null;
}