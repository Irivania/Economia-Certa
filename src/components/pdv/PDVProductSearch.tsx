'use client';

import { useState } from 'react';

interface ProductItem {
  id: string;
  description: string;
  ean: string | null;
  salePrice: string | null;
  stockCurrent: number;
  imageUrl: string | null;
}

interface PDVProductSearchProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filteredProducts: ProductItem[];
  onSelectProduct: (product: ProductItem, customQty?: number) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isDarkMode: boolean;
  isOperator?: boolean;
}

export function PDVProductSearch({
  searchTerm,
  setSearchTerm,
  filteredProducts,
  onSelectProduct,
  inputRef,
  onKeyDown,
  isDarkMode,
  isOperator = false,
}: PDVProductSearchProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleInternalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      let qty = 1;
      let query = searchTerm.trim();

      // Extrai o multiplicador se existir (Ex: 4*789...)
      if (query.includes('*')) {
        const parts = query.split('*');
        const parsed = parseInt(parts[0], 10);
        if (!isNaN(parsed) && parsed > 0) {
          qty = parsed;
        }
        query = (parts[1] || '').trim();
      }

      if (!query && filteredProducts.length === 0) return;

      // Pega o produto destacado pela seta (selectedIndex) ou o primeiro da lista filtrada
      const target = filteredProducts[selectedIndex] || filteredProducts[0];

      if (target) {
        onSelectProduct(target, qty);
        setSearchTerm('');
        setSelectedIndex(0);
        return;
      }
    }

    if (filteredProducts.length > 0 && searchTerm.trim().length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredProducts.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredProducts.length - 1));
        return;
      }
    }

    onKeyDown(e);
  };

  return (
    <div className={`lg:col-span-2 p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-wider">Lançamento de Produtos</h3>
          <div className="flex items-center gap-2">
            {!isOperator && (
              <a href="/financeiro/convenios" className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                + Cadastrar Convênios
              </a>
            )}
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
              Modo Caixa ⚡
            </span>
          </div>
        </div>

        {/* Input de Leitura */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ex: 4*7890123456789 ou nome do produto..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInternalKeyDown}
            className="w-full px-4 py-3.5 text-xs font-mono border-2 rounded-2xl bg-slate-50 dark:bg-slate-950 border-indigo-500/40 focus:border-indigo-600 outline-none shadow-sm"
            autoFocus
          />
        </div>

        {/* Sugestões em tempo real */}
        {searchTerm.trim().length > 0 && (
          <div className="border rounded-2xl max-h-60 overflow-y-auto divide-y divide-slate-500/10 bg-slate-50 dark:bg-slate-950 shadow-lg relative z-30">
            {filteredProducts.length === 0 ? (
              <p className="p-4 text-xs text-center opacity-50">Nenhum produto encontrado.</p>
            ) : (
              filteredProducts.map((p, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      let qty = 1;
                      if (searchTerm.includes('*')) {
                        const parts = searchTerm.split('*');
                        const parsed = parseInt(parts[0], 10);
                        if (!isNaN(parsed) && parsed > 0) qty = parsed;
                      }
                      onSelectProduct(p, qty);
                      setSearchTerm('');
                      setSelectedIndex(0);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full p-3 text-left flex items-center justify-between transition cursor-pointer ${
                      isSelected ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-600/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-500/20">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt={p.description} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs">🏷️</span>
                        )}
                      </div>
                      <div>
                        <div className={`font-bold text-xs line-clamp-1 ${isSelected ? 'text-white' : ''}`}>{p.description}</div>
                        <div className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'opacity-60'}`}>
                          EAN: {p.ean || 'N/A'} | Estoque: {p.stockCurrent}
                        </div>
                      </div>
                    </div>
                    <div className={`text-right font-mono font-black text-xs ${isSelected ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      R$ {Number(p.salePrice || 0).toFixed(2)}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      <div className="p-5 rounded-2xl border bg-slate-500/5 border-slate-500/10 space-y-2">
        <h4 className="font-bold text-xs uppercase tracking-wider opacity-70">Regras e Convênios:</h4>
        <ul className="text-[11px] opacity-60 space-y-1 font-sans">
          <li>Navegação: Use as <code className="font-bold">Setas ↕</code> na lista e pressione <code className="font-bold">Enter</code> para adicionar.</li>
          <li>Multiplicador: Digite <code className="font-bold">Qtd*EAN</code> e pressione Enter (Ex: <code className="font-bold">4*789...</code>).</li>
          <li>Cancelar itens ou alterar preços exige obrigatoriamente a introdução do <strong>PIN do Gerente</strong>.</li>
        </ul>
      </div>
    </div>
  );
}