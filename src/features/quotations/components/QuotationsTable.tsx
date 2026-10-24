'use client';

import { memo } from 'react';
import { Quotation } from '../types/quotation.types';
import { QuotationRow } from './QuotationRow';
import { EmptyQuotationsState } from './EmptyQuotationsState';

interface QuotationsTableProps {
  quotations: Quotation[];
  loading: boolean;
  isDarkMode: boolean;
  onDelete: (quotation: Quotation) => void;
  onCancel: (quotation: Quotation) => void;
}

export const QuotationsTable = memo(function QuotationsTable({
  quotations,
  loading,
  isDarkMode,
  onDelete,
  onCancel,
}: QuotationsTableProps) {
  return (
    <div className="w-full pb-16">
      {loading || quotations.length === 0 ? (
        <EmptyQuotationsState loading={loading} />
      ) : (
        <div className="w-full">
          <table className="w-full border-collapse text-left text-xs" aria-label="Tabela de Cotações">
            <thead>
              <tr className={`border-b uppercase tracking-wider text-[11px] font-bold ${
                isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-950/50' : 'border-slate-200 text-slate-500 bg-slate-50/90'
              }`}>
                <th scope="col" className="p-4 font-bold min-w-[220px]">Título / Pagamento</th>
                <th scope="col" className="p-4 text-center font-bold">Início</th>
                <th scope="col" className="p-4 text-center font-bold">Término & Fecho</th>
                <th scope="col" className="p-4 font-bold min-w-[260px]">Fornecedores Convidados</th>
                <th scope="col" className="p-4 text-center font-bold">Status</th>
                <th scope="col" className="p-4 text-right font-bold min-w-[180px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {quotations.map((quotation) => (
                <QuotationRow
                  key={quotation.id}
                  quotation={quotation}
                  isDarkMode={isDarkMode}
                  onDelete={onDelete}
                  onCancel={onCancel}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});