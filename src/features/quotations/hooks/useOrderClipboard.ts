'use client';

import { useCallback } from 'react';
import { ProcessedOrder } from '../types/order.types';
import { formatCurrency } from '../utils/currency.utils';

export function useOrderClipboard(quotationTitle?: string) {
  const copyOrderToClipboard = useCallback(async (order: ProcessedOrder) => {
    const text = `*Pedido de Compra - ${quotationTitle || 'Cotação'}*\n*Fornecedor:* ${order.supplierName}\n\n` +
      `*Condição de pagamento:* ${order.paymentTerms || 'Não informada'}\n\n` +
      order.items.map(i => `- ${i.description} | Qtd: ${i.quantity} | Preço: ${formatCurrency(i.price)}`).join('\n') +
      `\n\n*Total:* ${formatCurrency(order.totalOrder)}`;

    try {
      await navigator.clipboard.writeText(text);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `Pedido para ${order.supplierName} copiado!`, type: 'success' } }));
    } catch {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Erro ao copiar pedido.', type: 'error' } }));
    }
  }, [quotationTitle]);

  return { copyOrderToClipboard };
}