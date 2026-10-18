'use client';

import { Lock } from 'lucide-react';

interface PDVOpeningModalProps {
  openingDisplayValue: string;
  onOpeningChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isDarkMode: boolean;
}

export function PDVOpeningModal({
  openingDisplayValue,
  onOpeningChange,
  onSubmit,
  isDarkMode,
}: PDVOpeningModalProps) {
  return (
    <div className={`max-w-md mx-auto p-8 rounded-3xl border shadow-2xl space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl font-bold border border-amber-500/20">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-black uppercase tracking-wider">Abertura Obrigatória de Caixa</h3>
        <p className="text-xs opacity-60">Para iniciar os atendimentos e passar compras, informe o fundo de troco inicial do seu turno (com centavos).</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1 opacity-80">Valor de Fundo de Troco (R$)</label>
          <input
            type="text"
            placeholder="R$ 0,00"
            value={openingDisplayValue}
            onChange={onOpeningChange}
            className="w-full px-4 py-3.5 text-base font-mono font-black border rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-500/30 focus:border-indigo-600 outline-none text-emerald-600 dark:text-emerald-400"
            autoFocus
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/25 transition cursor-pointer"
        >
          Abrir Caixa e Iniciar Operações 🚀
        </button>
      </form>
    </div>
  );
}