"use client";

import { useState, useSyncExternalStore } from "react";
import { useTheme } from "@/context/ThemeContext";
import { AppHeader } from "@/components/AppHeader";
import { ToastContainer } from "@/components/ToastContainer";
import { CommandMenu } from "@/components/CommandMenu";
import { CashbackManager } from "@/components/portal/CashbackManager";
import { useToast } from "@/features/dashboard/hooks/useToast";

const subscribeToHydration = () => () => {};

export default function CashbackPage() {
  const { isDarkMode } = useTheme();
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const { toasts } = useToast();

  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div
        className="min-h-screen bg-slate-50 dark:bg-slate-950"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}
    >
      <AppHeader
        title="Economia Certa"
        subtitle="Gestão inteligente de campanhas e fidelização de clientes."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-20 relative z-25">
        <CashbackManager />
      </main>

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
