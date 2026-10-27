import { OrderStatus } from '../types/order.types';

interface OrderStatusActionsProps {
  status?: OrderStatus;
  onUpdateStatus: (status: 'RECEIVED' | 'CLOSED') => void;
}

export function OrderStatusActions({ status, onUpdateStatus }: OrderStatusActionsProps) {
  return (
    <div className="mt-2 flex flex-wrap justify-end gap-2">
      <button 
        type="button" 
        onClick={() => onUpdateStatus('RECEIVED')} 
        disabled={status === 'RECEIVED' || status === 'CLOSED'} 
        aria-label="Confirmar recebimento do pedido"
        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-xs disabled:opacity-50 cursor-pointer"
      >
        {status === 'RECEIVED' || status === 'CLOSED' ? '✓ Recebido' : 'Confirmar recebimento'}
      </button>
      <button 
        type="button" 
        onClick={() => onUpdateStatus('CLOSED')} 
        disabled={status !== 'RECEIVED'} 
        aria-label="Dar baixa na cotação"
        className="rounded-lg bg-slate-700 px-3 py-1.5 text-[10px] font-bold text-white shadow-xs disabled:opacity-50 cursor-pointer"
      >
        {status === 'CLOSED' ? '✓ Cotação baixada' : 'Dar baixa na cotação'}
      </button>
    </div>
  );
}