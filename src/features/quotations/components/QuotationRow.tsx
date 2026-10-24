'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Quotation } from '../types/quotation.types';
import { formatDate } from '../utils/formatDate';
import { formatQuotationStatus } from '../utils/formatQuotationStatus';
import { SUPPLIER_STATUS_CLASSES } from '../constants/quotation.constants';
import { QuotationActionsDropdown } from './QuotationActionsDropdown';

interface QuotationRowProps {
  quotation: Quotation;
  isDarkMode: boolean;
  onDelete: (quotation: Quotation) => void;
  onCancel: (quotation: Quotation) => void;
}

export const QuotationRow = memo(function QuotationRow({
  quotation,
  isDarkMode,
  onDelete,
  onCancel,
}: QuotationRowProps) {
  return (
    <tr className={`group transition-all align-middle ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}`}>
      <td className="p-4">
        <div className="font-semibold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {quotation.title}
        </div>
        {quotation.paymentTerms && (
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Pagamento: <strong className="font-mono">{quotation.paymentTerms}</strong>
          </div>
        )}
      </td>
      <td className="p-4 text-center font-mono text-slate-600 dark:text-slate-400 text-xs">
        {formatDate(quotation.startDate)}
      </td>
      <td className="p-4 text-center font-mono text-slate-600 dark:text-slate-400 text-xs">
        <div>{formatDate(quotation.endDate)}</div>
        {quotation.closingTime && <div className="text-[10px] text-slate-400 font-sans">às {quotation.closingTime}</div>}
      </td>
      <td className="p-4">
        {quotation.suppliers && quotation.suppliers.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {quotation.suppliers.map((sup, idx) => {
              const statusClass = SUPPLIER_STATUS_CLASSES[sup.status] || SUPPLIER_STATUS_CLASSES['ENVIADO'];
              return (
                <span
                  key={idx}
                  className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-all ${statusClass}`}
                  title={`Status: ${sup.status}`}
                >
                  {sup.name}
                </span>
              );
            })}
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Nenhum fornecedor vinculado</span>
        )}
      </td>
      <td className="p-4 text-center">
        <span className="inline-flex rounded-md bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          {formatQuotationStatus(quotation.status)}
        </span>
      </td>
      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link 
            href={`/cotacoes/respostas/${quotation.id}`} 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-xs active:scale-95"
            aria-label={`Ver respostas da cotação ${quotation.title}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Respostas</span>
          </Link>

          <QuotationActionsDropdown 
            quotation={quotation}
            isDarkMode={isDarkMode}
            onDelete={onDelete}
            onCancel={onCancel}
          />
        </div>
      </td>
    </tr>
  );
});