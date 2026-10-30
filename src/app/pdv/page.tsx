'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { usePDV } from '@/hooks/usePDV';
import { usePDVShortcuts } from '@/hooks/pdv/usePDVShortcuts';
import { PDV_TEXTS } from '@/constants/pdvConstants';
import { PDVLoadingState } from '@/components/pdv/states/PDVLoadingState';
import { PDVClosedState } from '@/components/pdv/states/PDVClosedState';
import { PDVPausedState } from '@/components/pdv/states/PDVPausedState';
import { PDVActiveState } from '@/components/pdv/states/PDVActiveState';
import { Coffee } from 'lucide-react';

const ManagerAuthModal = dynamic(
  () => import('@/components/pdv/ManagerAuthModal').then((mod) => mod.ManagerAuthModal),
  { ssr: false, loading: () => null }
);

const PDVShortcutsModal = dynamic(
  () => import('@/components/pdv/PDVShortcutsModal').then((mod) => mod.PDVShortcutsModal),
  { ssr: false, loading: () => null }
);

export default function PDVPage() {
  const { isDarkMode } = useTheme();
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

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

  if (pdv.registerLoading) {
    return <PDVLoadingState isDarkMode={isDarkMode} />;
  }

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="shrink-0">
        <AppHeader
          title={PDV_TEXTS.title}
          subtitle={PDV_TEXTS.subtitle}
          onOpenCmd={() => {}}
          hideQuotationButton={true} // Oculta o botão de cotação no PDV
        />
      </div>

      <main className="max-w-7xl w-full mx-auto px-6 py-3 flex-1 flex flex-col justify-start relative z-20 space-y-3 overflow-hidden">
        
        {/* 🌸 Banner de Branding da Melo Perfumaria (Tamanho Equilibrado e Sofisticado) */}
        <div className={`shrink-0 rounded-2xl p-3 px-5 border shadow-sm flex items-center justify-between transition-colors ${
          isDarkMode 
            ? 'bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border-purple-900/50 text-white' 
            : 'bg-gradient-to-r from-purple-50 via-white to-pink-50/40 border-purple-200/60 text-slate-900'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/50 shadow-md shrink-0 bg-purple-950 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-melo.png" alt="Melo Perfumaria" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Melo Perfumaria • Frente de Caixa
              </h2>
              <p className="text-[11px] opacity-75 italic font-medium">
                &ldquo;Beleza que te faz bem!&rdquo; 💖
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono font-bold px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 shadow-sm">
            <span>⚡ Caixa Ativo</span>
          </div>
        </div>

        {/* Barra de Ações Rápidas do Operador */}
        <div className="flex justify-end items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenShortcuts}
              aria-label={PDV_TEXTS.ariaShortcuts}
              className="font-black text-xs bg-white text-indigo-700 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-white/40 shadow-md inline-flex items-center gap-1.5 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              ⌨️ {PDV_TEXTS.shortcutsGuide}
            </button>

            <a
              href="/pdv/caixa"
              aria-label={PDV_TEXTS.ariaShift}
              className="font-black text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl shadow-md inline-flex items-center gap-1.5 transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <Coffee className="w-3.5 h-3.5" aria-hidden="true" /> {PDV_TEXTS.shiftManagement} 💵
            </a>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden pb-2">
          {!pdv.isRegisterOpen ? (
            <PDVClosedState isDarkMode={isDarkMode} />
          ) : pdv.isPaused ? (
            <PDVPausedState isDarkMode={isDarkMode} />
          ) : (
            <PDVActiveState pdv={pdv} isDarkMode={isDarkMode} />
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
    </div>
  );
}