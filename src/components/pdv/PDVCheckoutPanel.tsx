'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { PDVPartnerSearchModal } from '@/components/pdv/PDVPartnerSearchModal';

interface PartnerItem {
  id: string;
  type: 'EMPLOYEE' | 'COMPANY_PARTNER';
  name: string;
  document: string | null;
  creditLimit: string;
  currentBalance: string;
  discountPercentage: string;
  active: boolean;
}

type PaymentMethodType = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'CONVENIO';

interface PDVCheckoutPanelProps {
  paymentMethod: PaymentMethodType;
  setPaymentMethod: (val: PaymentMethodType) => void;
  partners: PartnerItem[];
  selectedPartnerId: string;
  setSelectedPartnerId: (val: string) => void;
  customerName: string;
  setCustomerName: (val: string) => void;
  totalCart: number;
  loading: boolean;
  onCheckout: () => void;
  isDarkMode: boolean;
}

export function PDVCheckoutPanel({
  paymentMethod,
  setPaymentMethod,
  partners,
  selectedPartnerId,
  setSelectedPartnerId,
  customerName,
  setCustomerName,
  totalCart,
  loading,
  onCheckout,
  isDarkMode,
}: PDVCheckoutPanelProps) {
  // Estado para controlar a abertura do modal de busca rápida de parceiros
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Encontrar o nome do parceiro atualmente selecionado para exibir no botão
  const selectedPartner = partners.find((p) => p.id === selectedPartnerId);

  return (
    <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="space-y-3 pt-3 border-t border-slate-500/10">
        <div>
          <label className="block text-[11px] font-bold mb-1 opacity-80">Forma de Pagamento</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
            className="w-full px-3 py-2 text-xs border rounded-xl bg-slate-50 dark:bg-slate-950 font-bold"
          >
            <option value="CASH">💵 Dinheiro</option>
            <option value="PIX">⚡ PIX</option>
            <option value="CREDIT_CARD">💳 Cartão de Crédito</option>
            <option value="DEBIT_CARD">💳 Cartão de Débito</option>
            <option value="CONVENIO">🤝 Convênio (Desconto em Folha / Faturamento)</option>
          </select>
        </div>

        {paymentMethod === 'CONVENIO' && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                Funcionário ou Empresa Parceira:
              </label>
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold flex items-center gap-1 transition cursor-pointer shadow-sm"
              >
                <Search className="w-3 h-3" /> {selectedPartner ? 'Alterar' : 'Buscar Convênio 🔍'}
              </button>
            </div>

            {/* Exibe o convênio selecionado ou botão para escolher */}
            <div className="w-full px-3 py-2 text-xs border rounded-xl bg-white dark:bg-slate-950 font-bold font-mono flex justify-between items-center">
              <span className="truncate">
                {selectedPartner ? (
                  <>
                    {selectedPartner.type === 'EMPLOYEE' ? '👤' : '🏢'} {selectedPartner.name}
                  </>
                ) : (
                  <span className="opacity-45 font-sans">Nenhum convênio selecionado...</span>
                )}
              </span>
              {selectedPartner && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-bold">
                  Selecionado ✓
                </span>
              )}
            </div>
          </div>
        )}

        {paymentMethod !== 'CONVENIO' && (
          <div>
            <label className="block text-[11px] font-bold mb-1 opacity-80">Cliente / Observação (Opcional)</label>
            <input
              type="text"
              placeholder="Nome do cliente"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl bg-slate-50 dark:bg-slate-950 uppercase font-bold"
            />
          </div>
        )}

        <div className="flex justify-between items-center pt-1 font-mono">
          <span className="text-xs font-bold uppercase font-sans">Total a Pagar:</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            R$ {totalCart.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={onCheckout}
          className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/25 transition cursor-pointer"
        >
          {loading ? 'Processando...' : 'Finalizar Venda & Imprimir 🚀'}
        </button>
      </div>

      {/* Modal de Busca Rápida de Convênios */}
      <PDVPartnerSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        partners={partners}
        onSelectPartner={(partnerId) => setSelectedPartnerId(partnerId)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}