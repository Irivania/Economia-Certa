'use client';

import React from 'react';
import Image from 'next/image';

interface QuotationItem {
  id: string;
  productName: string;
  barcode: string;
  description: string;
  imageUrl?: string | null;
  quantity: number;
  unit: string;
}

interface SupplierQuotationTableProps {
  items: QuotationItem[];
  isDarkMode: boolean;
  prices: Record<string, string>;
  outOfStock: Record<string, boolean>;
  submitting: boolean;
  inputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  onPriceChange: (itemId: string, value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
  onToggleOutOfStock: (itemId: string) => void;
}

export function SupplierQuotationTable({
  items,
  isDarkMode,
  prices,
  outOfStock,
  submitting,
  inputRefs,
  onPriceChange,
  onKeyDown,
  onToggleOutOfStock,
}: SupplierQuotationTableProps) {
  return (
    <div className={`rounded-3xl border overflow-hidden shadow-2xl backdrop-blur-md ${isDarkMode ? 'bg-slate-900/90 border-slate-800 shadow-black/50' : 'bg-white border-slate-200/80 shadow-slate-200/60'}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={`border-b text-[11px] uppercase tracking-wider font-extrabold ${isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-950/60' : 'border-slate-100 text-slate-500 bg-slate-50/80'}`}>
              <th className="py-4 px-6 w-20 text-center">Foto</th>
              <th className="py-4 px-6">Produto / Descrição</th>
              <th className="py-4 px-6 font-mono">Cód. Barras</th>
              <th className="py-4 px-6 text-center">Qtd. Solicitada</th>
              <th className="py-4 px-6 text-right">Preço Unitário (R$)</th>
              <th className="py-4 px-6 text-center">Indisponível / Sem Estoque</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
            {items.map((item, index) => {
              const isUnavailable = outOfStock[item.id] || false;
              return (
                <tr key={item.id} className={`group transition-all ${isUnavailable ? (isDarkMode ? 'bg-red-950/20 opacity-60' : 'bg-red-50/50 opacity-70') : (isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80')}`}>
                  <td className="py-4 px-6 text-center">
                    {item.imageUrl ? (
                      <div className="w-12 h-12 relative rounded-2xl overflow-hidden border border-slate-500/20 mx-auto shadow-sm group-hover:scale-105 transition duration-300">
                        <Image src={item.imageUrl} alt={item.productName} fill sizes="48px" className="object-cover" />
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-bold mx-auto border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                        📦
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <p className={`font-bold text-sm leading-snug ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{item.productName}</p>
                    {item.description && <p className="text-[11px] opacity-60 mt-0.5 font-medium">{item.description}</p>}
                  </td>
                  <td className="py-4 px-6 font-mono text-[11px] opacity-70">{item.barcode}</td>
                  <td className="py-4 px-6 text-center font-mono font-bold text-indigo-500 text-sm">
                    <span className={`px-3 py-1.5 rounded-xl border ${isDarkMode ? 'bg-indigo-950/30 border-indigo-800/50' : 'bg-indigo-50 border-indigo-100'}`}>
                      {Number(item.quantity)} {item.unit}
                    </span>
                  </td>
                  
                  <td className="py-4 px-6 text-right">
                    <input
                      ref={(el) => { inputRefs.current[item.id] = el; }}
                      type="text"
                      disabled={isUnavailable || submitting}
                      placeholder={isUnavailable ? 'Indisponível' : 'R$ 0,00'}
                      value={prices[item.id] || ''}
                      onChange={(e) => onPriceChange(item.id, e.target.value)}
                      onKeyDown={(e) => onKeyDown(e, index)}
                      className={`w-40 px-4 py-2.5 text-right font-mono text-sm font-bold border rounded-2xl outline-none transition-all shadow-sm ${
                        isUnavailable ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-900' : ''
                      } ${
                        prices[item.id] ? 'border-emerald-500 ring-2 ring-emerald-500/20' : ''
                      } ${
                        isDarkMode 
                          ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20'
                      }`}
                    />
                  </td>

                  <td className="py-4 px-6 text-center">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        disabled={submitting}
                        checked={isUnavailable}
                        onChange={() => onToggleOutOfStock(item.id)}
                        className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 cursor-pointer"
                      />
                      <span className={`text-[11px] font-bold ${isUnavailable ? 'text-red-500' : 'opacity-60'}`}>
                        {isUnavailable ? 'Produto em Falta' : 'Indisponível'}
                      </span>
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}