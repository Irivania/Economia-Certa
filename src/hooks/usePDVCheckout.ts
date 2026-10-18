'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/apiClient';

interface CartItem {
  productId: string;
  description: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl: string | null;
}

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

interface CompletedSaleData {
  saleId: string;
  operatorName: string;
  customerName: string;
  paymentMethod: string;
  total: number;
  items: CartItem[];
}

export function usePDVCheckout(companyId: string, loadData: () => Promise<void>) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CASH');
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);

  const [isNFCeModalOpen, setIsNFCeModalOpen] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<CompletedSaleData | null>(null);

  const handleCheckout = async (cart: CartItem[], totalCart: number, partners: PartnerItem[]) => {
    if (cart.length === 0) {
      alert('O carrinho está vazio.');
      return;
    }

    let finalCustomerName = customerName || 'Cliente Balcão';

    if (paymentMethod === 'CONVENIO') {
      if (!selectedPartnerId) {
        alert('Selecione o funcionário ou empresa parceira para faturamento no convênio.');
        return;
      }
      const partner = partners.find(p => p.id === selectedPartnerId);
      if (partner) {
        const limit = Number(partner.creditLimit || 0);
        const currentDebt = Number(partner.currentBalance || 0);
        if (currentDebt + totalCart > limit) {
          alert(`Limite de crédito excedido para ${partner.name}!\nLimite: R$ ${limit.toFixed(2)} | Saldo Devedor: R$ ${currentDebt.toFixed(2)}`);
          return;
        }
        finalCustomerName = `CONVÊNIO: ${partner.name}`;
      }
    }

    try {
      setLoading(true);

      const res = await apiFetch('/api/pdv/checkout', {
        method: 'POST',
        body: JSON.stringify({
          companyId,
          mode: 'CASHIER',
          operatorName: 'Operador de Caixa',
          customerName: finalCustomerName,
          partnerId: paymentMethod === 'CONVENIO' ? selectedPartnerId : null,
          items: cart,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao finalizar venda.');

      setLastCompletedSale({
        saleId: data.saleId,
        operatorName: 'Operador de Caixa',
        customerName: finalCustomerName,
        paymentMethod,
        total: totalCart,
        items: [...cart],
      });
      setIsNFCeModalOpen(true);

      // Verificação de segurança: Alerta de Limite Máximo em Gaveta para pagamentos em Dinheiro (CASH)
      if (paymentMethod === 'CASH') {
        try {
          const regRes = await apiFetch(`/api/pdv/register?companyId=${companyId}`);
          const regData = await regRes.json();
          if (regData.isOpen && regData.register) {
            let cashTotal = Number(regData.register.openingAmount || 0);
            if (regData.transactions) {
              regData.transactions.forEach((tx: { type: string; amount: string | number }) => {
                if (tx.type === 'SUPPLY') cashTotal += Number(tx.amount);
                if (tx.type === 'BLEED') cashTotal -= Number(tx.amount);
              });
            }
            if (regData.sales) {
              regData.sales.forEach((s: { paymentMethod: string; total: string | number }) => {
                if (s.paymentMethod === 'CASH') cashTotal += Number(s.total);
              });
            }

            const SAFETY_LIMIT = 500.00;
            if (cashTotal > SAFETY_LIMIT) {
              alert(
                `🚨 ALERTA DE SEGURANÇA: EXCESSO DE DINHEIRO EM GAVETA!\n\n` +
                `O montante acumulado em espécie atingiu R$ ${cashTotal.toFixed(2)} (Limite: R$ ${SAFETY_LIMIT.toFixed(2)}).\n` +
                `Por motivos de segurança contra assaltos, aceda a "Gestão de Turno / Pausa / Fecho" e efetue uma Sangria de Segurança para o cofre imediatamente!`
              );
            }
          }
        } catch (secErr) {
          console.error('Erro ao auditar limite de gaveta:', secErr);
        }
      }

      setCustomerName('');
      setSelectedPartnerId('');
      setPaymentMethod('CASH');
      await loadData();
      return true;
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Erro ao processar pagamento.');
      return false;
    } finally {
      setLoading(false);
    }
  };

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