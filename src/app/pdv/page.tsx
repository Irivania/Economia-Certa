"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import { useTheme } from "@/context/ThemeContext";
import { AppHeader } from "@/components/AppHeader";
import { useToast } from "@/features/dashboard/hooks/useToast";
import { usePDV } from "@/hooks/usePDV";
import { usePDVShortcuts } from "@/hooks/pdv/usePDVShortcuts";
import { useProductSearchKeyboard } from "@/hooks/pdv/useProductSearchKeyboard";
import { useCheckoutPanel } from "@/hooks/pdv/useCheckoutPanel";
import { PDV_TEXTS } from "@/constants/pdvConstants";
import { PDVLoadingState } from "@/components/pdv/states/PDVLoadingState";
import { PDVWorkArea } from "@/components/pdv/PDVWorkArea";
import { PDVOverlays } from "@/components/pdv/PDVOverlays";

const subscribeToHydration = () => () => {};

export default function PDVPage() {
  const { isDarkMode } = useTheme();
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

  if (!mounted) {
    return <PDVLoadingState isDarkMode={isDarkMode} />;
  }

  return (
    <>
      <div className="shrink-0 relative z-30">
        <AppHeader
          title={PDV_TEXTS.title}
          subtitle={PDV_TEXTS.subtitle}
          onOpenCmd={() => setIsCmdOpen(true)}
          hideQuotationButton={true}
        />
      </div>

      <PDVWorkArea
        pdv={pdv}
        isDarkMode={isDarkMode}
        productSearchKeyboard={productSearchKeyboard}
        checkoutPanel={checkoutPanel}
        onOpenShortcuts={handleOpenShortcuts}
      />
      <PDVOverlays
        pdv={pdv}
        isDarkMode={isDarkMode}
        isShortcutsOpen={isShortcutsOpen}
        isCmdOpen={isCmdOpen}
        toasts={toasts}
        onCloseAuthModal={handleCloseAuthModal}
        onCloseShortcuts={handleCloseShortcuts}
        onCloseCommandMenu={() => setIsCmdOpen(false)}
      />
    </>
  );
}
