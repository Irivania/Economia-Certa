'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { PAYMENT_METHODS, PaymentMethodId } from '@/constants/pdvPaymentConstants';
import { calculatePaymentTotals, formatMethodName, validateSplitAmount } from '@/utils/pdvPaymentUtils';
import { usePDVPaymentModalShortcuts } from '@/hooks/pdv/usePDVPaymentModalShortcuts';
import { PaymentHeader } from './payment/PaymentHeader';
import { PaymentMethodsGrid } from './payment/PaymentMethodsGrid';
import { PaymentSplitsList } from './payment/PaymentSplitsList';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

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

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export function PDVPaymentModal({
  isOpen,
  onClose,
  totalCart,
  onConfirmPayment,
  isDarkMode,
  onNotify,
}: PDVPaymentModalProps) {
  const initialRemaining = Math.max(0, totalCart);

  const [splits, setSplits] = useState<PaymentSplit[]>([]);
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0);
  const [rawAmount, setRawAmount] = useState(() => Math.round(initialRemaining * 100));
  const [displayAmount, setDisplayAmount] = useState(() => initialRemaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const modalContainerRef = useRef<HTMLDivElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const notify = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'error') => {
    if (onNotify) {
      onNotify(message, type);
    }
    setNotification({ message, type });
  }, [onNotify]);

  const focusAmountInput = useCallback(() => {
    requestAnimationFrame(() => {
      if (amountInputRef.current) {
        amountInputRef.current.focus();
        amountInputRef.current.select();
      }
    });
  }, []);

  const { totalPaid, remainingAmount, changeAmount } = useMemo(
    () => calculatePaymentTotals(splits, totalCart),
    [splits, totalCart]
  );

  const handleSelectMethod = useCallback((idx: number) => {
    setSelectedMethodIndex(idx);
  }, []);

  const handleFinish = useCallback(() => {
    if (totalPaid < totalCart) {
      notify(`Falta pagar R$ ${remainingAmount.toFixed(2)}. Adicione mais formas de pagamento.`, 'warning');
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
    notify(`Parcela de ${formatMethodName(lastSplit.method)} (R$ ${lastSplit.amount.toFixed(2)}) removida.`, 'info');
  }, [splits, totalCart, notify]);

  const handleClearAllSplits = useCallback(() => {
    setSplits([]);
    const rem = Math.max(0, totalCart);
    const cents = Math.round(rem * 100);
    setRawAmount(cents);
    setDisplayAmount((cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    notify('Todos os pagamentos lançados foram limpos.', 'info');
  }, [totalCart, notify]);

  usePDVPaymentModalShortcuts({
    isOpen,
    totalPaid,
    totalCart,
    onFinish: handleFinish,
    onClose,
    selectedMethodIndex,
    setSelectedMethodIndex: handleSelectMethod,
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
      notify('Venda já quitada. Pressione F10 para finalizar.', 'success');
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
      notify(newTotals.changeAmount > 0 ? `Troco: R$ ${newTotals.changeAmount.toFixed(2)}. Pressione F10 para finalizar.` : 'Venda totalmente quitada! Pressione F10 para finalizar.', 'success');
      focusAmountInput();
    } else {
      notify(`Falta pagar R$ ${nextRemaining.toFixed(2)}. Escolha o próximo método ([F1-F5]).`, 'warning');
      requestAnimationFrame(() => {
        if (modalContainerRef.current) {
          modalContainerRef.current.focus();
        }
      });
    }
  }, [rawAmount, activeMethod, splits, totalCart, totalPaid, remainingAmount, notify, focusAmountInput]);

  const handleRemoveSplit = useCallback((splitId: string) => {
    const updated = splits.filter((s) => s.id !== splitId);
    setSplits(updated);
    const newTotals = calculatePaymentTotals(updated, totalCart);
    const nextCents = Math.round(newTotals.remainingAmount * 100);

    setRawAmount(nextCents);
    setDisplayAmount((nextCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
  }, [splits, totalCart]);

  if (!isOpen) return null;

  const getNotificationStyles = (type: string, msg: string) => {
    const isTrocoOrSuccess = type === 'success' || msg.toLowerCase().includes('troco') || msg.toLowerCase().includes('quitada');
    const isWarningOrFalta = type === 'warning' || msg.toLowerCase().includes('falta') || msg.toLowerCase().includes('inválido');

    if (isTrocoOrSuccess) {
      return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300';
    }
    if (isWarningOrFalta) {
      return 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300';
    }
    return 'bg-indigo-500/15 border-indigo-500/40 text-indigo-700 dark:text-indigo-300';
  };

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
        className={`w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl border shadow-2xl space-y-4 outline-none relative ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
      >
        {notification && (
          <div className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold animate-fadeIn shadow-sm ${getNotificationStyles(notification.type, notification.message)}`}>
            <div className="flex items-center gap-2">
              {notification.message.toLowerCase().includes('troco') || notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : notification.message.toLowerCase().includes('falta') ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              ) : (
                <Info className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
              )}
              <span className="font-extrabold text-xs sm:text-sm">{notification.message}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setNotification(null)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <PaymentHeader
          onClose={onClose}
          totalCart={totalCart}
          remainingAmount={remainingAmount}
          changeAmount={changeAmount}
        />

        <PaymentMethodsGrid
          selectedMethodIndex={selectedMethodIndex}
          onSelectMethod={handleSelectMethod}
          activeMethod={activeMethod}
          displayAmount={displayAmount}
          onAmountChange={handleAmountChange}
          onAddSplit={handleAddSplit}
          onQuickCash={handleQuickCash}
          remainingAmount={remainingAmount}
          amountInputRef={amountInputRef}
        />

        <PaymentSplitsList
          splits={splits}
          onRemoveSplit={handleRemoveSplit}
          onClose={onClose}
          onFinish={handleFinish}
          totalPaid={totalPaid}
          totalCart={totalCart}
          changeAmount={changeAmount}
        />
      </div>
    </div>
  );
}