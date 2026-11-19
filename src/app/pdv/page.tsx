"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { AppHeader } from "@/components/AppHeader";
import { ToastContainer } from "@/components/ToastContainer";
import { CommandMenu } from "@/components/CommandMenu";
import { useToast } from "@/features/dashboard/hooks/useToast";
import { usePDV } from "@/hooks/usePDV";
import { usePDVShortcuts } from "@/hooks/pdv/usePDVShortcuts";
import { useProductSearchKeyboard } from "@/hooks/pdv/useProductSearchKeyboard";
import { useCheckoutPanel } from "@/hooks/pdv/useCheckoutPanel";
import { PDV_TEXTS } from "@/constants/pdvConstants";
import { PDVLoadingState } from "@/components/pdv/states/PDVLoadingState";
import { PDVClosedState } from "@/components/pdv/states/PDVClosedState";
import { PDVPausedState } from "@/components/pdv/states/PDVPausedState";
import { PDVActiveState } from "@/components/pdv/states/PDVActiveState";
import { SuccessModal } from "@/components/pdv/SuccessModal";
import {
  Coffee,
  Keyboard,
  ArrowUpRight,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

const subscribeToHydration = () => () => {};

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

function Kbd({ children, dark }: { children: React.ReactNode; dark: boolean }) {
  return (
    <kbd
      className={`ml-1 inline-flex h-5 min-w-[1.75rem] items-center justify-center rounded-md border px-1.5 font-mono text-[10px] font-semibold ${
        dark
          ? "border-slate-700 bg-slate-950 text-slate-400"
          : "border-slate-200 bg-white text-slate-500"
      }`}
    >
      {children}
    </kbd>
  );
}

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

  if (!mounted || pdv.registerLoading) {
    return <PDVLoadingState isDarkMode={isDarkMode} />;
  }

  const status = pdv.isPaused
    ? {
        label: "Pausado",
        dot: "bg-amber-500",
        tone: "text-amber-700 dark:text-amber-400 bg-amber-500/10 ring-amber-500/20",
      }
    : pdv.isRegisterOpen
      ? {
          label: "Caixa aberto",
          dot: "bg-emerald-500",
          tone: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
        }
      : {
          label: "Caixa fechado",
          dot: "bg-slate-400",
          tone: "text-slate-600 dark:text-slate-300 bg-slate-500/10 ring-slate-500/20",
        };

  return (
    <div
      className={`min-h-screen lg:h-dvh lg:overflow-hidden lg:flex lg:flex-col antialiased transition-colors duration-300 ${
        isDarkMode
          ? "dark bg-slate-950 text-slate-100"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="shrink-0 relative z-30">
        <AppHeader
          title={PDV_TEXTS.title}
          subtitle={PDV_TEXTS.subtitle}
          onOpenCmd={() => setIsCmdOpen(true)}
          hideQuotationButton={true}
        />
      </div>

      <main className="relative z-20 mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-1 lg:min-h-0 lg:overflow-hidden lg:px-8">
        {/* Barra do terminal — marca, estado e ações numa única linha */}
        <section
          className={`shrink-0 flex flex-col gap-3 rounded-2xl border px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_16px_-8px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:justify-between ${
            isDarkMode
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200/80 bg-white"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
              <div className="h-10 w-10 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200 dark:ring-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-melo.png"
                  alt="Melo Perfumaria"
                  className="h-full w-full object-cover"
                />
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white dark:ring-slate-900 ${status.dot}`}
              />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Melo Perfumaria
              </p>
              <h2 className="truncate text-base font-semibold tracking-tight">
                Frente de Caixa
              </h2>
            </div>

            <div className="ml-2 hidden items-center gap-2 md:flex">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${status.tone}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                {pdv.isOperator ? "Operador de Caixa" : "Acesso limitado"}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link
              href="/"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Início
            </Link>

            <button
              type="button"
              onClick={handleOpenShortcuts}
              aria-label={PDV_TEXTS.ariaShortcuts}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Keyboard className="h-4 w-4 text-slate-400" />
              <span className="hidden sm:inline">
                {PDV_TEXTS.shortcutsGuide}
              </span>
              <Kbd dark={isDarkMode}>F1</Kbd>
            </button>

            <a
              href="/pdv/caixa"
              aria-label={PDV_TEXTS.ariaShift}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              <Coffee className="h-4 w-4" />
              <span>{PDV_TEXTS.shiftManagement}</span>
              <kbd className="ml-1 rounded-md bg-emerald-700/60 px-1.5 py-0.5 font-mono text-[10px]">
                F6
              </kbd>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
            </a>
          </div>
        </section>

        {/* Área de trabalho — o PDVActiveState renderiza as duas colunas */}
        <div className="w-full flex-1 min-h-0 overflow-hidden">
          {!pdv.isRegisterOpen ? (
            <PDVClosedState isDarkMode={isDarkMode} />
          ) : pdv.isPaused ? (
            <PDVPausedState isDarkMode={isDarkMode} />
          ) : (
            <PDVActiveState
              pdv={pdv}
              isDarkMode={isDarkMode}
              productSearchKeyboard={productSearchKeyboard}
              checkoutPanel={checkoutPanel}
            />
          )}
        </div>
      </main>

      <ManagerAuthModal
        isOpen={pdv.isAuthModalOpen}
        onClose={handleCloseAuthModal}
        onAuthorized={pdv.handleManagerAuthorized}
        isDarkMode={isDarkMode}
      />
      <PDVShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={handleCloseShortcuts}
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
        onClose={() => setIsCmdOpen(false)}
        isDarkMode={isDarkMode}
        latestQuotationId=""
      />
    </div>
  );
}
