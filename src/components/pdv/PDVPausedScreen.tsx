'use client';

import Link from 'next/link';
import { Coffee } from 'lucide-react';

interface PDVPausedScreenProps {
  isDarkMode: boolean;
}

export function PDVPausedScreen({ isDarkMode }: PDVPausedScreenProps) {
  return (
    <div className={`max-w-md mx-auto p-12 text-center rounded-3xl border shadow-2xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <Coffee className="w-12 h-12 mx-auto text-amber-500 animate-bounce" />
      <h3 className="text-base font-black uppercase tracking-wider">Caixa Pausado (Intervalo)</h3>
      <p className="text-xs opacity-60">O atendimento está temporariamente suspenso para almoço/café.</p>
      <Link
        href="/pdv/caixa"
        className="inline-block mt-4 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg transition"
      >
        Retornar ao Atendimento na Gestão de Caixa &rarr;
      </Link>
    </div>
  );
}