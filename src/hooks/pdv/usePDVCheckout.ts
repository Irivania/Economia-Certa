'use client';

import { useState, useCallback } from 'react';
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
  name: string;
  creditLimit: string;
  currentBalance: string;
}

interface PaymentSplit {
  method: string;
  amount: number;
}

interface UsePDVCheckoutProps {
  companyId: string | null;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  selectedPartnerId: string;
  setSelectedPartnerId: (id: string) => void;
  partners: PartnerItem[];
  totalCart: number;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  loadData: () => Promise<void>;
}

export function usePDVCheckout({
  companyId,
  cart,
  setCart,
  customerName,
  setCustomerName,
  selectedPartnerId,
  setSelectedPartnerId,
  partners,
  totalCart,
  searchInputRef,
  loadData,
}: UsePDVCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'CONVENIO'>('CASH');

  const handleCheckout = useCallback(async (splits?: PaymentSplit[], changeAmount?: number) => {
    if (cart.length === 0) {
      alert('O carrinho está vazio.');
      return;
    }

    let finalCustomerName = customerName || 'Cliente Balcão';
    const primaryMethod = splits && splits.length > 0 ? splits[0].method : paymentMethod;

    if (primaryMethod === 'CONVENIO') {
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
          partnerId: primaryMethod === 'CONVENIO' ? selectedPartnerId : null,
          items: cart,
          paymentMethod: primaryMethod,
          paymentSplits: splits || [{ method: primaryMethod, amount: totalCart }],
          changeGiven: changeAmount || 0,
          totalAmount: totalCart,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao finalizar venda.');

      const changeText = changeAmount && changeAmount > 0 ? ` | Troco: R$ ${changeAmount.toFixed(2)}` : '';
      alert(`Venda finalizada com sucesso! ID: ${data.saleId.substring(0, 8)}${changeText} 🖨️`);

      setCart([]);
      setCustomerName('');
      setSelectedPartnerId('');
      setPaymentMethod('CASH');
      await loadData();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Erro ao processar pagamento.');
    } finally {
      setLoading(false);
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  }, [cart, customerName, paymentMethod, selectedPartnerId, partners, totalCart, companyId, loadData, setCart, setCustomerName, setSelectedPartnerId, searchInputRef]);

  return {
    loading,
    paymentMethod,
    setPaymentMethod,
    handleCheckout,
  };
}