"use client";

import { ShieldAlert, ArrowRight } from "lucide-react";

interface CashLimitAlertBannerProps {
  currentCashBalance: number;
  limitThreshold?: number; // Ex: R$ 500,00
  onOpenBleedModal: () => void;
  isDarkMode: boolean;
}

export function CashLimitAlertBanner({
  currentCashBalance,
  limitThreshold = 500.0,
  onOpenBleedModal,
  isDarkMode,
}: CashLimitAlertBannerProps) {
  // Só exibe o alerta se o dinheiro em espécie ultrapassar o limite estabelecido
  if (currentCashBalance < limitThreshold) {
    return null;
  }

  return (
    <div
      className={`w-full p-3 px-4 rounded-2xl border shadow-md flex items-center justify-between gap-4 animate-bounce-subtle transition-colors ${
        isDarkMode
          ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
          : "bg-amber-50 border-amber-300 text-amber-900"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider">
            ⚠️ Limite de Espécie Atingido na Gaveta!
          </h4>
          <p className="text-[11px] opacity-80">
            Gaveta com{" "}
            <span className="font-bold font-mono">
              {currentCashBalance.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>{" "}
            em dinheiro vivo (Limite:{" "}
            {limitThreshold.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            ). Recomenda-se realizar uma sangria de segurança.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenBleedModal}
        className="shrink-0 font-black text-xs bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl shadow-md inline-flex items-center gap-1.5 transition cursor-pointer"
      >
        Fazer Sangria <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
