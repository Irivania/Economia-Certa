'use client';

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { X, Check, Trash2, Banknote } from 'lucide-react';
import { PAYMENT_METHODS, QUICK_CASH_AMOUNTS, PDV_PAYMENT_TEXTS, PaymentMethodId } from '@/constants/pdvPaymentConstants';
import { formatCurrency, formatMethodName, calculatePaymentTotals, validateSplitAmount } from '@/utils/pdvPaymentUtils';
import { usePDVPaymentModalShortcuts } from '@/hooks/pdv/usePDVPaymentModalShortcuts';

export interface PaymentSplit {
  id: string;
  method: PaymentMethodId;
  amount: number;
}

interface PDVPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalCart: number;
  onConfirmPayment: (splits: PaymentSplit[], changeAmount: number) => void;
  isDarkMode: boolean;
  onNotify?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function PDVPaymentModal({
  isOpen,
  onClose,
  totalCart,
  onConfirmPayment,
  isDarkMode,
  onNotify,
}: PDVPaymentModalProps) {
  const [splits, setSplits] = useState<PaymentSplit[]>([]);
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0);

  const { totalPaid, remainingAmount, changeAmount } = useMemo(
    () => calculatePaymentTotals(splits, totalCart),
    [splits, totalCart]
  );

  const initialRemaining = Math.max(0, totalCart);
  const [rawAmount, setRawAmount] = useState(() => Math.round(initialRemaining * 100));
  const [displayAmount, setDisplayAmount] = useState(() => initialRemaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));

  const modalContainerRef = useRef<HTMLDivElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const notify = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'error') => {
    if (onNotify) {
      onNotify(message, type);
    } else {
      window.alert(message);
    }
  }, [onNotify]);

  const focusAmountInput = useCallback(() => {
    requestAnimationFrame(() => {
      if (amountInputRef.current) {
        amountInputRef.current.focus();
        amountInputRef.current.select();
      }
    });
  }, []);

  // Ao abrir o modal com F9, foca no input de valor com o montante pronto. O operador usa as Setas ou Alt + [1-5] para trocar de método instantaneamente.
  useEffect(() => {
    if (isOpen) {
      setSplits([]);
      setSelectedMethodIndex(0);
      const rem = Math.max(0, totalCart);
      const cents = Math.round(rem * 100);
      setRawAmount(cents);
      setDisplayAmount(rem.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
      focusAmountInput();
    }
  }, [isOpen, totalCart, focusAmountInput]);

  const handleSelectMethod = useCallback((idx: number) => {
    setSelectedMethodIndex(idx);
    focusAmountInput();
  }, [focusAmountInput]);

  const handleFinish = useCallback(() => {
    if (totalPaid < totalCart) {
      notify(`Falta pagar ${formatCurrency(remainingAmount)}. Adicione mais formas de pagamento.`, 'warning');
      focusAmountInput();
      return;
    }
    onConfirmPayment(splits, changeAmount);
    setSplits([]);
    onClose();
  }, [totalPaid, totalCart, remainingAmount, onConfirmPayment, splits, changeAmount, onClose, notify, focusAmountInput]);

  const handleRemoveLastSplit = useCallback(() => {
    if (splits.length === 0) return;
    const lastSplit = splits[splits.length - 1];
    const updated = splits.slice(0, -1);
    setSplits(updated);

    const newTotals = calculatePaymentTotals(updated, totalCart);
    const nextCents = Math.round(newTotals.remainingAmount * 100);

    setRawAmount(nextCents);
    setDisplayAmount((nextCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    focusAmountInput();
    notify(`Parcela de ${formatMethodName(lastSplit.method)} (R$ ${lastSplit.amount.toFixed(2)}) removida.`, 'info');
  }, [splits, totalCart, notify, focusAmountInput]);

  const handleClearAllSplits = useCallback(() => {
    setSplits([]);
    const rem = Math.max(0, totalCart);
    const cents = Math.round(rem * 100);
    setRawAmount(cents);
    setDisplayAmount(rem.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    focusAmountInput();
    notify('Todos os pagamentos lançados foram limpos.', 'info');
  }, [totalCart, notify, focusAmountInput]);

  usePDVPaymentModalShortcuts({
    isOpen,
    totalPaid,
    totalCart,
    onFinish: handleFinish,
    onClose,
    selectedMethodIndex,
    setSelectedMethodIndex,
    focusAmountInput,
    onRemoveLastSplit: handleRemoveLastSplit,
    onClearAllSplits: handleClearAllSplits,
  });

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value.replace(/\D/g, '');
    const numCents = cleanValue ? Number(cleanValue) : 0;
    
    if (Number.isFinite(numCents)) {
      setRawAmount(numCents);
      setDisplayAmount(
        (numCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      );
    }
  }, []);

  const handleQuickCash = useCallback((value: number) => {
    const cents = Math.round(value * 100);
    setRawAmount(cents);
    setDisplayAmount(value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setSelectedMethodIndex(0);
    focusAmountInput();
  }, [focusAmountInput]);

  const activeMethod = PAYMENT_METHODS[selectedMethodIndex]?.id || 'CASH';

  const handleAddSplit = useCallback(() => {
    if (totalPaid >= totalCart || remainingAmount <= 0) {
      notify('Venda já quitada. Pressione F10 para finalizar.', 'warning');
      return;
    }

    const val = rawAmount / 100;
    const validation = validateSplitAmount(activeMethod, val, remainingAmount, totalPaid, totalCart);
    
    if (!validation.isValid) {
      notify(validation.error || 'Valor inválido.', 'warning');
      focusAmountInput();
      return;
    }

    const newSplit: PaymentSplit = {
      id: `split_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      method: activeMethod,
      amount: Number(val.toFixed(2)),
    };

    const updatedSplits = [...splits, newSplit];
    setSplits(updatedSplits);
    
    const newTotals = calculatePaymentTotals(updatedSplits, totalCart);
    const nextRemaining = newTotals.remainingAmount;
    const nextCents = Math.round(nextRemaining * 100);

    setRawAmount(nextCents);
    setDisplayAmount((nextCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));

    if (nextRemaining <= 0) {
      notify(newTotals.changeAmount > 0 ? `Troco: ${formatCurrency(newTotals.changeAmount)}. Pressione F10 para finalizar.` : 'Venda totalmente quitada! Pressione F10 para finalizar.', 'success');
      focusAmountInput();
    } else {
      notify(`Falta pagar ${formatCurrency(nextRemaining)}. Use as Setas ou Alt + [1-5] para escolher o próximo método.`, 'info');
      focusAmountInput();
    }
  }, [rawAmount, activeMethod, splits, totalCart, totalPaid, remainingAmount, notify, focusAmountInput]);

  const handleRemoveSplit = useCallback((splitId: string) => {
    const updated = splits.filter((s) => s.id !== splitId);
    setSplits(updated);
    const newTotals = calculatePaymentTotals(updated, totalCart);
    const nextCents = Math.round(newTotals.remainingAmount * 100);

    setRawAmount(nextCents);
    setDisplayAmount((nextCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    focusAmountInput();
  }, [splits, totalCart, focusAmountInput]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title"
      onKeyDown={(e) => {
        e.stopPropagation();
      }}
    >
      <div 
        ref={modalContainerRef}
        tabIndex={-1}
        className={`w-full max-w-xl p-8 rounded-3xl border shadow-2xl space-y-6 outline-none ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
      >
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center border-b pb-4 border-slate-500/10">
          <div>
            <h3 id="modal-title" className="text-base font-black uppercase tracking-wider">{PDV_PAYMENT_TEXTS.modalTitle}</h3>
            <p className="text-xs opacity-60 mt-0.5">{PDV_PAYMENT_TEXTS.modalSubtitle}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={PDV_PAYMENT_TEXTS.ariaClose} className="p-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 font-bold cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resumo de Valores */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-500/5 border border-slate-500/10 text-center font-mono">
          <div>
            <span className="block text-[10px] uppercase font-bold opacity-60">{PDV_PAYMENT_TEXTS.totalSale}</span>
            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(totalCart)}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold opacity-60">{PDV_PAYMENT_TEXTS.remaining}</span>
            <span className="text-sm font-black text-amber-600 dark:text-amber-400">{formatCurrency(remainingAmount)}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold opacity-60">{PDV_PAYMENT_TEXTS.change}</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(changeAmount)}</span>
          </div>
        </div>

        {/* Seleção de Pagamento por Botões */}
        <div className="space-y-3 p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {PDV_PAYMENT_TEXTS.selectMethodHeader}
            </h4>
            <span className="text-[10px] font-mono opacity-60">Atalhos: [Alt + 1-5] Seleciona | [Setas] Navegam</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup">
            {PAYMENT_METHODS.map((m, idx) => {
              const isSelected = idx === selectedMethodIndex;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelectMethod(idx)}
                  className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between border cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400' 
                      : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 hover:border-indigo-500'
                  }`}
                >
                  <span>{m.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-500/10 opacity-60'}`}>
                    [{m.shortcut}]
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
                onChange={handleAmountChange}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSplit();
                  }
                }}
                className="w-full px-3.5 py-2.5 text-xs border rounded-xl bg-white dark:bg-slate-950 font-mono font-bold text-emerald-600 text-right outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={handleAddSplit}
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
                onClick={() => handleQuickCash(remainingAmount)} 
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-bold transition cursor-pointer"
              >
                {PDV_PAYMENT_TEXTS.exactCash(remainingAmount.toFixed(2))}
              </button>
              {QUICK_CASH_AMOUNTS.map((amt) => (
                <button 
                  key={amt} 
                  type="button" 
                  onClick={() => handleQuickCash(amt)} 
                  className="px-2.5 py-1 rounded-lg bg-slate-500/10 hover:bg-slate-500/20 text-[11px] font-mono font-bold transition cursor-pointer"
                >
                  R$ {amt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lista de Pagamentos Adicionados */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-70">
              {PDV_PAYMENT_TEXTS.addedSplitsHeader(splits.length)}
            </h4>
            {splits.length > 0 && (
              <span className="text-[10px] font-mono opacity-50">[DEL] Remove última | [Ctrl + Backspace] Limpa tudo</span>
            )}
          </div>
          <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
            {splits.length === 0 ? (
              <p className="text-xs text-center py-6 opacity-40 font-mono">{PDV_PAYMENT_TEXTS.emptySplitsText}</p>
            ) : (
              splits.map((s) => (
                <div key={s.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-500/5 border border-slate-500/10 font-mono text-xs">
                  <span className="font-bold">{formatMethodName(s.method)}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-emerald-600 font-black">{formatCurrency(s.amount)}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSplit(s.id)} 
                      aria-label={PDV_PAYMENT_TEXTS.ariaRemoveSplit(formatMethodName(s.method))} 
                      className="text-rose-500 hover:opacity-100 opacity-60 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Botão Final com Atalho [F10] */}
        <div className="pt-4 border-t border-slate-500/10 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl text-xs font-bold bg-slate-500/10 cursor-pointer"
          >
            {PDV_PAYMENT_TEXTS.cancelButton}
          </button>
          <button
            type="button"
            disabled={totalPaid < totalCart}
            onClick={handleFinish}
            className="px-8 py-3 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> {PDV_PAYMENT_TEXTS.finishButton(changeAmount.toFixed(2))}
          </button>
        </div>

      </div>
    </div>
  );
}