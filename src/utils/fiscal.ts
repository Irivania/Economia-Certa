// Dicionário de Inteligência Fiscal: NCM x CEST (Foco em Cosméticos / Perfumaria / Higiene)
export const NCM_CEST_DATABASE: Record<string, string> = {
  '33030010': '2000700', // Perfumes (extratos)
  '33030020': '2000800', // Águas-de-colônia
  '33041000': '2001000', // Produtos de maquiagem para os lábios
  '33042010': '2001100', // Sombras, delineadores e rímel
  '33043000': '2001200', // Preparações para manicuros ou pedicuros (esmaltes)
  '33049100': '2001300', // Pós compactos
  '33049910': '2001400', // Cremes de beleza e loções tônicas
  '33049990': '2001500', // Outros produtos de beleza
  '33051000': '2001700', // Xampus para o cabelo
  '33052000': '2001800', // Preparações para ondulação
  '33053000': '2001900', // Lacas para o cabelo (sprays)
  '33059000': '2002000', // Condicionadores e máscaras capilares
  '33071000': '2002600', // Sais de barbear e espumas
  '33072010': '2002700', // Desodorantes corporais e antiperspirantes
  '33079000': '2003200', // Outros produtos de toucador
};

export function getCestByNcm(ncm: string): string | null {
  const cleanNcm = ncm.replace(/\D/g, '');
  if (cleanNcm.length === 8) {
    return NCM_CEST_DATABASE[cleanNcm] || null;
  }
  return null;
}