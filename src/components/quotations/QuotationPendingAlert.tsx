'use client';

import React from 'react';

interface QuotationPendingAlertProps {
  isDarkMode: boolean;
  pendingCount: number;
}

export function QuotationPendingAlert({ isDarkMode, pendingCount }: QuotationPendingAlertProps) {
  if (pendingCount <= 0) return null;

  return (
    <div className={`rounded-xl border p-5 shadow-xs space-y-1.5 ${
      isDarkMode ? 'border-amber-500/30 bg-slate-900' : 'border-amber-200 bg-slate-50/80'
    }`}>
      <span className="inline-flex rounded-md bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border border-amber-500/20">
        ⚠️ Atenção: Gestão de Pendências
      </span>
      <h3 className="text-xs font-bold tracking-tight text-amber-700 dark:text-amber-300">
        Produtos sem fornecedor selecionado ou não atendidos ({pendingCount})
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Certifique-se de alocar todos os itens necessários antes de despachar os pedidos de compra para os distribuidores.
      </p>
    </div>
  );
}