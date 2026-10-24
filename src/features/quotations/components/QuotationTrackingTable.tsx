'use client';

import { TrackingSupplier } from '../types/tracking.types';
import { QuotationTrackingRow } from './QuotationTrackingRow';
import { TrackingEmptyState } from './TrackingEmptyState';

interface QuotationTrackingTableProps {
  tracking: TrackingSupplier[];
  isDarkMode: boolean;
  sendingId: string | null;
  onSend: (supplierId: string) => void;
}

export function QuotationTrackingTable({
  tracking,
  isDarkMode,
  sendingId,
  onSend,
}: QuotationTrackingTableProps) {
  return (
    <section
      className={`overflow-hidden rounded-xl border shadow-xs ${
        isDarkMode ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200/90 bg-white text-slate-900'
      }`}
    >
      <div className={`border-b p-5 ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/70'}`}>
        <h2 className="text-xs font-bold uppercase tracking-wider">
          Distribuidoras participantes ({tracking.length})
        </h2>
        <p className="mt-0.5 text-[11px] text-slate-500">O envio é feito uma única vez para cada distribuidora.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs" aria-label="Tabela de acompanhamento de distribuidores">
          <thead
            className={`border-b uppercase tracking-wider text-[11px] font-bold ${
              isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-900/30' : 'border-slate-100 text-slate-500 bg-slate-50/60'
            }`}
          >
            <tr>
              <th scope="col" className="px-4 py-3">Distribuidora</th>
              <th scope="col" className="px-4 py-3 text-center">Status</th>
              <th scope="col" className="px-4 py-3 text-center">Total oferecido</th>
              <th scope="col" className="px-4 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {tracking.length === 0 ? (
              <TrackingEmptyState />
            ) : (
              tracking.map((supplier, index) => (
                <QuotationTrackingRow
                  key={`${supplier.id}-${index}`}
                  supplier={supplier}
                  index={index}
                  isDarkMode={isDarkMode}
                  sendingId={sendingId}
                  onSend={onSend}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}