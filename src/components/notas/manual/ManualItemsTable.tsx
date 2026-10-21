'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Search, Tag, Calculator } from 'lucide-react';

interface ProductItem {
  id: string;
  description: string;
  ean: string | null;
  unit: string;
  costPrice: string | number;
}

interface ItemManual {
  productId: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
}

interface ManualItemsTableProps {
  items: ItemManual[];
  productsList: ProductItem[];
  onSelectProduct: (index: number, selectedId: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onItemChange: (index: number, field: keyof ItemManual, value: string | number) => void;
  isDarkMode: boolean;
}

export function ManualItemsTable({
  items,
  productsList,
  onSelectProduct,
  onAddItem,
  onRemoveItem,
  onItemChange,
  isDarkMode,
}: ManualItemsTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<{ [key: number]: string }>({});
  const [selectedIndex, setSelectedIndex] = useState<{ [key: number]: number }>({});

  // Referências para gerir o foco via teclado entre os inputs de todas as linhas
  const searchInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const qtyInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const costInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleGoToRegister = () => {
    router.push('/produtos?returnTo=/notas/manual');
  };

  const totalItemsAmount = items.reduce((acc, curr) => {
    const q = Number(curr.quantity || 0);
    const c = Number(curr.unitCost || 0);
    return acc + (q * c);
  }, 0);

  const formatMoney = (val: number) => Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className={`p-8 rounded-3xl border shadow-xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">2. Conferência de Itens (Navegação por Teclado ⚡)</h3>
          <p className="text-[11px] opacity-60 mt-0.5">Use as <b>Setas ↕</b> para navegar na lista, <b>Enter</b> para selecionar, e dê Enter para avançar entre Quantidade, Custo e Nova Linha.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGoToRegister}
            className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5 border border-indigo-500/20"
          >
            <Tag className="w-3.5 h-3.5" /> + Cadastrar Novo Produto
          </button>
          <button
            type="button"
            onClick={onAddItem}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Linha
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const currentSearch = searchTerm[idx] ?? '';
          const activeIndex = selectedIndex[idx] ?? 0;
          
          const filteredProducts = productsList.filter((p) => {
            const query = currentSearch.toLowerCase();
            const matchDesc = p.description.toLowerCase().includes(query);
            const matchEan = p.ean && p.ean.toLowerCase().includes(query);
            return matchDesc || matchEan;
          });

          return (
            <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-slate-500/5 border border-slate-500/10 relative">
              
              {/* CAMPO DE BUSCA COM SUPORTE A SETAS E ENTER */}
              <div className="flex-1 w-full space-y-1">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 opacity-40" />
                  <input
                    ref={(el) => { searchInputRefs.current[idx] = el; }}
                    type="text"
                    placeholder="Digite EAN ou Nome... (Use Setas ↕ e Enter)"
                    value={currentSearch || item.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchTerm({ ...searchTerm, [idx]: val });
                      setSelectedIndex({ ...selectedIndex, [idx]: 0 });

                      const exactMatch = productsList.find(p => p.ean === val.trim());
                      if (exactMatch) {
                        onSelectProduct(idx, exactMatch.id);
                        setSearchTerm({ ...searchTerm, [idx]: '' });
                        qtyInputRefs.current[idx]?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (!currentSearch || filteredProducts.length === 0) return;

                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setSelectedIndex({
                          ...selectedIndex,
                          [idx]: Math.min(activeIndex + 1, filteredProducts.length - 1),
                        });
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setSelectedIndex({
                          ...selectedIndex,
                          [idx]: Math.max(activeIndex - 1, 0),
                        });
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        const selected = filteredProducts[activeIndex];
                        if (selected) {
                          onSelectProduct(idx, selected.id);
                          setSearchTerm({ ...searchTerm, [idx]: '' });
                          qtyInputRefs.current[idx]?.focus();
                        }
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl bg-white dark:bg-slate-950 outline-none font-bold"
                  />
                </div>

                {currentSearch && filteredProducts.length > 0 && (
                  <div className="absolute z-30 w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto mt-1">
                    {filteredProducts.map((p, pIdx) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectProduct(idx, p.id);
                          setSearchTerm({ ...searchTerm, [idx]: '' });
                          qtyInputRefs.current[idx]?.focus();
                        }}
                        className={`px-3 py-2 text-xs cursor-pointer flex justify-between items-center border-b border-slate-500/10 last:border-0 ${
                          pIdx === activeIndex ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-500/10'
                        }`}
                      >
                        <span className="font-bold">{p.description}</span>
                        <span className={`font-mono text-[10px] ${pIdx === activeIndex ? 'text-white' : 'opacity-60'}`}>
                          EAN: {p.ean || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* QUANTIDADE (Pula para o custo ao premir Enter) */}
              <div className="w-24">
                <input
                  ref={(el) => { qtyInputRefs.current[idx] = el; }}
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Qtd"
                  value={item.quantity === 0 ? '' : item.quantity}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value);
                    if (val < 0) return;
                    onItemChange(idx, 'quantity', val);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      costInputRefs.current[idx]?.focus();
                    }
                  }}
                  required
                  className="w-full px-3 py-2 text-xs border rounded-xl bg-white dark:bg-slate-950 outline-none font-mono text-center font-bold"
                />
              </div>

              {/* CUSTO UNITÁRIO (Ao premir Enter, cria nova linha e foca automaticamente na busca dela) */}
              <div className="w-36">
                <input
                  ref={(el) => { costInputRefs.current[idx] = el; }}
                  type="text"
                  placeholder="R$ 0,00"
                  value={item.unitCost ? `R$ ${Number(item.unitCost).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}
                  onChange={(e) => {
                    const cleanValue = e.target.value.replace(/\D/g, '');
                    const numericValue = cleanValue ? Number(cleanValue) / 100 : 0;
                    onItemChange(idx, 'unitCost', numericValue);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onAddItem();
                      // Aguarda a renderização da nova linha e foca no input de busca dela
                      setTimeout(() => {
                        searchInputRefs.current[idx + 1]?.focus();
                      }, 50);
                    }
                  }}
                  required
                  className="w-full px-3 py-2 text-xs border rounded-xl bg-white dark:bg-slate-950 outline-none font-mono text-right text-emerald-600 dark:text-emerald-400 font-bold"
                />
              </div>

              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveItem(idx)}
                  className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-500/10 flex justify-between items-center font-mono text-xs">
        <div className="inline-flex items-center gap-1.5 opacity-70">
          <Calculator className="w-4 h-4 text-indigo-500" />
          <span>Soma de todos os itens da nota:</span>
        </div>
        <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
          {formatMoney(totalItemsAmount)}
        </div>
      </div>
    </div>
  );
}