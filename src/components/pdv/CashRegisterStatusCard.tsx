import { DollarSign, Unlock, Lock, Coffee, Play } from 'lucide-react';

interface CashRegister {
  id: string;
  operatorName: string;
  openingAmount: string;
  status: 'OPEN' | 'PAUSED' | 'CLOSED';
  pausedAt?: string | null;
}

interface RegisterStatus {
  isOpen: boolean;
  isPaused?: boolean;
  register?: CashRegister;
  salesCount?: number;
}

interface CashRegisterStatusCardProps {
  registerStatus: RegisterStatus | null;
  pauseDuration: string;
  isDarkMode: boolean;
  onRequestPauseAuth: (pauseState: boolean) => void;
}

export function CashRegisterStatusCard({
  registerStatus,
  pauseDuration,
  isDarkMode,
  onRequestPauseAuth,
}: CashRegisterStatusCardProps) {
  const isPaused = registerStatus?.isPaused;
  const isOpen = registerStatus?.isOpen;

  return (
    <div className={`p-6 rounded-3xl border shadow-xl transition-all ${
      isPaused 
        ? 'bg-amber-500/10 border-amber-500/40 shadow-amber-500/10' 
        : isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
            isPaused ? 'bg-amber-500/20 text-amber-600' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          }`}>
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider">Estado do Turno</h3>
            <p className="text-xs opacity-60">Controlo operacional com validação de segurança.</p>
          </div>
        </div>

        {isOpen ? (
          isPaused ? (
            <span className="px-4 py-1.5 bg-amber-500 text-white border border-amber-600 rounded-full flex items-center gap-2 text-xs font-black uppercase tracking-wider shadow-md animate-bounce">
              <Coffee className="w-4 h-4" /> ☕ CAIXA EM PAUSA ({pauseDuration})
            </span>
          ) : (
            <span className="px-3.5 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full flex items-center gap-1.5 text-xs font-extrabold uppercase">
              <Unlock className="w-3.5 h-3.5" /> ABERTO & ATIVO
            </span>
          )
        ) : (
          <span className="px-3.5 py-1 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-full flex items-center gap-1.5 text-xs font-extrabold uppercase">
            <Lock className="w-3.5 h-3.5" /> TURNO FECHADO
          </span>
        )}
      </div>

      {isOpen && registerStatus.register ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-500/10 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-500/5 border border-slate-500/10">
              <span className="font-sans opacity-60 block">Operador Responsável:</span>
              <span className="font-bold text-sm">{registerStatus.register.operatorName || 'Maria da Conceição'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-500/5 border border-slate-500/10">
              <span className="font-sans opacity-60 block">Fundo de Abertura:</span>
              <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">R$ {Number(registerStatus.register.openingAmount).toFixed(2)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-500/5 border border-slate-500/10">
              <span className="font-sans opacity-60 block">Vendas no Turno:</span>
              <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{registerStatus.salesCount || 0} vendas</span>
            </div>
          </div>

          {/* Botão com Chamada de Autorização */}
          <div className="flex gap-2 pt-2">
            {isPaused ? (
              <button
                type="button"
                onClick={() => onRequestPauseAuth(false)}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xl shadow-emerald-600/30 animate-pulse uppercase tracking-wider"
              >
                <Play className="w-4 h-4 fill-white" /> ⚡ Reabrir Caixa (Inserir PIN / Retornar)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onRequestPauseAuth(true)}
                className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md uppercase tracking-wide"
              >
                <Coffee className="w-4 h-4" /> Pausar Caixa (Almoço / Intervalo com PIN) ☕
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="pt-4 border-t border-slate-500/10">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-between">
            <span>🔒 O turno de caixa está encerrado. Informe o valor do fundo de troco para iniciar as vendas.</span>
          </div>
        </div>
      )}
    </div>
  );
}