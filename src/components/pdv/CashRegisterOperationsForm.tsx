import { ArrowDownRight, ArrowUpRight, ShieldAlert } from 'lucide-react';

interface CashRegisterOperationsFormProps {
  isOpen: boolean;
  actionType: 'SUPPLY' | 'BLEED' | 'CLOSE';
  displayValue: string;
  reason: string;
  isDarkMode: boolean;
  onChangeAction: (action: 'SUPPLY' | 'BLEED' | 'CLOSE') => void;
  onMoneyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReasonChange: (reason: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CashRegisterOperationsForm({
  isOpen,
  actionType,
  displayValue,
  reason,
  isDarkMode,
  onChangeAction,
  onMoneyChange,
  onReasonChange,
  onSubmit,
}: CashRegisterOperationsFormProps) {
  return (
    <div className={`p-8 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <h2 className="text-sm font-black uppercase tracking-wider mb-6 border-b pb-3 border-slate-500/10">
        {!isOpen ? 'Abertura de Caixa (Fundo de Troco)' : 'Movimentações e Fechamento'}
      </h2>

      <form onSubmit={onSubmit} className="space-y-5">
        {isOpen && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              type="button"
              onClick={() => onChangeAction('SUPPLY')}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition cursor-pointer ${
                actionType === 'SUPPLY' ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-slate-500/10 border-slate-500/20 opacity-70'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" /> Suprimento
            </button>
            <button
              type="button"
              onClick={() => onChangeAction('BLEED')}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition ${
                actionType === 'BLEED' ? 'bg-amber-600 border-amber-600 text-white shadow-md' : 'bg-slate-500/10 border-slate-500/20 opacity-70'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" /> Sangria
            </button>
            <button
              type="button"
              onClick={() => onChangeAction('CLOSE')}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition ${
                actionType === 'CLOSE' ? 'bg-rose-600 border-rose-600 text-white shadow-md' : 'bg-slate-500/10 border-slate-500/20 opacity-70'
              }`}
            >
              <ShieldAlert className="w-4 h-4" /> Fechamento Cego
            </button>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold mb-1 opacity-80">
            {isOpen && actionType === 'CLOSE' ? 'Valor Contado em Caixa (Dinheiro)' : 'Valor (R$)'}
          </label>
          <input
            type="text"
            value={displayValue}
            onChange={onMoneyChange}
            placeholder="R$ 0,00"
            required
            className="w-full px-4 py-3 text-base font-mono font-black border rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-500/30 focus:border-indigo-600 outline-none text-emerald-600 dark:text-emerald-400"
          />
        </div>

        {(!isOpen || (actionType !== 'CLOSE')) && (
          <div>
            <label className="block text-xs font-bold mb-1 opacity-80">Motivo / Justificativa</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder={isOpen ? "Ex: Sangria parcial para o cofre" : "Ex: Fundo de troco inicial"}
              className="w-full px-4 py-3 text-xs border rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-500/30 focus:border-indigo-600 outline-none"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/25 transition cursor-pointer"
        >
          {!isOpen ? 'Abrir Turno de Caixa 🚀' : `Confirmar ${actionType === 'CLOSE' ? 'Fechamento Cego de Turno' : actionType} ✓`}
        </button>
      </form>
    </div>
  );
}