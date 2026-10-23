'use client';

import { useState, useEffect } from 'react';
import { PDVPaymentModal, PaymentSplit } from './PDVPaymentModal';

interface PartnerItem {
  id: string;
  name: string;
}

interface PDVCheckoutPanelProps {
  partners: PartnerItem[];
  selectedPartnerId: string;
  setSelectedPartnerId: (id: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  totalCart: number;
  loading: boolean;
  onCheckout: (splits?: PaymentSplit[], change?: number) => void;
  isDarkMode: boolean;
  onNotify?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function PDVCheckoutPanel({
  partners,
  selectedPartnerId,
  setSelectedPartnerId,
  customerName,
  setCustomerName,
  totalCart,
  loading,
  onCheckout,
  isDarkMode,
  onNotify,
}: PDVCheckoutPanelProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleTriggerCheckout = () => {
    if (totalCart <= 0) return;
    setIsPaymentModalOpen(true);
  };

  // Atalho global F9 para abrir a gestão de pagamento
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F9') {
        e.preventDefault();
        if (totalCart > 0 && !loading && !isPaymentModalOpen) {
          setIsPaymentModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [totalCart, loading, isPaymentModalOpen]);

  return (
    <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      
      {/* Nome do Cliente */}
      <div className="space-y-1">
        <label className="block text-xs font-bold uppercase tracking-wider opacity-75">Cliente da Venda</label>
        <input
          type="text"
          placeholder="Nome do cliente (Opcional)"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full px-3.5 py-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-950 outline-none font-bold"
        />
      </div>

      {/* Seleção rápida de Convênio */}
      <div className="space-y-1">
        <label className="block text-xs font-bold uppercase tracking-wider opacity-75">Convênio Principal (Opcional)</label>
        <select
          value={selectedPartnerId}
          onChange={(e) => setSelectedPartnerId(e.target.value)}
          className="w-full px-3.5 py-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-950 font-bold outline-none cursor-pointer"
        >
          <option value="">Nenhum convênio selecionado</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Resumo do Total e Botão de Fecho com [F9] */}
      <div className="pt-4 border-t border-slate-500/10 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase font-extrabold opacity-60">Total a Pagar:</span>
          <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            R$ {totalCart.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <button
          type="button"
          disabled={loading || totalCart <= 0}
          onClick={handleTriggerCheckout}
          className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xl shadow-emerald-600/25 transition cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {loading ? 'A processar venda...' : '💳 [F9] Gestão de Pagamento & Troco'}
        </button>
      </div>

      {/* Modal de Pagamento Misto & Troco (Com atalho F10 para concluir) */}
      <PDVPaymentModal
        key={isPaymentModalOpen ? 'open' : 'closed'}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalCart={totalCart}
        onConfirmPayment={(splits, change) => {
          setIsPaymentModalOpen(false);
          onCheckout(splits, change);
        }}
        isDarkMode={isDarkMode}
        onNotify={onNotify}
      />

    </div>
  );
}