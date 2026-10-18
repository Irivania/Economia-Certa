'use client';

import { X, FileText, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';

interface TransactionItem {
  id: string;
  type: string;
  amount: string | number;
  reason: string | null;
  operatorName: string;
  createdAt: string;
}

interface SaleItem {
  id: string;
  total: string | number;
  paymentMethod: string;
  createdAt: string;
}

interface CashRegisterStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: TransactionItem[];
  sales: SaleItem[];
  operatorName: string;
  openingAmount: string | number;
  isDarkMode: boolean;
}

export function CashRegisterStatementModal({
  isOpen,
  onClose,
  transactions,
  sales,
  operatorName,
  openingAmount,
  isDarkMode,
}: CashRegisterStatementModalProps) {
  if (!isOpen) return null;

  const formatMoney = (val: number | string) => Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className={`w-full max-w-2xl p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 relative ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-500/10 hover:bg-slate-500/20 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 border-b pb-4 border-slate-500/10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-wider">Extrato Cronológico do Turno</h3>
            <p className="text-xs opacity-60 font-mono">Operador: {operatorName} • Fundo Inicial: {formatMoney(openingAmount)}</p>
          </div>
        </div>

        {/* Listagem Cronológica de Transações */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider opacity-70 mb-2">Movimentações de Caixa (Sangrias, Suprimentos e Abertura)</h4>
            {transactions.length === 0 ? (
              <p className="text-xs opacity-40 italic">Nenhuma movimentação registada além da abertura.</p>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                {transactions.map((tx) => {
                  const isSupply = tx.type === 'SUPPLY' || tx.type === 'OPENING';
                  return (
                    <div key={tx.id} className="p-3 rounded-xl border border-slate-500/10 bg-slate-500/5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                          isSupply ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {isSupply ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold font-sans">
                            {tx.type === 'OPENING' ? 'Fundo de Abertura' : tx.type === 'SUPPLY' ? 'Suprimento de Caixa' : 'Sangria de Segurança'}
                          </div>
                          <div className="text-[10px] opacity-65">{tx.reason || 'Sem justificativa'} • {new Date(tx.createdAt).toLocaleTimeString('pt-BR')}</div>
                        </div>
                      </div>
                      <div className={`font-bold ${isSupply ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {isSupply ? '+' : '-'} {formatMoney(tx.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider opacity-70 mb-2">Vendas Realizadas no Turno ({sales.length})</h4>
            {sales.length === 0 ? (
              <p className="text-xs opacity-40 italic">Nenhuma venda registada neste turno ainda.</p>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                {sales.map((sale) => (
                  <div key={sale.id} className="p-3 rounded-xl border border-slate-500/10 bg-slate-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold font-sans">Venda ID: {sale.id.substring(0, 8)}...</div>
                        <div className="text-[10px] opacity-65">Método: {sale.paymentMethod} • {new Date(sale.createdAt).toLocaleTimeString('pt-BR')}</div>
                      </div>
                    </div>
                    <div className="font-bold text-indigo-600 dark:text-indigo-400">
                      + {formatMoney(sale.total)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="pt-4 border-t border-slate-500/15 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition cursor-pointer"
          >
            Fechar Extrato ✓
          </button>
        </div>
      </div>
    </div>
  );
}