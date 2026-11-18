import { useState } from "react";
import { rtcClient, ItemCalculoRTC } from "@/services/rtcClient";
import { useToast } from "@/features/dashboard/hooks/useToast";

interface CartItem {
  id?: string | number;
  barcode?: string;
  codigo?: string;
  ncm?: string;
  cst?: string;
  classTrib?: string;
  unit?: string;
  price?: number;
  valorUnitario?: number;
  quantity?: number;
  quantidade?: number;
}

export function useRTCIntegration() {
  const [loadingRTC, setLoadingRTC] = useState(false);
  const [resultadoImpostos, setResultadoImpostos] = useState<unknown>(null);
  const { addToast } = useToast();

  /**
   * Envia os itens do carrinho atual para o motor da Receita Federal calcular os tributos da LC 214/2025
   */
  const calcularTributosVenda = async (cartItems: CartItem[]) => {
    if (!cartItems || cartItems.length === 0) return null;

    setLoadingRTC(true);
    try {
      // Mapeia os itens do carrinho para o formato exigido pela API da Receita
      const itensFormatados: ItemCalculoRTC[] = cartItems.map((item, index) => {
        const quantidade = Number(item.quantity || item.quantidade || 1);
        const valorUnitario = Number(item.price || item.valorUnitario || 0);
        return {
          numero: index + 1,
          ncm: item.ncm || "33049990",
          cst: item.cst || "000",
          cClassTrib: item.classTrib || "000001",
          baseCalculo: valorUnitario * quantidade,
          quantidade,
          unidade: item.unit || "UN",
        };
      });

      const payload = {
        id: crypto.randomUUID().replace(/-/g, ""),
        versao: "0.0.1",
        dhFatoGerador: new Date().toISOString().replace(/\.\d{3}Z$/, "-03:00"),
        municipio: 3550308,
        uf: "SP",
        itens: itensFormatados,
      };

      // Chamada POST para a API local da Receita Federal (/regime-geral)
      const resposta = await rtcClient.calcularRegimeGeral(payload);

      setResultadoImpostos(resposta);
      addToast(
        "Tributos calculados com sucesso via Calculadora RTC!",
        "success",
      );
      return resposta;
    } catch (error) {
      console.error("Erro ao calcular tributos oficiais:", error);
      addToast(
        "Aviso: Não foi possível conectar ao motor fiscal da Receita Federal.",
        "warning",
      );
      return null;
    } finally {
      setLoadingRTC(false);
    }
  };

  return {
    calcularTributosVenda,
    resultadoImpostos,
    loadingRTC,
  };
}
