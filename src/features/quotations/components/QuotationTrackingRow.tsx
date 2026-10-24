'use client';

import { TrackingSupplier } from '../types/tracking.types';
import { QuotationTrackingStatus } from './QuotationTrackingStatus';
import { formatCurrency } from '../utils/formatCurrency';

interface QuotationTrackingRowProps {
  supplier: TrackingSupplier;
  index: number;
  isDarkMode: boolean;
  sendingId: string | null;
  onSend: (supplierId: string) => void;
}

export function QuotationTrackingRow({
  supplier,
  index,
  isDarkMode,
  sendingId,
  onSend,
}: QuotationTrackingRowProps) {
  const isSent = supplier.status === 'ENVIADO';
  const isAnswered = supplier.status === 'RESPONDIDO';
  const isSending = sendingId === supplier.id;
  const uniqueKey = `${supplier.id}-${index}`;

  return (
    <tr
      key={uniqueKey}
      className={`transition-colors align-middle ${
        isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'
      }`}
    >
      <td className="px-4 py-3 font-semibold">
        <div>{supplier.name}</div>
        {supplier.phone && (
          <div className="mt-0.5 text-[11px] font-normal text-slate-400">Tel: {supplier.phone}</div>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        <QuotationTrackingStatus status={supplier.status} />
      </td>
      <td className="px-4 py-3 text-center font-mono font-semibold">
        {formatCurrency(supplier.totalOffered)}
      </td>
      <td className="px-4 py-3 text-right">
        {isAnswered ? (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Cotação respondida
          </span>
        ) : isSent ? (
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            ✓ Cotação enviada ao representante
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onSend(supplier.id)}
            disabled={isSending}
            aria-busy={isSending}
            aria-label={`Enviar cotação diretamente para ${supplier.name}`}
            className="inline-flex rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-500 disabled:opacity-50 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            {isSending ? 'A enviar...' : '📨 Enviar direto'}
          </button>
        )}
      </td>
    </tr>
  );
}