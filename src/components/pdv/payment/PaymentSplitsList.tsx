'use client';

import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import { PDV_PAYMENT_TEXTS } from '@/constants/pdvPaymentConstants';
import { formatCurrency, formatMethodName } from '@/utils/pdvPaymentUtils';
import { PaymentSplit } from '../PDVPaymentModal';

interface PaymentSplitsListProps {
  splits: PaymentSplit[];
  onRemoveSplit: (id: string) => void;
  onClose: () => void;
  onFinish: () => void;
  totalPaid: number;
  totalCart: number;
  changeAmount: number;
}

export function PaymentSplitsList({
  splits,
  onRemoveSplit,
  onClose,
  onFinish,
  totalPaid,
  totalCart,
  changeAmount,
}: PaymentSplitsListProps) {
  return (
    <div className="space-y-6">
      {/* Lista de Pagamentos Adicionados */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold uppercase tracking-wider opacity-70">
            {PDV_PAYMENT_TEXTS.addedSplitsHeader(splits.length)}
          </h4>
          {splits.length > 0 && (
            <span className="text-[10px] font-mono opacity-50">[DEL] Remove última | [Ctrl + Backspace] Limpa tudo</span>
          )}
        </div>
        <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
          {splits.length === 0 ? (
            <p className="text-xs text-center py-6 opacity-40 font-mono">{PDV_PAYMENT_TEXTS.emptySplitsText}</p>
          ) : (
            splits.map((s) => (
              <div key={s.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-500/5 border border-slate-500/10 font-mono text-xs">
                <span className="font-bold">{formatMethodName(s.method)}</span>
                <div className="flex items-center gap-4">
                  <span className="text-emerald-600 font-black">{formatCurrency(s.amount)}</span>
                  <button 
                    type="button" 
                    onClick={() => onRemoveSplit(s.id)} 
                    aria-label={PDV_PAYMENT_TEXTS.ariaRemoveSplit(formatMethodName(s.method))} 
                    className="text-rose-500 hover:opacity-100 opacity-60 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Botão Final com Atalho [F10] */}
      <div className="pt-4 border-t border-slate-500/10 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-3 rounded-xl text-xs font-bold bg-slate-500/10 cursor-pointer"
        >
          {PDV_PAYMENT_TEXTS.cancelButton}
        </button>
        <button
          type="button"
          disabled={totalPaid < totalCart}
          onClick={onFinish}
          className="px-8 py-3 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
        >
          <Check className="w-4 h-4" /> {PDV_PAYMENT_TEXTS.finishButton(changeAmount.toFixed(2))}
        </button>
      </div>
    </div>
  );
}