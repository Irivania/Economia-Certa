'use client';

import Link from 'next/link';
import { Lock, Unlock, Coffee } from 'lucide-react';

interface PDVRegisterStatusBarProps {
  isRegisterOpen: boolean;
  isPaused: boolean;
  operatorName?: string;
  openingAmount?: string;
  isDarkMode: boolean;
}

export function PDVRegisterStatusBar({
  isRegisterOpen,
  isPaused,
  operatorName = 'Operador',
  openingAmount = '0',
  isDarkMode,
}: PDVRegisterStatusBarProps) {
  return (
    <div className={`p-4 sm:p-5 rounded-2xl border shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
          !isRegisterOpen ? 'bg-rose-500/10 text-rose-500' : isPaused ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
        }`}>
          {!isRegisterOpen ? <Lock className="w-5 h-5" /> : isPaused ? <Coffee className="w-5 h-5 animate-bounce" /> : <Unlock className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-black uppercase tracking-wider">Estado do Caixa:</h4>
            {!isRegisterOpen ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/10 text-rose-500 uppercase">Fechado</span>
            ) : isPaused ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/10 text-amber-500 uppercase">Pausado (Almoço/Café)</span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 uppercase">Aberto & Ativo</span>
            )}
          </div>
          <p className="text-[11px] opacity-60 font-mono mt-0.5">
            {isRegisterOpen ? `Operador: ${operatorName} • Fundo: R$ ${Number(openingAmount).toFixed(2)}` : 'Turno encerrado. Necessária abertura.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <Link
          href="/pdv/caixa"
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md transition flex items-center gap-1.5"
        >
          <Coffee className="w-3.5 h-3.5" /> Gerir Turno / Pausa / Sangria 💵
        </Link>
      </div>
    </div>
  );
}