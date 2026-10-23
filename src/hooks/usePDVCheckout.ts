'use client';

import { useState, useCallback } from 'react';
import { apiFetch } from '@/lib/apiClient';

// ==========================================
// 1. TIPOS E CONTRATOS ESTRITOS (TypeScript)
// ==========================================
export type PaymentMethodType = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'CONVENIO';

export interface CartItem {
  productId: string;
  description: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl: string | null;
}

export interface PartnerItem {
  id: string;
  type: 'EMPLOYEE' | 'COMPANY_PARTNER';
  name: string;
  document: string | null;
  creditLimit: string;
  currentBalance: string;
  discountPercentage: string;
  active: boolean;
}

export interface PaymentSplit {
  method: PaymentMethodType | string;
  amount: number;
}

export interface CompletedSaleData {
  saleId: string;
  operatorName: string;
  customerName: string;
  paymentMethod: string;
  total: number;
  items: CartItem[];
  paymentSplits?: PaymentSplit[];
  changeGiven?: number;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface RegisterTransaction {
  type: 'SUPPLY' | 'BLEED' | string;
  amount: string | number;
}

interface RegisterSale {
  paymentMethod: string;
  total: string | number;
}

interface RegisterDataResponse {
  isOpen: boolean;
  register?: {
    openingAmount?: string | number;
  };
  transactions?: RegisterTransaction[];
  sales?: RegisterSale[];
}

// ==========================================
// 2. CONSTANTES CENTRALIZADAS (Clean Code)
// ==========================================
const SAFETY_LIMIT_CASH = 500.00;
const DEFAULT_OPERATOR_NAME = 'Operador de Caixa';
const DEFAULT_CUSTOMER_NAME = 'Cliente Balcão';

// ==========================================
// 3. FUNÇÕES PURAS DE VALIDAÇÃO (SOLID / DRY)
// ==========================================
function validateCart(cart: CartItem[]): { isValid: boolean; error?: string } {
  if (!Array.isArray(cart) || cart.length === 0) {
    return { isValid: false, error: 'O carrinho está vazio.' };
  }
  return { isValid: true };
}

function validateTotalAmount(totalCart: number): { isValid: boolean; error?: string } {
  if (!Number.isFinite(totalCart) || totalCart <= 0) {
    return { isValid: false, error: 'O valor total da venda é inválido ou inconsistente.' };
  }
  return { isValid: true };
}

function validateConvenioLimit(
  paymentMethod: PaymentMethodType,
  selectedPartnerId: string,
  partners: PartnerItem[],
  totalCart: number
): { isValid: boolean; error?: string; finalCustomerName?: string; partnerIdToUse?: string | null } {
  if (paymentMethod !== 'CONVENIO') {
    return { isValid: true, finalCustomerName: undefined, partnerIdToUse: null };
  }

  if (!selectedPartnerId) {
    return { isValid: false, error: 'Selecione o funcionário ou empresa parceira para faturamento no convênio.' };
  }

  const partner = partners.find((p) => p.id === selectedPartnerId);
  if (!partner) {
    return { isValid: false, error: 'Parceiro ou funcionário de convênio não encontrado.' };
  }

  const limit = Number(partner.creditLimit || 0);
  const currentDebt = Number(partner.currentBalance || 0);

  if (!Number.isFinite(limit) || !Number.isFinite(currentDebt)) {
    return { isValid: false, error: 'Erro ao processar os limites de crédito do convênio.' };
  }

  if (currentDebt + totalCart > limit) {
    return {
      isValid: false,
      error: `Limite de crédito excedido para ${partner.name}!\nLimite: R$ ${limit.toFixed(2)} | Saldo Devedor: R$ ${currentDebt.toFixed(2)}`,
    };
  }

  return {
    isValid: true,
    finalCustomerName: `CONVÊNIO: ${partner.name}`,
    partnerIdToUse: partner.id,
  };
}

// ==========================================
// 4. SERVIÇO DE AUDITORIA DE GAVETA
// ==========================================
async function auditCashDrawerLimit(
  companyId: string,
  onNotify?: (message: string, type: NotificationType) => void
): Promise<void> {
  try {
    const regRes = await apiFetch(`/api/pdv/register?companyId=${companyId}`);
    if (!regRes.ok) return;

    const regData: RegisterDataResponse = await regRes.json();
    if (regData.isOpen && regData.register) {
      let cashTotal = Number(regData.register.openingAmount || 0);

      if (Array.isArray(regData.transactions)) {
        regData.transactions.forEach((tx) => {
          const amt = Number(tx.amount || 0);
          if (tx.type === 'SUPPLY') cashTotal += amt;
          if (tx.type === 'BLEED') cashTotal -= amt;
        });
      }

      if (Array.isArray(regData.sales)) {
        regData.sales.forEach((s) => {
          if (s.paymentMethod === 'CASH') {
            cashTotal += Number(s.total || 0);
          }
        });
      }

      if (cashTotal > SAFETY_LIMIT_CASH) {
        const warningMsg =
          `🚨 ALERTA DE SEGURANÇA: EXCESSO DE DINHEIRO EM GAVETA!\n\n` +
          `O montante acumulado em espécie atingiu R$ ${cashTotal.toFixed(2)} (Limite: R$ ${SAFETY_LIMIT_CASH.toFixed(2)}).\n` +
          `Por motivos de segurança contra assaltos, aceda a "Gestão de Turno / Pausa / Fecho" e efetue uma Sangria de Segurança para o cofre imediatamente!`;

        if (onNotify) {
          onNotify(warningMsg, 'warning');
        } else {
          console.warn(`[PDV Audit Warning]: Excesso de dinheiro em gaveta: R$ ${cashTotal.toFixed(2)}`);
          window.alert(warningMsg);
        }
      }
    }
  } catch (secErr) {
    console.error('[PDV Audit Error] Falha ao auditar limite de gaveta:', secErr);
  }
}

// ==========================================
// 5. HOOK PRINCIPAL DE CHECKOUT
// ==========================================
export function usePDVCheckout(
  companyId: string,
  loadData: () => Promise<void>,
  onNotify?: (message: string, type: NotificationType) => void
) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CASH');
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);

  const [isNFCeModalOpen, setIsNFCeModalOpen] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<CompletedSaleData | null>(null);

  const notify = useCallback((message: string, type: NotificationType = 'error') => {
    if (onNotify) {
      onNotify(message, type);
    } else {
      console.warn(`[PDV Checkout - ${type.toUpperCase()}]: ${message}`);
      window.alert(message);
    }
  }, [onNotify]);

  const handleCheckout = useCallback(
    async (
      cart: CartItem[],
      totalCart: number,
      partners: PartnerItem[],
      paymentSplits?: PaymentSplit[],
      changeGiven?: number
    ): Promise<boolean> => {
      if (loading) {
        console.warn('[PDV Checkout] Tentativa de execução simultânea bloqueada.');
        return false;
      }

      const cartValidation = validateCart(cart);
      if (!cartValidation.isValid) {
        notify(cartValidation.error || 'Carrinho inválido.', 'warning');
        return false;
      }

      const totalValidation = validateTotalAmount(totalCart);
      if (!totalValidation.isValid) {
        notify(totalValidation.error || 'Valor total inválido.', 'error');
        return false;
      }

      let finalCustomerName = customerName.trim() || DEFAULT_CUSTOMER_NAME;
      let partnerIdPayload: string | null = null;

      const convenioValidation = validateConvenioLimit(paymentMethod, selectedPartnerId, partners, totalCart);
      if (!convenioValidation.isValid) {
        notify(convenioValidation.error || 'Erro na validação do convênio.', 'error');
        return false;
      }

      if (convenioValidation.finalCustomerName) {
        finalCustomerName = convenioValidation.finalCustomerName;
      }
      partnerIdPayload = convenioValidation.partnerIdToUse ?? null;

      try {
        setLoading(true);

        const finalSplits = paymentSplits && paymentSplits.length > 0
          ? paymentSplits
          : [{ method: paymentMethod, amount: totalCart }];

        const finalChange = Number.isFinite(changeGiven) ? Number(changeGiven) : 0;

        const payload = {
          companyId,
          mode: 'CASHIER',
          operatorName: DEFAULT_OPERATOR_NAME,
          customerName: finalCustomerName,
          partnerId: partnerIdPayload,
          items: cart,
          paymentMethod,
          paymentSplits: finalSplits,
          changeGiven: finalChange,
          totalAmount: totalCart,
        };

        const res = await apiFetch('/api/pdv/checkout', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Erro ao processar transação no servidor.');
        }

        setLastCompletedSale({
          saleId: data.saleId,
          operatorName: DEFAULT_OPERATOR_NAME,
          customerName: finalCustomerName,
          paymentMethod,
          total: totalCart,
          items: [...cart],
          paymentSplits: finalSplits,
          changeGiven: finalChange,
        });
        setIsNFCeModalOpen(true);

        if (paymentMethod === 'CASH') {
          await auditCashDrawerLimit(companyId, notify);
        }

        setCustomerName('');
        setSelectedPartnerId('');
        setPaymentMethod('CASH');
        await loadData();

        return true;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido ao processar pagamento.';
        console.error('[PDV Checkout Error]:', err);
        notify(errorMsg, 'error');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [companyId, customerName, paymentMethod, selectedPartnerId, loading, loadData, notify]
  );

  return {
    paymentMethod,
    setPaymentMethod,
    selectedPartnerId,
    setSelectedPartnerId,
    customerName,
    setCustomerName,
    loading,
    isNFCeModalOpen,
    setIsNFCeModalOpen,
    lastCompletedSale,
    handleCheckout,
  };
}