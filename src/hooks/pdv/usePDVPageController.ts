"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { useToast } from "@/features/dashboard/hooks/useToast";
import { usePDV } from "@/hooks/usePDV";
import { usePDVShortcuts } from "@/hooks/pdv/usePDVShortcuts";
import { useCheckoutPanel } from "@/hooks/pdv/useCheckoutPanel";
import { useProductSearchKeyboard } from "@/hooks/pdv/useProductSearchKeyboard";

const subscribeToHydration = () => () => {};

export function usePDVPageController() {
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const { toasts } = useToast();
  const pdv = usePDV();
  const productSearchKeyboard = useProductSearchKeyboard({
    searchTerm: pdv.searchTerm,
    setSearchTerm: pdv.setSearchTerm,
    filteredProducts: pdv.filteredProducts,
    onSelectProduct: pdv.handleAddToCart,
    onKeyDown: pdv.handleKeyDown,
  });
  const checkoutPanel = useCheckoutPanel({
    totalCart: pdv.totalCart,
    loading: pdv.loading,
    onCheckout: pdv.handleCheckout,
  });

  const handleOpenShortcuts = useCallback(() => setIsShortcutsOpen(true), []);
  const handleCloseShortcuts = useCallback(() => setIsShortcutsOpen(false), []);
  const handleCloseAuthModal = useCallback(() => {
    pdv.setIsAuthModalOpen(false);
    pdv.setPendingAction(null);
  }, [pdv]);

  usePDVShortcuts({
    onOpenShortcuts: handleOpenShortcuts,
    onCloseShortcuts: handleCloseShortcuts,
    onCheckout: pdv.handleCheckout,
    isRegisterOpen: pdv.isRegisterOpen,
    isPaused: pdv.isPaused,
    cartLength: pdv.cart.length,
    loading: pdv.loading,
  });

  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  return {
    pdv,
    productSearchKeyboard,
    checkoutPanel,
    isShortcutsOpen,
    isCmdOpen,
    toasts,
    mounted,
    handleOpenShortcuts,
    handleCloseShortcuts,
    handleCloseAuthModal,
    setIsCmdOpen,
  };
}
