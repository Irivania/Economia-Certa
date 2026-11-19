"use client";

import { PaymentHeader } from "./payment/PaymentHeader";
import { PaymentMethodsGrid } from "./payment/PaymentMethodsGrid";
import { PaymentSplitsList } from "./payment/PaymentSplitsList";
import { PaymentNotification } from "./payment/PaymentNotification";

import type { PDVPaymentModalProps } from "@/types/pdv";

export function PDVPaymentModal({
  isOpen,
  onClose,
  totalCart,
  customerDocument,
  setCustomerDocument,
  onConfirmPayment,
  isDarkMode,
  onNotify,
  controller,
}: PDVPaymentModalProps) {
  const {
    modalContainerRef,
    amountInputRef,
    remainingAmount,
    changeAmount,
    notification,
    setNotification,
    selectedMethodIndex,
    handleSelectMethod,
    activeMethod,
    displayAmount,
    handleAmountChange,
    handleAddSplit,
    handleQuickCash,
    splits,
    handleRemoveSplit,
    handleFinish,
    totalPaid,
  } = controller;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div
        ref={modalContainerRef}
        tabIndex={-1}
        className={`w-full max-w-xl max-h-[calc(100dvh-16px)] sm:max-h-[calc(100dvh-28px)] translate-y-4 flex flex-col overflow-hidden rounded-2xl border shadow-2xl outline-none ${
          isDarkMode
            ? "bg-[#141421] border-slate-700 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* CABEÇALHO E RESUMO */}
        <div
          className={`shrink-0 px-3 sm:px-4 pt-3 ${
            isDarkMode ? "bg-[#181827]" : "bg-slate-50/70"
          }`}
        >
          <PaymentHeader
            onClose={onClose}
            totalCart={totalCart}
            remainingAmount={remainingAmount}
            changeAmount={changeAmount}
            isDarkMode={isDarkMode}
          />

          <div className="mt-2 flex items-center gap-2">
            <label
              htmlFor="pdv-payment-customer-document"
              className="shrink-0 text-[10px] font-bold uppercase tracking-wider opacity-70"
            >
              CPF/CNPJ
            </label>
            <input
              id="pdv-payment-customer-document"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Opcional"
              value={customerDocument}
              onChange={(e) => setCustomerDocument(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div className="mt-2 pb-1">
            <PaymentNotification
              notification={notification}
              onDismiss={() => setNotification(null)}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {/* FORMAS DE PAGAMENTO */}
        <div className="shrink-0 px-3 sm:px-4 py-2">
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
        </div>

        {/* PAGAMENTOS ADICIONADOS */}
        <div
          className={`flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-4 pb-3 border-t ${
            isDarkMode ? "border-slate-800" : "border-slate-100"
          }`}
        >
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
    </div>
  );
}
