'use client';

import React from 'react';
import { Banknote } from 'lucide-react';
import { PAYMENT_METHODS, QUICK_CASH_AMOUNTS, PDV_PAYMENT_TEXTS, PaymentMethodId } from '@/constants/pdvPaymentConstants';
import { formatMethodName } from '@/utils/pdvPaymentUtils';

interface PaymentMethodsGridProps {
  selectedMethodIndex: number;
  onSelectMethod: (idx: number) => void;
  activeMethod: PaymentMethodId;
  displayAmount: string;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddSplit: () => void;
  onQuickCash: (value: number) => void;
  remainingAmount: number;
  amountInputRef: React.RefObject<HTMLInputElement | null>;
}

export function PaymentMethodsGrid({
  selectedMethodIndex,
  onSelectMethod,
  activeMethod,
  displayAmount,
  onAmountChange,
  onAddSplit,
  onQuickCash,
  remainingAmount,
  amountInputRef,
}: PaymentMethodsGridProps) {
  return (
    <div className="space-y-3 p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          {PDV_PAYMENT_TEXTS.selectMethodHeader}
        </h4>
        <span className="text-[10px] font-mono opacity-60">Atalhos: [F1-F5] Selecionam método | [Enter] Adiciona valor</span>
      </div>
      
      {/* Grid de Formas de Pagamento */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup">
        {PAYMENT_METHODS.map((m, idx) => {
          const isSelected = idx === selectedMethodIndex;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectMethod(idx)}
              className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between border cursor-pointer ${
                isSelected 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400' 
                  : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 hover:border-indigo-500'
              }`}
            >
              <span>{m.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-500/10 opacity-60'}`}>
                [F{idx + 1}]
              </span>
            </button>
          );
        })}
      </div>

      {/* Campo de Valor e Adição */}
      <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center">
        <div className="w-full">
          <label htmlFor="split-amount-input" className="block text-[10px] font-bold uppercase opacity-60 mb-1">
            {PDV_PAYMENT_TEXTS.amountLabel(formatMethodName(activeMethod))} (Enter para Adicionar)
          </label>
          <input
            id="split-amount-input"
            ref={amountInputRef}
            type="text"
            placeholder="R$ 0,00"
            value={displayAmount ? `R$ ${displayAmount}` : 'R$ 0,00'}
            onChange={onAmountChange}
            onKeyDown={(e) => {
              e.stopPropagation();

              // Ao dar Enter no input de valor, adiciona a parcela imediatamente
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddSplit();
              }
            }}
            className="w-full px-3.5 py-2.5 text-xs border rounded-xl bg-white dark:bg-slate-950 font-mono font-bold text-emerald-600 text-right outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="button"
          onClick={onAddSplit}
          className="w-full sm:w-auto mt-4 sm:mt-0 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
        >
          {PDV_PAYMENT_TEXTS.addSplitButton}
        </button>
      </div>

      {/* Botoneira de Notas Rápidas para Dinheiro */}
      {activeMethod === 'CASH' && (
        <div className="pt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase opacity-60 mr-1 flex items-center gap-1">
            <Banknote className="w-3 h-3 text-emerald-500" /> {PDV_PAYMENT_TEXTS.quickCashLabel}
          </span>
          <button 
            type="button" 
            onClick={() => onQuickCash(remainingAmount)} 
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-bold transition cursor-pointer"
          >
            {PDV_PAYMENT_TEXTS.exactCash(remainingAmount.toFixed(2))}
          </button>
          {QUICK_CASH_AMOUNTS.map((amt) => (
            <button 
              key={amt} 
              type="button" 
              onClick={() => onQuickCash(amt)} 
              className="px-2.5 py-1 rounded-lg bg-slate-500/10 hover:bg-slate-500/20 text-[11px] font-mono font-bold transition cursor-pointer"
            >
              R$ {amt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}