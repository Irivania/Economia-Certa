import React from 'react';

interface DashboardBannerProps {
  isDarkMode: boolean;
  onTestToast: () => void;
  onOpenCmd: () => void;
}

export const DashboardBanner = React.memo(function DashboardBanner({
  isDarkMode,
  onTestToast,
  onOpenCmd,
}: DashboardBannerProps) {
  return (
    <aside 
      aria-label="Dica Profissional e Atalhos"
      className={`p-3.5 rounded-xl border shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
        isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
      }`}
    >
      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 font-bold" aria-hidden="true">💡 Dica Pro</span>
        <span>
          Pressione <kbd className="px-1.5 py-0.5 rounded bg-slate-500/15 font-mono text-[11px] font-semibold">Ctrl + K</kbd> para busca rápida.
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onTestToast}
          aria-label="Testar notificação Toast do WhatsApp"
          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-semibold transition-colors border border-emerald-500/20 cursor-pointer"
        >
          Testar Toast WhatsApp 📲
        </button>
        <button 
          type="button"
          onClick={onOpenCmd}
          aria-label="Abrir menu de comandos rápidos"
          className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 cursor-pointer"
        >
          Abrir Menu &rarr;
        </button>
      </div>
    </aside>
  );
});