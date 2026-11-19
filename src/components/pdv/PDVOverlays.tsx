"use client";

import dynamic from "next/dynamic";
import { CommandMenu } from "@/components/CommandMenu";
import { ToastContainer } from "@/components/ToastContainer";
import { SuccessModal } from "@/components/pdv/SuccessModal";
import { usePDV } from "@/hooks/usePDV";

const ManagerAuthModal = dynamic(
  () =>
    import("@/components/pdv/ManagerAuthModal").then(
      (mod) => mod.ManagerAuthModal,
    ),
  { ssr: false, loading: () => null },
);

const PDVShortcutsModal = dynamic(
  () =>
    import("@/components/pdv/PDVShortcutsModal").then(
      (mod) => mod.PDVShortcutsModal,
    ),
  { ssr: false, loading: () => null },
);

interface PDVOverlaysProps {
  pdv: ReturnType<typeof usePDV>;
  isDarkMode: boolean;
  isShortcutsOpen: boolean;
  isCmdOpen: boolean;
  toasts: ReturnType<
    typeof import("@/features/dashboard/hooks/useToast").useToast
  >["toasts"];
  onCloseAuthModal: () => void;
  onCloseShortcuts: () => void;
  onCloseCommandMenu: () => void;
}

export function PDVOverlays({
  pdv,
  isDarkMode,
  isShortcutsOpen,
  isCmdOpen,
  toasts,
  onCloseAuthModal,
  onCloseShortcuts,
  onCloseCommandMenu,
}: PDVOverlaysProps) {
  return (
    <>
      <ManagerAuthModal
        isOpen={pdv.isAuthModalOpen}
        onClose={onCloseAuthModal}
        onAuthorized={pdv.handleManagerAuthorized}
        isDarkMode={isDarkMode}
      />
      <PDVShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={onCloseShortcuts}
        isDarkMode={isDarkMode}
      />
      <SuccessModal
        isOpen={pdv.completedSale !== null}
        saleId={pdv.completedSale?.saleId || ""}
        changeAmount={pdv.completedSale?.change || 0}
        saleData={pdv.completedSale}
        onClose={pdv.clearCompletedSale || (() => {})}
        isDarkMode={isDarkMode}
      />
      <ToastContainer toasts={toasts} isDarkMode={isDarkMode} />
      <CommandMenu
        isOpen={isCmdOpen}
        onClose={onCloseCommandMenu}
        isDarkMode={isDarkMode}
        latestQuotationId=""
      />
    </>
  );
}
