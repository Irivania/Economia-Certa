export function ComparisonLoadingState({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className={`min-h-screen flex items-center justify-center text-xs font-medium ${isDarkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-500'}`} aria-live="polite" aria-busy="true">
      Carregando mapa comparativo...
    </div>
  );
}