"use client";

import { PDVPaymentModal } from "./PDVPaymentModal";
import type { PartnerItem, PaymentSplit } from "@/types/pdv";
import { useCheckoutPanel } from "@/hooks/pdv/useCheckoutPanel";

interface PDVCheckoutPanelProps {
  partners: PartnerItem[];
  selectedPartnerId: string;
  setSelectedPartnerId: (id: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerDocument: string;
  setCustomerDocument: (document: string) => void;
  totalCart: number;
  loading: boolean;
  onCheckout: (splits?: PaymentSplit[], change?: number) => void;
  isDarkMode: boolean;
  onNotify?: (
    message: string,
    type: "success" | "error" | "warning" | "info",
  ) => void;
}

export function PDVCheckoutPanel({
  partners,
  selectedPartnerId,
  setSelectedPartnerId,
  customerName,
  setCustomerName,
  customerDocument,
  setCustomerDocument,
  totalCart,
  loading,
  onCheckout,
  isDarkMode,
  onNotify,
  checkoutPanel,
}: PDVCheckoutPanelProps & {
  checkoutPanel: ReturnType<typeof useCheckoutPanel>;
}) {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    isDocumentFocused,
    setIsDocumentFocused,
    customerDocumentRef,
    partnerRef,
    handleTriggerCheckout,
    handleConfirmPayment,
  } = checkoutPanel;

  return (
    <div
      className={`space-y-4 rounded-3xl border p-6 shadow-xl ${isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}
    >
      <div className="space-y-1">
        <label className="block text-xs font-bold uppercase tracking-wider opacity-75">
          Cliente da Venda
        </label>
        <input
          type="text"
          placeholder="Nome do cliente (Opcional)"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-xs font-bold outline-none dark:bg-slate-950"
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="pdv-customer-document"
          className="flex items-center justify-between text-xs font-bold uppercase tracking-wider opacity-75"
        >
          <span>
            CPF ou CNPJ{" "}
            <span className="font-normal normal-case opacity-60">
              (opcional)
            </span>
          </span>
          <kbd className="rounded border border-slate-300 px-1.5 py-0.5 text-[10px] dark:border-slate-700">
            F2
          </kbd>
        </label>
        <input
          id="pdv-customer-document"
          ref={customerDocumentRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Informe ou deixe em branco"
          value={customerDocument}
          onChange={(e) => setCustomerDocument(e.target.value)}
          onFocus={() => setIsDocumentFocused(true)}
          onBlur={() => setIsDocumentFocused(false)}
          className={`w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-xs font-bold outline-none transition dark:bg-slate-950 ${
            isDocumentFocused
              ? "border-emerald-500 bg-emerald-50/60 ring-4 ring-emerald-500/20 dark:bg-emerald-950/30"
              : "border-slate-200 dark:border-slate-800"
          }`}
        />
        {isDocumentFocused && (
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            Campo ativo: digite o CPF ou CNPJ do cliente.
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider opacity-75">
          <span>Convênio Principal (Opcional)</span>
          <kbd className="rounded border border-slate-300 px-1.5 py-0.5 text-[10px] dark:border-slate-700">
            F3
          </kbd>
        </label>
        <select
          ref={partnerRef}
          value={selectedPartnerId}
          onChange={(e) => setSelectedPartnerId(e.target.value)}
          className="w-full cursor-pointer rounded-xl border bg-slate-50 px-3.5 py-2.5 text-xs font-bold outline-none dark:bg-slate-950"
        >
          <option value="">Nenhum convênio selecionado</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4 border-t border-slate-500/10 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase opacity-60">
            Total a Pagar:
          </span>
          <span className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">
            R$ {totalCart.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <button
          type="button"
          disabled={loading || totalCart <= 0}
          onClick={handleTriggerCheckout}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-xs font-black text-white shadow-xl shadow-emerald-600/25 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "A processar venda..."
            : "💳 [F9] Gestão de Pagamento & Troco"}
        </button>
      </div>

      <PDVPaymentModal
        key={isPaymentModalOpen ? "open" : "closed"}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalCart={totalCart}
        customerDocument={customerDocument}
        setCustomerDocument={setCustomerDocument}
        onConfirmPayment={handleConfirmPayment}
        isDarkMode={isDarkMode}
        onNotify={onNotify}
      />
    </div>
  );
}
