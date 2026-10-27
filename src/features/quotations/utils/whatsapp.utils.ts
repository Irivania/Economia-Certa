import { ProcessedOrder } from '../types/order.types';
import { formatCurrency } from './currency.utils';

export function buildWhatsAppMessage(quotationTitle: string, order: ProcessedOrder): string {
  const itemsList = order.items
    .map((i) => `- ${i.description} (Qtd: ${i.quantity})`)
    .join('\n');

  return `*Pedido de Compra - ${quotationTitle}*\n` +
    `*Fornecedor:* ${order.supplierName}\n\n` +
    `*Condição de pagamento:* ${order.paymentTerms || 'Não informada'}\n\n` +
    `${itemsList}\n\n` +
    `*Total:* ${formatCurrency(order.totalOrder)}`;
}

export function openWhatsAppChat(quotationTitle: string, order: ProcessedOrder): void {
  const message = buildWhatsAppMessage(quotationTitle, order);
  const encoded = encodeURIComponent(message);
  window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank', 'noopener,noreferrer');
}