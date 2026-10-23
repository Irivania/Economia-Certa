'use client';

import React from 'react';
import { X } from 'lucide-react';
import { PDV_PAYMENT_TEXTS } from '@/constants/pdvPaymentConstants';
import { formatCurrency } from '@/utils/pdvPaymentUtils';

interface PaymentHeaderProps {
  onClose: () => void;
  totalCart: number;
  remainingAmount: number;
  changeAmount: number;
  isDarkMode?: boolean; // Opcional para evitar warnings caso não use
}

export function PaymentHeader({
  onClose,
  totalCart,
  remainingAmount,
  changeAmount,
}: PaymentHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Topo / Cabeçalho */}
      <div className="flex justify-between items-center border-b pb-4 border-slate-500/10">
        <div>
          <h3 id="modal-title" className="text-base font-black uppercase tracking-wider">
            {PDV_PAYMENT_TEXTS.modalTitle}
          </h3>
          <p className="text-xs opacity-60 mt-0.5">{PDV_PAYMENT_TEXTS.modalSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={PDV_PAYMENT_TEXTS.ariaClose}
          className="p-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 font-bold cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Resumo de Valores */}
      <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-500/5 border border-slate-500/10 text-center font-mono">
        <div>
          <span className="block text-[10px] uppercase font-bold opacity-60">{PDV_PAYMENT_TEXTS.totalSale}</span>
          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(totalCart)}</span>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-bold opacity-60">{PDV_PAYMENT_TEXTS.remaining}</span>
          <span className="text-sm font-black text-amber-600 dark:text-amber-400">{formatCurrency(remainingAmount)}</span>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-bold opacity-60">{PDV_PAYMENT_TEXTS.change}</span>
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(changeAmount)}</span>
        </div>
      </div>
    </div>
  );
}