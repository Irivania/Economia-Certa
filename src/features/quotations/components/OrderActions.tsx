import { ProcessedOrder } from '../types/order.types';
import { useOrderClipboard } from '../hooks/useOrderClipboard';
import { useOrderWhatsapp } from '../hooks/useOrderWhatsapp';

interface OrderActionsProps {
  order: ProcessedOrder;
  quotationTitle: string;
  onSendOrder?: () => void;
}

export function OrderActions({ order, quotationTitle, onSendOrder }: OrderActionsProps) {
  const { copyOrderToClipboard } = useOrderClipboard(quotationTitle);
  const { sendViaWhatsApp } = useOrderWhatsapp(quotationTitle);

  return (
    <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex flex-wrap justify-end gap-2.5 bg-slate-50/60 dark:bg-slate-950/40">
      <button
        type="button"
        onClick={() => {
          copyOrderToClipboard(order);
          onSendOrder?.();
        }}
        aria-label={`Copiar pedido para ${order.supplierName} para a área de transferência`}
        className="px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-xs bg-white border-slate-200 hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-200"
      >
        📋 Copiar Pedido para Envio
      </button>
      
      <button
        type="button"
        onClick={() => {
          sendViaWhatsApp(order);
          onSendOrder?.();
        }}
        aria-label={`Enviar pedido para ${order.supplierName} via WhatsApp`}
        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
      >
        💬 Enviar via WhatsApp
      </button>
    </div>
  );
}