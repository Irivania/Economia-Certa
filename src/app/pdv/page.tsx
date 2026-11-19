"use client";

import { useTheme } from "@/context/ThemeContext";
import { AppHeader } from "@/components/AppHeader";
import { usePDVPageController } from "@/hooks/pdv/usePDVPageController";
import { PDV_TEXTS } from "@/constants/pdvConstants";
import { PDVLoadingState } from "@/components/pdv/states/PDVLoadingState";
import { PDVWorkArea } from "@/components/pdv/PDVWorkArea";
import { PDVOverlays } from "@/components/pdv/PDVOverlays";

export default function PDVPage() {
  const { isDarkMode } = useTheme();
  const controller = usePDVPageController();
  const {
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
  } = controller;

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
