'use client';

import { CheckCircle2, Printer, X } from 'lucide-react';

interface SummaryData {
  opening: number | string;
  cashSales: number;
  expected: number;
  counted: number;
  difference: number;
}

interface CashRegisterReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: SummaryData | null;
  operatorName: string;
  isDarkMode: boolean;
}

export function CashRegisterReceiptModal({
  isOpen,
  onClose,
  summary,
  operatorName,
  isDarkMode,
}: CashRegisterReceiptModalProps) {
  if (!isOpen || !summary) return null;

  const openingVal = Number(summary.opening || 0);
  const diffVal = Number(summary.difference || 0);
  const isBalanced = Math.abs(diffVal) < 0.01;
  const isSurplus = diffVal > 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className={`w-full max-w-lg p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 relative ${
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

        {/* Cabeçalho do Recibo */}
        <div className="text-center space-y-2 border-b pb-4 border-slate-500/10">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black uppercase tracking-wider">Comprovativo de Fechamento de Turno</h3>
          <p className="text-xs opacity-60 font-mono">Economia Certa ERP • Auditoria Financeira</p>
        </div>

        {/* Detalhes do Operador e Data */}
        <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-500/5 p-4 rounded-2xl border border-slate-500/10">
          <div>
            <span className="opacity-60 block font-sans">Operador:</span>
            <span className="font-bold">{operatorName}</span>
          </div>
          <div>
            <span className="opacity-60 block font-sans">Data / Hora:</span>
            <span className="font-bold">{new Date().toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* Matemática do Caixa */}
        <div className="space-y-3 font-mono text-xs">
          <h4 className="font-bold font-sans uppercase tracking-wider text-[11px] opacity-70">Demonstrativo Matemático:</h4>
          
          <div className="flex justify-between py-1.5 border-b border-slate-500/10">
            <span className="opacity-80">+ Fundo de Abertura (Troco):</span>
            <span className="font-bold">R$ {openingVal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-500/10">
            <span className="opacity-80">+ Vendas em Dinheiro:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">R$ {summary.cashSales.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-500/10 font-black">
            <span>= Total Esperado em Caixa:</span>
            <span>R$ {summary.expected.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-500/10 font-black">
            <span>= Valor Contado (Físico):</span>
            <span>R$ {summary.counted.toFixed(2)}</span>
          </div>
        </div>

        {/* Resultado da Conferência (Diferença / Quebra ou Sobra) */}
        <div className={`p-4 rounded-2xl border text-center space-y-1 font-mono ${
          isBalanced 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
            : isSurplus 
              ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
        }`}>
          <div className="text-[10px] font-extrabold uppercase tracking-wider font-sans opacity-80">
            {isBalanced ? 'Caixa Exato (Sem Diferença)' : isSurplus ? 'Sobra de Caixa (Excedente)' : 'Quebra de Caixa (Falta)'}
          </div>
          <div className="text-xl font-black">
            R$ {diffVal.toFixed(2)}
          </div>
        </div>

        {/* Área de Assinaturas (Ideal para Impressão) */}
        <div className="pt-4 border-t border-slate-500/10 grid grid-cols-2 gap-6 text-center text-[10px] font-mono opacity-70">
          <div className="space-y-6">
            <div className="border-b border-slate-500/40 pb-1"></div>
            <span>Assinatura do Operador</span>
          </div>
          <div className="space-y-6">
            <div className="border-b border-slate-500/40 pb-1"></div>
            <span>Assinatura do Gerente</span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3 rounded-2xl border border-slate-500/30 hover:bg-slate-500/10 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Imprimir Recibo
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition cursor-pointer"
          >
            Concluir & Fechar Turno ✓
          </button>
        </div>
      </div>
    </div>
  );
}