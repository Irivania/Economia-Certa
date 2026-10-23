'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
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
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title={PDV_TEXTS.title}
        subtitle={PDV_TEXTS.subtitle}
        onOpenCmd={() => {}}
      />

      <main className="max-w-7xl mx-auto px-6 -mt-8 pb-20 relative z-20 space-y-6">
        <div className="flex justify-between items-center">
          {!pdv.isOperator ? (
            <Link
              href="/"
              aria-label={PDV_TEXTS.ariaBackHome}
              className="font-bold text-xs bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              &larr; {PDV_TEXTS.backHome}
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-black uppercase tracking-wider shadow-md" role="status">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              ⚡ {PDV_TEXTS.terminalLabel}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenShortcuts}
              aria-label={PDV_TEXTS.ariaShortcuts}
              className="font-black text-xs bg-white text-indigo-700 hover:bg-slate-100 px-4 py-2.5 rounded-xl border border-white/40 shadow-md inline-flex items-center gap-1.5 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              ⌨️ {PDV_TEXTS.shortcutsGuide}
            </button>

            <Link
              href="/pdv/caixa"
              aria-label={PDV_TEXTS.ariaShift}
              className="font-black text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-md inline-flex items-center gap-1.5 transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <Coffee className="w-3.5 h-3.5" aria-hidden="true" /> {PDV_TEXTS.shiftManagement} 💵
            </Link>
          </div>
        </div>

        {!pdv.isRegisterOpen ? (
          <PDVClosedState isDarkMode={isDarkMode} />
        ) : pdv.isPaused ? (
          <PDVPausedState isDarkMode={isDarkMode} />
        ) : (
          <PDVActiveState pdv={pdv} isDarkMode={isDarkMode} />
        )}
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