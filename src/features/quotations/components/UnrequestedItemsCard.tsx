import Image from 'next/image';
import { UnrequestedItem } from '../types/order.types';

interface UnrequestedItemsCardProps {
  unrequestedItems: UnrequestedItem[];
}

export function UnrequestedItemsCard({ unrequestedItems }: UnrequestedItemsCardProps) {
  if (unrequestedItems.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 overflow-hidden bg-amber-50/50 dark:bg-amber-950/10 shadow-xs">
      <div className="border-b border-amber-200 dark:border-amber-500/20 px-6 py-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
          🚫 Itens não pedidos
        </h2>
      </div>
      <div className="p-6 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-amber-200 dark:border-amber-500/20 text-[11px] uppercase text-amber-700 dark:text-amber-400 font-bold">
              <th className="px-4 py-3">Imagem</th>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Quantidade</th>
              <th className="px-4 py-3">Motivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-200/50 dark:divide-amber-500/10">
            {unrequestedItems.map((item) => (
              <tr key={item.productId} className="align-middle">
                <td className="px-4 py-3">
                  <div className="relative h-9 w-9 overflow-hidden rounded-md border border-amber-200 dark:border-amber-800 bg-white">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={`Imagem do item não pedido ${item.description}`}
                        fill
                        sizes="36px"
                        className="object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xs">📦</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{item.description}</td>
                <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">{item.quantity}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{item.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}