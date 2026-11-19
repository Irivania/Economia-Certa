"use client";

import { Package, Pencil, X, Check, ShoppingCart } from "lucide-react";
import type { CartItem } from "@/types/pdv";

interface PDVCartListProps {
  cart: CartItem[];
  onRequestAction: (type: "REMOVE" | "EDIT", productId: string) => void;
  editingProductId: string | null;
  editPrice: string;
  setEditPrice: (val: string) => void;
  editQty: string;
  setEditQty: (val: string) => void;
  onSaveEdit: (productId: string) => void;
  onCancelEdit: () => void;
}

const inputCls =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold tabular-nums text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50";

export function PDVCartList({
  cart,
  onRequestAction,
  editingProductId,
  editPrice,
  setEditPrice,
  editQty,
  setEditQty,
  onSaveEdit,
  onCancelEdit,
}: PDVCartListProps) {
  if (cart.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center text-slate-400 dark:text-slate-500">
        <ShoppingCart className="h-8 w-8" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Caixa livre
        </p>
        <p className="text-xs">Aguardando leitura de produtos…</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Cabeçalho da tabela */}
      <div className="hidden grid-cols-[minmax(0,1fr)_110px_110px] gap-4 border-b border-slate-100 px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:text-slate-500 sm:grid">
        <span>Produto</span>
        <span className="text-right">Unitário</span>
        <span className="text-right">Subtotal</span>
      </div>

      <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
        {cart.map((item, idx) => {
          const isEditing = editingProductId === item.productId;

          return (
            <li key={item.productId} className="group px-3 py-3">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:grid-cols-[minmax(0,1fr)_110px_110px]">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-5 shrink-0 text-right font-mono text-xs text-slate-400 dark:text-slate-500">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.description}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {item.description}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 font-semibold tabular-nums text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        {item.quantity} un
                      </span>
                      <span className="tabular-nums sm:hidden">
                        × R$ {item.unitPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="hidden text-right text-sm tabular-nums text-slate-500 dark:text-slate-400 sm:block">
                  R$ {item.unitPrice.toFixed(2)}
                </div>
                <div className="text-right text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                  R$ {item.subtotal.toFixed(2)}
                </div>
              </div>

              {!isEditing ? (
                <div className="mt-2 flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onRequestAction("EDIT", item.productId)}
                    className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Alterar (gerente)
                  </button>
                  <button
                    type="button"
                    onClick={() => onRequestAction("REMOVE", item.productId)}
                    className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                  >
                    <X className="h-3.5 w-3.5" /> Cancelar item
                  </button>
                </div>
              ) : (
                <div className="mt-3 space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-50/60 p-3 dark:bg-emerald-500/5">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="space-y-1">
                      <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                        Preço (R$)
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className={inputCls}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                        Quantidade
                      </span>
                      <input
                        type="number"
                        value={editQty}
                        onChange={(e) => setEditQty(e.target.value)}
                        className={inputCls}
                      />
                    </label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className="h-8 rounded-lg px-3 text-xs font-medium text-slate-600 transition hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => onSaveEdit(item.productId)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      <Check className="h-3.5 w-3.5" /> Salvar
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
