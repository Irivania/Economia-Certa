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
import { PDV_TEXTS } from "@/constants/pdvConstants";
import { PDVLoadingState } from "@/components/pdv/states/PDVLoadingState";
import { PDVClosedState } from "@/components/pdv/states/PDVClosedState";
import { PDVPausedState } from "@/components/pdv/states/PDVPausedState";
import { PDVActiveState } from "@/components/pdv/states/PDVActiveState";
import { SuccessModal } from "@/components/pdv/SuccessModal";
import {
  Coffee,
  Keyboard,
  Sparkles,
  CircleDot,
  ArrowUpRight,
  ArrowLeft,
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

export default function PDVPage() {
  const { isDarkMode } = useTheme();
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const { toasts } = useToast();

  const pdv = usePDV();

  const handleOpenShortcuts = useCallback(() => {
    setIsShortcutsOpen(true);
  }, []);

  const handleCloseShortcuts = useCallback(() => {
    setIsShortcutsOpen(false);
  }, []);

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

  return (
    <div
      className={`min-h-screen lg:h-dvh lg:overflow-hidden lg:flex lg:flex-col transition-colors duration-300 ${
        isDarkMode
          ? "bg-[#09090f] text-slate-100"
          : "bg-[#f5f6fa] text-slate-900"
      }`}
    >
      {/* 1. CABEÇALHO GLOBAL DO ERP */}
      <div className="shrink-0 relative z-30">
        <AppHeader
          title={PDV_TEXTS.title}
          subtitle={PDV_TEXTS.subtitle}
          onOpenCmd={() => setIsCmdOpen(true)}
          hideQuotationButton={true}
        />
      </div>

      <main className="w-full max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-7 mt-3 pb-3 relative z-25 space-y-3 lg:flex lg:flex-1 lg:min-h-0 lg:flex-col lg:overflow-hidden">
        {/* 2. BANNER DE BRANDING DA MELO PERFUMARIA */}
        <section
          className={`shrink-0 rounded-2xl border px-4 py-2.5 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm transition-colors ${
            isDarkMode
              ? "bg-gradient-to-r from-[#1b1429] via-[#151321] to-[#11111a] border-purple-900/40 text-white"
              : "bg-gradient-to-r from-white via-purple-50/70 to-pink-50/60 border-purple-100 text-slate-900"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-purple-400/40 shadow-lg shadow-purple-500/10 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-melo.png"
                  alt="Melo Perfumaria"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#171321]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-purple-600 dark:text-purple-400 uppercase">
                  MELO PERFUMARIA{" "}
                  <span className="text-slate-400 dark:text-slate-500">•</span>{" "}
                  FRENTE DE CAIXA
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-lg border border-purple-500/20">
                  Caixa Livre
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-[10px] uppercase tracking-wider text-slate-700 dark:text-slate-200 transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao Início
            </Link>
          </div>
        </section>

        {/* 3. BARRA DE FERRAMENTAS DO TERMINAL */}
        <section className="shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-2 bg-white/80 dark:bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`hidden sm:flex w-8 h-8 rounded-lg items-center justify-center shrink-0 ${
                isDarkMode
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wide truncate">
              Terminal de Vendas
            </h3>

            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                  pdv.isRegisterOpen && !pdv.isPaused
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                }`}
              >
                <CircleDot className="w-3 h-3" />
                {pdv.isPaused
                  ? "Pausado"
                  : pdv.isRegisterOpen
                    ? "Caixa aberto"
                    : "Caixa fechado"}
              </span>
              <span
                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-700 text-slate-300"
                    : "bg-slate-100 border-slate-200 text-slate-600"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                {pdv.isOperator ? "Operador de Caixa" : "Acesso limitado"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto">
            <button
              type="button"
              onClick={handleOpenShortcuts}
              aria-label={PDV_TEXTS.ariaShortcuts}
              className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Keyboard className="w-4 h-4 text-purple-500" />
              <span className="hidden sm:inline">
                {PDV_TEXTS.shortcutsGuide}
              </span>
              <span>[F1]</span>
            </button>

            <a
              href="/pdv/caixa"
              aria-label={PDV_TEXTS.ariaShift}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Coffee className="w-4 h-4" />
              <span>{PDV_TEXTS.shiftManagement}</span>
              <span>[F6]</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </section>

        {/* 5. RENDERIZAÇÃO LIMPA DO ESTADO ATIVO DO PDV */}
        <div className="w-full flex-1 min-h-0 overflow-hidden">
          {!pdv.isRegisterOpen ? (
            <PDVClosedState isDarkMode={isDarkMode} />
          ) : pdv.isPaused ? (
            <PDVPausedState isDarkMode={isDarkMode} />
          ) : (
            <PDVActiveState pdv={pdv} isDarkMode={isDarkMode} />
          )}
        </div>
      </main>

      {/* MODAIS E SUPORTE */}
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
