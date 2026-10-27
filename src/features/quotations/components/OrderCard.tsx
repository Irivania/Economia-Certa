import { ProcessedOrder, OrderStatus } from '../types/order.types';
import { OrderHeader } from './OrderHeader';
import { OrderItemsTable } from './OrderItemsTable';
import { OrderActions } from './OrderActions';

interface OrderCardProps {
  order: ProcessedOrder;
  quotationTitle: string;
  onSendOrder: (orderKey: string) => void;
  onUpdateStatus: (orderKey: string, status: OrderStatus) => void;
}

export function OrderCard({ order, quotationTitle, onSendOrder, onUpdateStatus }: OrderCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-all bg-white dark:bg-slate-900">
      <OrderHeader order={order} onUpdateStatus={onUpdateStatus} />
      <OrderItemsTable items={order.items} />
      
      <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-3 text-xs text-slate-600 dark:text-slate-400">
        <span className="font-semibold">Condição de pagamento:</span>{' '}
        {order.paymentTerms || 'Não informada'}
      </div>

      <OrderActions 
        order={order} 
        quotationTitle={quotationTitle} 
        onSendOrder={() => onSendOrder(order.orderKey)} 
      />
    </div>
  );
}