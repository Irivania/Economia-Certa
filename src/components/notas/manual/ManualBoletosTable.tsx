'use client';

import { Plus, Trash2 } from 'lucide-react';

interface BoletoManual {
  identifier: string;
  amount: number;
  dueDate: string;
}

interface ManualBoletosTableProps {
  boletos: BoletoManual[];
  onAddBoleto: () => void;
  onRemoveBoleto: (index: number) => void;
  onBoletoChange: (index: number, field: keyof BoletoManual, value: string | number) => void;
  isDarkMode: boolean;
}

export function ManualBoletosTable({
  boletos,
  onAddBoleto,
  onRemoveBoleto,
  onBoletoChange,
  isDarkMode,
}: ManualBoletosTableProps) {
  return (
    <div className={`p-8 rounded-3xl border shadow-xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">3. Contas a Pagar & Vencimento de Boletos</h3>
        <button
          type="button"
          onClick={onAddBoleto}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar Parcela / Boleto
        </button>
      </div>

      <div className="space-y-3">
        {boletos.map((bol, bIdx) => (
          <div key={bIdx} className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-slate-500/5 border border-slate-500/10">
            <div className="flex-1 w-full">
              <input
                type="text"
                value={bol.identifier}
                onChange={(e) => onBoletoChange(bIdx, 'identifier', e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl bg-white dark:bg-slate-950 outline-none font-bold"
              />
            </div>
            
            {/* Input com máscara monetária fluida em Reais */}
            <div className="w-40">
              <input
                type="text"
                placeholder="R$ 0,00"
                value={bol.amount ? `R$ ${Number(bol.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}
                onChange={(e) => {
                  const cleanValue = e.target.value.replace(/\D/g, '');
                  const numericValue = cleanValue ? Number(cleanValue) / 100 : 0;
                  onBoletoChange(bIdx, 'amount', numericValue);
                }}
                required
                className="w-full px-3 py-2 text-xs border rounded-xl bg-white dark:bg-slate-950 outline-none font-mono text-right text-emerald-600 dark:text-emerald-400 font-bold"
              />
            </div>

            <div className="w-48">
              <input
                type="date"
                value={bol.dueDate}
                onChange={(e) => onBoletoChange(bIdx, 'dueDate', e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border rounded-xl bg-white dark:bg-slate-950 outline-none font-mono"
              />
            </div>

            {boletos.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveBoleto(bIdx)}
                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}