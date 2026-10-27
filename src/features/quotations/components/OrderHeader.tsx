import { ProcessedOrder, OrderStatus } from '../types/order.types';
import { formatCurrency } from '../utils/currency.utils';

interface OrderHeaderProps {
  order: ProcessedOrder;
  onUpdateStatus?: (orderKey: string, status: OrderStatus) => void;
}

export function OrderHeader({ order }: OrderHeaderProps) {
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50/80 dark:bg-slate-950/40">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          📦 Pedido para: {order.supplierName}
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">{order.items.length} item(ns) selecionado(s)</p>
      </div>
      <div className="text-right">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total do Pedido:</span>
        <p className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
          {formatCurrency(order.totalOrder)}
        </p>
      </div>
    </div>
  );
}