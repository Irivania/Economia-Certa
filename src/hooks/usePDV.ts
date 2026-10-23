'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { usePDVState } from './pdv/usePDVState';
import { usePDVCheckout } from './pdv/usePDVCheckout';

interface PDVFeedback {
  showToast: (message: string, type: 'success' | 'error' | 'warning') => void;
}

export function usePDV() {
  const state = usePDVState();
  const checkout = usePDVCheckout({
    companyId: state.companyId,
    cart: state.cart,
    setCart: state.setCart,
    customerName: state.customerName,
    setCustomerName: state.setCustomerName,
    selectedPartnerId: state.selectedPartnerId,
    setSelectedPartnerId: state.setSelectedPartnerId,
    partners: state.partners,
    totalCart: state.totalCart,
    searchInputRef: state.searchInputRef,
    loadData: state.loadData,
  });

  // Feedback visual padronizado
  const notify: PDVFeedback['showToast'] = useCallback((message, type) => {
    if (type === 'error') {
      console.error(`[PDV Error]: ${message}`);
    } else {
      console.log(`[PDV Info]: ${message}`);
    }
    window.alert(message);
  }, []);

  // useCallback memoizado para remoção e edição de itens com validações estritas
  const requestManagerAction = useCallback((type: 'REMOVE' | 'EDIT', productId: string) => {
    if (!productId || typeof productId !== 'string') return;
    state.setPendingAction({ type, productId });
    state.setIsAuthModalOpen(true);
  }, [state]);

  // useCallback memoizado para autorização do gerente
  const handleManagerAuthorized = useCallback(() => {
    if (!state.pendingAction) return;

    const { type, productId } = state.pendingAction;
    if (type === 'REMOVE') {
      state.setCart((prev) => prev.filter((item) => item.productId !== productId));
    } else if (type === 'EDIT') {
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
  const handleSaveItemEdit = useCallback((productId: string) => {
    const newPrice = Number(state.editPrice);
    const newQty = Number(state.editQty);

    if (!Number.isFinite(newPrice) || newPrice < 0 || !Number.isFinite(newQty) || newQty <= 0) {
      notify('Valores inválidos para preço ou quantidade.', 'error');
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
      })
    );
    state.setEditingProductId(null);
  }, [state, notify]);

  // useCallback memoizado para o handler global de finalização (F10)
  const handleF10Shortcut = useCallback(() => {
    if (state.cart.length > 0 && state.isRegisterOpen && !state.isPaused) {
      checkout.handleCheckout();
    }
  }, [state.cart.length, state.isRegisterOpen, state.isPaused, checkout]);

  // Centralização robusta de atalhos
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'F10') {
      e.preventDefault();
      handleF10Shortcut();
    }
  }, [handleF10Shortcut]);

  // useEffect limpo com dependências estáveis
  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleGlobalKeyDown]);

  // Organização do retorno limpa e escalável
  return useMemo(() => ({
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

    // Pagamento & Checkout
    paymentMethod: checkout.paymentMethod,
    setPaymentMethod: checkout.setPaymentMethod,
    loading: checkout.loading,
    handleCheckout: checkout.handleCheckout,

    // Parceiros & Clientes
    partners: state.partners,
    selectedPartnerId: state.selectedPartnerId,
    setSelectedPartnerId: state.setSelectedPartnerId,
    customerName: state.customerName,
    setCustomerName: state.setCustomerName,

    // Gestor & Autorizações (PIN)
    isAuthModalOpen: state.isAuthModalOpen,
    setIsAuthModalOpen: state.setIsAuthModalOpen,
    pendingAction: state.pendingAction,
    setPendingAction: state.setPendingAction,
    requestManagerAction,
    handleManagerAuthorized,
  }), [state, checkout, requestManagerAction, handleManagerAuthorized, handleSaveItemEdit]);
}