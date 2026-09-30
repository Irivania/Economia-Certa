'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export interface QuotationSupplierResult {
  quotationSupplierId: string;
  quotationId: string;
  title?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  closingTime?: string | null;
  status: string;
  totalOffered?: number | null;
  token?: string | null;
  companyName: string;
}

interface QuotationsListProps {
  isDarkMode: boolean;
  quotations: QuotationSupplierResult[];
  loading: boolean;
  activeBrandName: string;
}

export function QuotationsList({ isDarkMode, quotations, loading, activeBrandName }: QuotationsListProps) {
  const router = useRouter();

  return (
    <div className={`p-8 rounded-3xl shadow-2xl border space-y-6 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/80'}`}>
      <div className="flex justify-between items-center border-b pb-4 border-slate-500/10">
        <div>
          <h2 className="text-sm font-black tracking-tight">📋 Cotações para a Distribuidora: <span className="text-indigo-500 uppercase">{activeBrandName}</span></h2>
          <p className="text-xs opacity-60 mt-0.5">Preços e propostas enviados ficam vinculados a esta marca do portfólio.</p>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-500">
          {quotations.length} disponíveis
        </span>
      </div>

      {loading ? (
        <p className="text-xs opacity-60 py-12 text-center font-medium">A carregar cotações...</p>
      ) : quotations.length === 0 ? (
        <div className={`text-center py-16 border-2 border-dashed rounded-3xl ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <p className="opacity-60 text-xs font-medium">Não existem cotações atribuídas para a distribuidora {activeBrandName} no momento.</p>
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden shadow-inner ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-950/40' : 'border-slate-200 text-slate-600 bg-slate-50/50'}`}>
                <th className="p-4 font-bold">Empresa Lojista</th>
                <th className="p-4 font-bold">Título / Referência</th>
                <th className="p-4 font-bold text-center">Status da Proposta ({activeBrandName})</th>
                <th className="p-4 font-bold text-right">Total Oferecido (R$)</th>
                <th className="p-4 font-bold text-center">Ação</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
              {quotations.map((cot) => {
                const isResponded = cot.status === 'SENT' || cot.status === 'responded';
                return (
                  <tr key={cot.quotationSupplierId || cot.quotationId} className={`transition ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/60'}`}>
                    <td className="p-4 font-bold text-indigo-500">
                      🏪 {cot.companyName || 'Melo Perfumaria'}
                    </td>
                    <td className="p-4 font-semibold">{cot.title || 'Cotação de Reposição'}</td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`font-bold px-3 py-1 rounded-full text-[10px] border ${
                          isResponded ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {isResponded ? '✓ RESPONDIDA' : 'PENDENTE'}
                        </span>
                        {isResponded && (
                          <span className="text-[10px] text-emerald-500 font-medium italic">
                            Aguardando análise e feedback do lojista
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono font-bold opacity-90">
                      R$ {cot.totalOffered ? Number(cot.totalOffered).toFixed(2) : '0,00'}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          const targetToken = cot.token || cot.quotationId;
                          router.push(`/portal/cotacao/${targetToken}?brand=${encodeURIComponent(activeBrandName)}`);
                        }}
                        className={`font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-md ${
                          isResponded
                            ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 shadow-slate-900/10'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                        }`}
                      >
                        {isResponded ? 'Ver Proposta Enviada' : 'Responder Cotação'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}