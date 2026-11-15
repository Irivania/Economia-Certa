"use client";

import { useState, useCallback, useRef, useMemo } from "react";

import { PAYMENT_METHODS } from "@/constants/pdvPaymentConstants";

import {
  calculatePaymentTotals,
  formatMethodName,
  validateSplitAmount,
} from "@/utils/pdvPaymentUtils";

import { usePDVPaymentModalShortcuts } from "@/hooks/pdv/usePDVPaymentModalShortcuts";

import type { PaymentSplit, NotificationState } from "@/types/pdv/payment";

interface UsePDVPaymentModalProps {
  isOpen: boolean;
  totalCart: number;
  onClose: () => void;
  onConfirmPayment: (splits: PaymentSplit[], changeAmount: number) => void;
  onNotify?: (
    message: string,
    type: "success" | "error" | "warning" | "info",
  ) => void;
}

export function usePDVPaymentModal({
  isOpen,
  totalCart,
  onClose,
  onConfirmPayment,
  onNotify,
}: UsePDVPaymentModalProps) {
  // Estados
  const initialRemaining = Math.max(0, totalCart);

  const [splits, setSplits] = useState<PaymentSplit[]>([]);
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0);

  const [rawAmount, setRawAmount] = useState(() =>
    Math.round(initialRemaining * 100),
  );

  const [displayAmount, setDisplayAmount] = useState(() =>
    initialRemaining.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    }),
  );

  const [notification, setNotification] = useState<NotificationState | null>(
    null,
  );

  const modalContainerRef = useRef<HTMLDivElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Notificações
  const notify = useCallback(
    (message: string, type: NotificationState["type"] = "error") => {
      onNotify?.(message, type);
      setNotification({ message, type });
    },
    [onNotify],
  );

  // Foco no campo de valor
  const focusAmountInput = useCallback(() => {
    requestAnimationFrame(() => {
      if (amountInputRef.current) {
        amountInputRef.current.focus();
        amountInputRef.current.select();
      }
    });
  }, []);

  // Cálculos
  const { totalPaid, remainingAmount, changeAmount } = useMemo(
    () => calculatePaymentTotals(splits, totalCart),
    [splits, totalCart],
  );

  // Seleção da forma de pagamento
  const handleSelectMethod = useCallback((idx: number) => {
    setSelectedMethodIndex(idx);
  }, []);

  // Finalizar pagamento
  const handleFinish = useCallback(() => {
    if (totalPaid < totalCart) {
      notify(
        `Falta pagar R$ ${remainingAmount.toFixed(2)}. Adicione mais formas de pagamento.`,
        "warning",
      );

      focusAmountInput();
      return;
    }

    onConfirmPayment(splits, changeAmount);
    setSplits([]);
  }, [
    totalPaid,
    totalCart,
    remainingAmount,
    onConfirmPayment,
    splits,
    changeAmount,
    notify,
    focusAmountInput,
  ]);

  // Remover último pagamento
  const handleRemoveLastSplit = useCallback(() => {
    if (splits.length === 0) return;

    const lastSplit = splits[splits.length - 1];
    const updated = splits.slice(0, -1);

    setSplits(updated);

    const newTotals = calculatePaymentTotals(updated, totalCart);
    const nextCents = Math.round(newTotals.remainingAmount * 100);

    setRawAmount(nextCents);

    setDisplayAmount(
      (nextCents / 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      }),
    );

    notify(
      `Parcela de ${formatMethodName(lastSplit.method)} (R$ ${lastSplit.amount.toFixed(2)}) removida.`,
      "info",
    );
  }, [splits, totalCart, notify]);

  // Limpar todos os pagamentos
  const handleClearAllSplits = useCallback(() => {
    setSplits([]);

    const rem = Math.max(0, totalCart);
    const cents = Math.round(rem * 100);

    setRawAmount(cents);

    setDisplayAmount(
      (cents / 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      }),
    );

    notify("Todos os pagamentos lançados foram limpos.", "info");
  }, [totalCart, notify]);

  // Atalhos de teclado
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

  // Alteração do valor
  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleanValue = e.target.value.replace(/\D/g, "");
      const numCents = cleanValue ? Number(cleanValue) : 0;

      if (Number.isFinite(numCents)) {
        setRawAmount(numCents);

        setDisplayAmount(
          (numCents / 100).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        );
      }
    },
    [],
  );

  // Valores rápidos de dinheiro
  const handleQuickCash = useCallback(
    (value: number) => {
      const cents = Math.round(value * 100);

      setRawAmount(cents);

      setDisplayAmount(
        value.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      );

      setSelectedMethodIndex(0);
      focusAmountInput();
    },
    [focusAmountInput],
  );

  // Método selecionado
  const activeMethod = PAYMENT_METHODS[selectedMethodIndex]?.id || "CASH";

  // Adicionar pagamento
  const handleAddSplit = useCallback(() => {
    if (totalPaid >= totalCart || remainingAmount <= 0) {
      notify("Venda já quitada. Pressione F10 para finalizar.", "success");
      return;
    }

    const val = rawAmount / 100;

    const validation = validateSplitAmount(
      activeMethod,
      val,
      remainingAmount,
      totalPaid,
      totalCart,
    );

    if (!validation.isValid) {
      notify(validation.error || "Valor inválido.", "warning");
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

    setDisplayAmount(
      (nextCents / 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      }),
    );

    if (nextRemaining <= 0) {
      notify(
        newTotals.changeAmount > 0
          ? `Troco: R$ ${newTotals.changeAmount.toFixed(2)}. Pressione F10 para finalizar.`
          : "Venda totalmente quitada! Pressione F10 para finalizar.",
        "success",
      );

      focusAmountInput();
    } else {
      notify(
        `Falta pagar R$ ${nextRemaining.toFixed(2)}. Escolha o próximo método ([F1-F5]).`,
        "warning",
      );

      requestAnimationFrame(() => {
        modalContainerRef.current?.focus();
      });
    }
  }, [
    rawAmount,
    activeMethod,
    splits,
    totalCart,
    totalPaid,
    remainingAmount,
    notify,
    focusAmountInput,
  ]);

  // Remover pagamento específico
  const handleRemoveSplit = useCallback(
    (splitId: string) => {
      const updated = splits.filter((s) => s.id !== splitId);

      setSplits(updated);

      const newTotals = calculatePaymentTotals(updated, totalCart);
      const nextCents = Math.round(newTotals.remainingAmount * 100);

      setRawAmount(nextCents);

      setDisplayAmount(
        (nextCents / 100).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        }),
      );
    },
    [splits, totalCart],
  );

  // Retorno para a interface
  return {
    splits,
    selectedMethodIndex,
    rawAmount,
    displayAmount,
    notification,
    setNotification,

    modalContainerRef,
    amountInputRef,

    totalPaid,
    remainingAmount,
    changeAmount,
    activeMethod,

    handleSelectMethod,
    handleFinish,
    handleRemoveLastSplit,
    handleClearAllSplits,
    handleAmountChange,
    handleQuickCash,
    handleAddSplit,
    handleRemoveSplit,
    focusAmountInput,
  };
}
