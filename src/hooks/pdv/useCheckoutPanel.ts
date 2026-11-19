"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePDVPaymentModal } from "@/hooks/pdv/payment/usePDVPaymentModal";
import type { PaymentSplit } from "@/types/pdv";

interface UseCheckoutPanelOptions {
  totalCart: number;
  loading: boolean;
  onCheckout: (splits?: PaymentSplit[], change?: number) => void;
}

export function useCheckoutPanel({
  totalCart,
  loading,
  onCheckout,
}: UseCheckoutPanelOptions) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDocumentFocused, setIsDocumentFocused] = useState(false);
  const customerDocumentRef = useRef<HTMLInputElement>(null);
  const partnerRef = useRef<HTMLSelectElement>(null);

  const handleTriggerCheckout = useCallback(() => {
    if (totalCart <= 0) return;
    setIsPaymentModalOpen(true);
  }, [totalCart]);

  const handleConfirmPayment = useCallback(
    (splits: PaymentSplit[], change: number) => {
      setIsPaymentModalOpen(false);
      onCheckout(splits, change);
    },
    [onCheckout],
  );

  const paymentModalController = usePDVPaymentModal({
    isOpen: isPaymentModalOpen,
    totalCart,
    onClose: () => setIsPaymentModalOpen(false),
    onConfirmPayment: handleConfirmPayment,
  });

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F9") {
        event.preventDefault();
        if (totalCart > 0 && !loading && !isPaymentModalOpen) {
          setIsPaymentModalOpen(true);
        }
      }
      if (event.key === "F2" && !isPaymentModalOpen) {
        event.preventDefault();
        const documentInput = customerDocumentRef.current;
        if (documentInput) {
          setIsDocumentFocused(true);
          documentInput.scrollIntoView({ behavior: "smooth", block: "center" });
          documentInput.focus({ preventScroll: true });
        }
      }
      if (event.key === "F3" && !isPaymentModalOpen) {
        event.preventDefault();
        partnerRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isPaymentModalOpen, loading, totalCart]);

  return {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    isDocumentFocused,
    setIsDocumentFocused,
    customerDocumentRef,
    partnerRef,
    handleTriggerCheckout,
    handleConfirmPayment,
    paymentModalController,
  };
}
