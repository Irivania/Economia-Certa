"use client";

import { PDVTerminalBar } from "@/components/pdv/PDVTerminalBar";
import { PDVLoadingState } from "@/components/pdv/states/PDVLoadingState";
import { PDVClosedState } from "@/components/pdv/states/PDVClosedState";
import { PDVPausedState } from "@/components/pdv/states/PDVPausedState";
import { PDVActiveState } from "@/components/pdv/states/PDVActiveState";
import { useCheckoutPanel } from "@/hooks/pdv/useCheckoutPanel";
import { usePDV } from "@/hooks/usePDV";
import { useProductSearchKeyboard } from "@/hooks/pdv/useProductSearchKeyboard";

interface PDVWorkAreaProps {
  pdv: ReturnType<typeof usePDV>;
  isDarkMode: boolean;
  productSearchKeyboard: ReturnType<typeof useProductSearchKeyboard>;
  checkoutPanel: ReturnType<typeof useCheckoutPanel>;
  onOpenShortcuts: () => void;
}

export function PDVWorkArea({
  pdv,
  isDarkMode,
  productSearchKeyboard,
  checkoutPanel,
  onOpenShortcuts,
}: PDVWorkAreaProps) {
  if (pdv.registerLoading) {
    return <PDVLoadingState isDarkMode={isDarkMode} />;
  }

  return (
    <div
      className={`min-h-screen lg:h-dvh lg:overflow-hidden lg:flex lg:flex-col antialiased transition-colors duration-300 ${
        isDarkMode
          ? "dark bg-slate-950 text-slate-100"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <main className="relative z-20 mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-1 lg:min-h-0 lg:overflow-hidden lg:px-8">
        <PDVTerminalBar
          isRegisterOpen={pdv.isRegisterOpen}
          isPaused={pdv.isPaused}
          isOperator={pdv.isOperator}
          isDarkMode={isDarkMode}
          onOpenShortcuts={onOpenShortcuts}
        />
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
    </div>
  );
}
