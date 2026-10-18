'use client';

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
            <label className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              Selecione o Funcionário ou Empresa Parceira:
            </label>
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl bg-white dark:bg-slate-950 font-bold font-mono"
            >
              <option value="">-- Escolher Convênio --</option>
              {partners.map((p) => {
                const debt = Number(p.currentBalance || 0);
                const limit = Number(p.creditLimit || 0);
                const available = limit - debt;
                return (
                  <option key={p.id} value={p.id}>
                    {p.type === 'EMPLOYEE' ? '👤' : '🏢'} {p.name} (Disp: R$ {available.toFixed(2)})
                  </option>
                );
              })}
            </select>
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
    </div>
  );
}