"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { usePDVState } from "./pdv/usePDVState";
import { usePDVCheckout } from "./pdv/usePDVCheckout";
import { rtcClient, ItemCalculoRTC } from "@/services/rtcClient";

interface PDVFeedback {
  showToast: (message: string, type: "success" | "error" | "warning") => void;
}

interface CartItemWithMetadata {
  productId?: string | number;
  sku?: string;
  ncm?: string;
  cst?: string;
  classTrib?: string;
  unit?: string;
  unitPrice?: number;
  quantity?: number;
  subtotal?: number;
}

export function usePDV() {
  const state = usePDVState();
  const checkout = usePDVCheckout({
    companyId: state.companyId,
    cart: state.cart,
    setCart: state.setCart,
    customerName: state.customerName,
    setCustomerName: state.setCustomerName,
    customerDocument: state.customerDocument,
    setCustomerDocument: state.setCustomerDocument,
    selectedPartnerId: state.selectedPartnerId,
    setSelectedPartnerId: state.setSelectedPartnerId,
    partners: state.partners,
    totalCart: state.totalCart,
    searchInputRef: state.searchInputRef,
    loadData: state.loadData,
  });

  // Estado para armazenar os tributos calculados pela API da Receita Federal
  const [tributosRTC, setTributosRTC] = useState<unknown>(null);
  const [loadingRTC, setLoadingRTC] = useState(false);

  // Feedback visual padronizado sem o alerta nativo do navegador
  const notify: PDVFeedback["showToast"] = useCallback((message, type) => {
    if (type === "error") {
      console.error(`[PDV Error]: ${message}`);
    } else if (type === "warning") {
      console.warn(`[PDV Warning]: ${message}`);
    } else {
      console.log(`[PDV Info]: ${message}`);
    }
  }, []);

  // Função para disparar o cálculo oficial da Reforma Tributária (LC 214/2025)
  const calcularTributosOFiciais = useCallback(async () => {
    if (!state.cart || state.cart.length === 0) return null;

    setLoadingRTC(true);
    try {
      const itensFormatados: ItemCalculoRTC[] = state.cart.map(
        (rawItem, index) => {
          const item = rawItem as CartItemWithMetadata;
          const subtotal = Number(
            item.subtotal || (item.unitPrice || 0) * (item.quantity || 1),
          );
          return {
            numero: index + 1,
            ncm: item.ncm || "33049990",
            cst: item.cst || "000",
            cClassTrib: item.classTrib || "000001",
            baseCalculo: subtotal,
            quantidade: Number(item.quantity || 1),
            unidade: item.unit || "UN",
          };
        },
      );

      const payload = {
        id: crypto.randomUUID().replace(/-/g, ""),
        versao: "0.0.1",
        dhFatoGerador: new Date().toISOString().replace(/\.\d{3}Z$/, "-03:00"),
        municipio: 3550308,
        uf: "SP",
        itens: itensFormatados,
      };

      // Chamada HTTP para a API local da Receita Federal na porta 8080
      const resposta = await rtcClient.calcularRegimeGeral(payload);
      setTributosRTC(resposta);
      notify("Tributos calculados com sucesso via Calculadora RTC!", "success");
      return resposta;
    } catch (error) {
      console.error("Erro ao comunicar com a Calculadora RTC:", error);
      notify(
        "Aviso: Motor fiscal offline. Utilizando cálculo padrão.",
        "warning",
      );
      return null;
    } finally {
      setLoadingRTC(false);
    }
  }, [state.cart, notify]);

  // useCallback memoizado para remoção e edição de itens com validações estritas
  const requestManagerAction = useCallback(
    (type: "REMOVE" | "EDIT", productId: string) => {
      if (!productId || typeof productId !== "string") return;
      state.setPendingAction({ type, productId });
      state.setIsAuthModalOpen(true);
    },
    [state],
  );

  // useCallback memoizado para autorização do gerente
  const handleManagerAuthorized = useCallback(() => {
    if (!state.pendingAction) return;

    const { type, productId } = state.pendingAction;
    if (type === "REMOVE") {
      state.setCart((prev) =>
        prev.filter((item) => item.productId !== productId),
      );
    } else if (type === "EDIT") {
      const item = state.cart.find((i) => i.productId === productId);
      if (item) {
        state.setEditingProductId(productId);
        state.setEditPrice(item.unitPrice.toString());
        state.setEditQty(item.quantity.toString());
      }
    }
    state.setPendingAction(null);
  }, [state]);

  // useCallback memoizado para salvamento de edições de itens com validação finita
  const handleSaveItemEdit = useCallback(
    (productId: string) => {
      const newPrice = Number(state.editPrice);
      const newQty = Number(state.editQty);

      if (
        !Number.isFinite(newPrice) ||
        newPrice < 0 ||
        !Number.isFinite(newQty) ||
        newQty <= 0
      ) {
        notify("Valores inválidos para preço ou quantidade.", "error");
        return;
      }

      state.setCart((prev) =>
        prev.map((item) => {
          if (item.productId === productId) {
            const safeSubtotal = Number((newPrice * newQty).toFixed(2));
            return {
              ...item,
              unitPrice: newPrice,
              quantity: newQty,
              subtotal: Number.isFinite(safeSubtotal) ? safeSubtotal : 0,
            };
          }
          return item;
        }),
      );
      state.setEditingProductId(null);
    },
    [state, notify],
  );

  // Wrapper customizado para o checkout que executa o cálculo da Receita antes de concluir
  const handleCheckoutComRTC = useCallback(
    async (
      splits?: Array<{ method: string; amount: number }>,
      changeAmount?: number,
    ) => {
      if (state.cart.length > 0 && state.isRegisterOpen && !state.isPaused) {
        const tributosRTC = await calcularTributosOFiciais();
        checkout.handleCheckout(splits, changeAmount, tributosRTC);
      }
    },
    [
      state.cart.length,
      state.isRegisterOpen,
      state.isPaused,
      calcularTributosOFiciais,
      checkout,
    ],
  );

  // useCallback memoizado para o handler global de finalização (F10)
  const handleF10Shortcut = useCallback(() => {
    handleCheckoutComRTC();
  }, [handleCheckoutComRTC]);

  // Centralização robusta de atalhos
  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "F10") {
        e.preventDefault();
        handleF10Shortcut();
      }
    },
    [handleF10Shortcut],
  );

  // useEffect limpo com dependências estáveis
  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [handleGlobalKeyDown]);

  // Organização do retorno limpa e escalável
  return useMemo(
    () => ({
      // Router & Core
      router: state.router,
      registerLoading: state.registerLoading,
      isRegisterOpen: state.isRegisterOpen,
      isPaused: state.isPaused,
      isOperator: state.isOperator,

      // Caixa & Turno
      openingDisplayValue: state.openingDisplayValue,
      handleOpeningMoneyChange: state.handleOpeningMoneyChange,
      handleOpenRegister: state.handleOpenRegister,

      // Produtos & Pesquisa
      searchTerm: state.searchTerm,
      setSearchTerm: state.setSearchTerm,
      filteredProducts: state.filteredProducts,
      handleAddToCart: state.handleAddToCart,
      handleKeyDown: state.handleKeyDown,
      searchInputRef: state.searchInputRef,

      // Carrinho & Edição
      cart: state.cart,
      totalCart: state.totalCart,
      editingProductId: state.editingProductId,
      setEditingProductId: state.setEditingProductId,
      editPrice: state.editPrice,
      setEditPrice: state.setEditPrice,
      editQty: state.editQty,
      setEditQty: state.setEditQty,
      handleSaveItemEdit,

      // Pagamento & Checkout (integrado com a Receita Federal)
      paymentMethod: checkout.paymentMethod,
      setPaymentMethod: checkout.setPaymentMethod,
      loading: checkout.loading || loadingRTC,
      handleCheckout: handleCheckoutComRTC,
      completedSale: checkout.completedSale,
      clearCompletedSale: checkout.clearCompletedSale,
      tributosRTC,

      // Parceiros & Clientes
      partners: state.partners,
      selectedPartnerId: state.selectedPartnerId,
      setSelectedPartnerId: state.setSelectedPartnerId,
      customerName: state.customerName,
      setCustomerName: state.setCustomerName,
      customerDocument: state.customerDocument,
      setCustomerDocument: state.setCustomerDocument,

      // Gestor & Autorizações (PIN)
      isAuthModalOpen: state.isAuthModalOpen,
      setIsAuthModalOpen: state.setIsAuthModalOpen,
      pendingAction: state.pendingAction,
      setPendingAction: state.setPendingAction,
      requestManagerAction,
      handleManagerAuthorized,
    }),
    [
      state,
      checkout,
      loadingRTC,
      tributosRTC,
      handleCheckoutComRTC,
      requestManagerAction,
      handleManagerAuthorized,
      handleSaveItemEdit,
    ],
  );
}
