/**
 * Cliente de Integração com a Calculadora RTC (Reforma Tributária - LC 214/2025)
 * Utiliza o proxy do Next.js para evitar bloqueios de CORS no navegador.
 */

const RTC_PROXY_BASE_URL = "/api/rtc";

export interface ItemCalculoRTC {
  numero: number;
  ncm: string;
  cst: string;
  cClassTrib: string;
  baseCalculo: number;
  quantidade: number;
  unidade: string;
}

export interface RequisicaoCalculoRegimeGeral {
  id: string;
  versao: string;
  dhFatoGerador: string;
  municipio: number;
  uf: string;
  tpDoc?: number;
  itens: ItemCalculoRTC[];
}

export const rtcClient = {
  async calcularRegimeGeral(dados: RequisicaoCalculoRegimeGeral) {
    try {
      const response = await fetch(`${RTC_PROXY_BASE_URL}/regime-geral`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Detalhes do Erro da Receita:", errorBody);
        throw new Error(`Erro na calculadora RTC: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Falha ao comunicar com a API da Receita Federal:", error);
      throw error;
    }
  },

  async consultarAliquotasReferencia() {
    try {
      const [uniao, uf, municipio] = await Promise.all([
        fetch(`${RTC_PROXY_BASE_URL}/dados-abertos/aliquota-uniao`).then(
          (res) => res.json(),
        ),
        fetch(`${RTC_PROXY_BASE_URL}/dados-abertos/aliquota-uf`).then((res) =>
          res.json(),
        ),
        fetch(`${RTC_PROXY_BASE_URL}/dados-abertos/aliquota-municipio`).then(
          (res) => res.json(),
        ),
      ]);

      return { uniao, uf, municipio };
    } catch (error) {
      console.error("Erro ao buscar dados abertos de alíquotas:", error);
      throw error;
    }
  },
};
