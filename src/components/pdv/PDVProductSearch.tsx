"use client";

import { Search, Package, Plus } from "lucide-react";
import { formatBRL } from "@/lib/pdv/format";
import type { ProductItem } from "@/types/pdv";

interface PDVProductSearchProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filteredProducts: ProductItem[];
  inputRef: React.RefObject<HTMLInputElement | null>;
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  itemRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  selectProduct: (product: ProductItem) => void;
  isDarkMode: boolean;
  isOperator?: boolean;
}

export function PDVProductSearch({
  searchTerm,
  setSearchTerm,
  filteredProducts,
  inputRef,
  selectedIndex,
  itemRefs,
  setSelectedIndex,
  onKeyDown,
  selectProduct,
  isDarkMode,
  isOperator = false,
}: PDVProductSearchProps) {
  const showResults = searchTerm.trim().length > 0;

  return (
    <div className="relative space-y-3">
      <div className="relative">
        <Search
          className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Bipe o código ou digite o nome — ex: 4*7890123456789"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={onKeyDown}
          className={`h-14 w-full rounded-xl border pl-12 pr-24 text-base font-medium outline-none transition placeholder:font-normal focus:ring-4 ${
            isDarkMode
              ? "border-slate-700 bg-slate-950 text-slate-50 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/15"
              : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-emerald-500/15"
          }`}
          autoFocus
        />
        <kbd
          className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-md border px-2 py-1 font-mono text-[11px] font-semibold ${
            isDarkMode
              ? "border-slate-700 bg-slate-900 text-slate-400"
              : "border-slate-200 bg-white text-slate-500"
          }`}
        >
          Enter ↵
        </kbd>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>
          Use <span className="font-mono font-semibold">qtd*código</span> para
          várias unidades · ↑ ↓ para navegar
        </p>
        {!isOperator && (
          <a
            href="/financeiro/convenios"
            className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:text-emerald-800 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <Plus className="h-3.5 w-3.5" /> Cadastrar convênios
          </a>
        )}
      </div>

      {showResults && (
        <div
          className={`absolute left-0 right-0 top-[3.75rem] z-30 max-h-80 overflow-y-auto rounded-xl border p-1.5 shadow-2xl ${
            isDarkMode
              ? "border-slate-700 bg-slate-900 shadow-black/40"
              : "border-slate-200 bg-white shadow-slate-900/10"
          }`}
        >
          {filteredProducts.length === 0 ? (
            <p
              className={`p-6 text-center text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              Nenhum produto encontrado.
            </p>
          ) : (
            filteredProducts.map((p, idx) => {
              const isSelected = idx === selectedIndex;
              const lowStock = p.stockCurrent <= 0;
              return (
                <button
                  key={p.id}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  type="button"
                  onClick={() => {
                    selectProduct(p);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg p-2.5 text-left transition ${
                    isSelected
                      ? isDarkMode
                        ? "bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/40"
                        : "bg-emerald-50 ring-1 ring-inset ring-emerald-500/30"
                      : isDarkMode
                        ? "hover:bg-slate-800"
                        : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg ring-1 ring-inset ${
                        isDarkMode
                          ? "bg-slate-800 ring-slate-700"
                          : "bg-slate-100 ring-slate-200"
                      }`}
                    >
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.description}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package
                          className={`h-5 w-5 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`line-clamp-1 text-sm font-semibold ${isDarkMode ? "text-slate-50" : "text-slate-900"}`}
                      >
                        {p.description}
                      </div>
                      <div
                        className={`mt-0.5 flex items-center gap-2 text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                      >
                        <span className="font-mono">{p.ean || "Sem EAN"}</span>
                        <span className="h-1 w-1 rounded-full bg-current opacity-40" />
                        <span
                          className={
                            lowStock ? "font-medium text-rose-500" : ""
                          }
                        >
                          Estoque: {p.stockCurrent}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`shrink-0 text-right text-sm font-semibold tabular-nums ${isDarkMode ? "text-emerald-400" : "text-emerald-700"}`}
                  >
                    {formatBRL(Number(p.salePrice || 0))}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
