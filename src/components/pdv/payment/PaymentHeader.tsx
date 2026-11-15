"use client";

import React from "react";
import { X, ShoppingBag, Wallet, Banknote } from "lucide-react";
import { PDV_PAYMENT_TEXTS } from "@/constants/pdvPaymentConstants";
import { formatCurrency } from "@/utils/pdvPaymentUtils";

interface PaymentHeaderProps {
  onClose: () => void;
  totalCart: number;
  remainingAmount: number;
  changeAmount: number;
  isDarkMode?: boolean;
}

export function PaymentHeader({
  onClose,
  totalCart,
  remainingAmount,
  changeAmount,
  isDarkMode,
}: PaymentHeaderProps) {
  const dark = isDarkMode ?? false;

  const cardStyle = dark
    ? "bg-slate-800/70 border-slate-700"
    : "bg-slate-50 border-slate-200";

  const labelStyle = dark ? "text-slate-400" : "text-slate-500";

  return (
    <div className="space-y-2">
      {/* CABEÇALHO */}
      <div
        className={`flex items-center justify-between pb-2 border-b ${
          dark ? "border-slate-700" : "border-slate-100"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Wallet className="w-4 h-4" />
          </div>

          <div>
            <h3
              id="modal-title"
              className={`text-sm font-black tracking-tight ${
                dark ? "text-white" : "text-slate-900"
              }`}
            >
              {PDV_PAYMENT_TEXTS.modalTitle}
            </h3>

            <p className={`text-[10px] mt-0.5 ${labelStyle}`}>
              {PDV_PAYMENT_TEXTS.modalSubtitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={PDV_PAYMENT_TEXTS.ariaClose}
          className={`p-2 rounded-lg border transition-all duration-200 ${
            dark
              ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/30"
              : "bg-white border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200"
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* INDICADORES FINANCEIROS */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* TOTAL */}
        <div className={`rounded-xl border p-3 transition-colors ${cardStyle}`}>
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <ShoppingBag className="w-3.5 h-3.5 text-purple-500" />
            <span
              className={`text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wide ${labelStyle}`}
            >
              {PDV_PAYMENT_TEXTS.totalSale}
            </span>
          </div>

          <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 text-center tabular-nums">
            {formatCurrency(totalCart)}
          </p>
        </div>

        {/* RESTANTE */}
        <div className={`rounded-xl border p-3 transition-colors ${cardStyle}`}>
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Wallet className="w-3.5 h-3.5 text-amber-500" />
            <span
              className={`text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wide ${labelStyle}`}
            >
              {PDV_PAYMENT_TEXTS.remaining}
            </span>
          </div>

          <p className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 text-center tabular-nums">
            {formatCurrency(remainingAmount)}
          </p>
        </div>

        {/* TROCO */}
        <div
          className={`rounded-xl border p-3 transition-colors ${
            dark
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-emerald-50 border-emerald-100"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Banknote className="w-3.5 h-3.5 text-emerald-500" />
            <span
              className={`text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wide ${labelStyle}`}
            >
              {PDV_PAYMENT_TEXTS.change}
            </span>
          </div>

          <p className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 text-center tabular-nums">
            {formatCurrency(changeAmount)}
          </p>
        </div>
      </div>
    </div>
  );
}
