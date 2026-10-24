'use client';

interface TrackingLoadingStateProps {
  isDarkMode: boolean;
}

export function TrackingLoadingState({ isDarkMode }: TrackingLoadingStateProps) {
  return (
    <main
      className={`flex min-h-screen items-center justify-center text-xs font-medium ${
        isDarkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-500'
      }`}
      role="status"
      aria-live="polite"
    >
      Carregando encaminhamento...
    </main>
  );
}