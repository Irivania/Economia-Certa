'use client';

interface FinanceStatsCardsProps {
  totalPendente: number;
  totalVencido: number;
  isDarkMode: boolean;
}

export function FinanceStatsCards({ totalPendente, totalVencido, isDarkMode }: FinanceStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className={`p-6 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <span className="text-xs uppercase font-extrabold opacity-60">Total a Pagar (Pendente)</span>
        <div className="text-2xl font-black font-mono mt-1 text-amber-600 dark:text-amber-400">
          R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <p className="text-[11px] opacity-50 mt-1">Soma de todos os boletos em aberto.</p>
      </div>

      <div className={`p-6 rounded-3xl border shadow-xl ${totalVencido > 0 ? (isDarkMode ? 'bg-rose-950/30 border-rose-900/60' : 'bg-rose-50 border-rose-200') : (isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}`}>
        <span className="text-xs uppercase font-extrabold opacity-60">Títulos Vencidos</span>
        <div className="text-2xl font-black font-mono mt-1 text-rose-600 dark:text-rose-400">
          R$ {totalVencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <p className="text-[11px] opacity-50 mt-1">Requer atenção imediata para evitar juros.</p>
      </div>
    </div>
  );
}