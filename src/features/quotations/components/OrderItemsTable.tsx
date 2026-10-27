import Image from 'next/image';
import { OrderItem } from '../types/order.types';
import { formatCurrency } from '../utils/currency.utils';

interface OrderItemsTableProps {
  items: OrderItem[];
}

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  return (
    <div className="p-6 overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider text-[11px] font-bold text-slate-500 bg-slate-50/60 dark:text-slate-400 dark:bg-slate-950/30">
            <th className="px-4 py-3">Imagem</th>
            <th className="px-4 py-3">Produto</th>
            <th className="px-4 py-3 text-center">Quantidade</th>
            <th className="px-4 py-3 text-right">Preço Unitário</th>
            <th className="px-4 py-3 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((item, idx) => (
            <tr key={`${item.productId}-${idx}`} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 align-middle">
              <td className="px-4 py-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={`Imagem do produto ${item.description}`}
                      fill
                      sizes="40px"
                      className="object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs">📦</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 font-semibold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white">
                {item.description}
              </td>
              <td className="px-4 py-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                {item.quantity}
              </td>
              <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                {formatCurrency(item.price)}
              </td>
              <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(item.price * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}