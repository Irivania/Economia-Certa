'use client';

interface EditQuotationLoadingStateProps {
  isDarkMode: boolean;
}

export function EditQuotationLoadingState({ isDarkMode }: EditQuotationLoadingStateProps) {
  return (
    <div
      className={`min-h-screen flex items-center justify-center text-xs font-medium ${isDarkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-500'}`}
      role="status"
      aria-live="polite"
    >
      Carregando cotação...
    </div>
  );
}