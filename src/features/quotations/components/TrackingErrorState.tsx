'use client';

import Link from 'next/link';

interface TrackingErrorStateProps {
  message: string;
  isDarkMode: boolean;
}

export function TrackingErrorState({ message, isDarkMode }: TrackingErrorStateProps) {
  return (
    <main className={`min-h-screen p-6 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`} role="alert" aria-live="polite">
      <div className="mx-auto max-w-5xl space-y-4">
        <Link href="/cotacoes" className="text-xs font-semibold text-slate-500 hover:text-indigo-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500">
          ← Voltar para cotações
        </Link>
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {message}
        </p>
      </div>
    </main>
  );
}