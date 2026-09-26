'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface QuotationItem {
  id: string;
  productId: string;
  description: string;
  brand: string | null;
  ean: string | null;
  imageUrl?: string | null;
  stockCurrent: number;
  stockIdeal: number;
  requestedQuantity: number;
}

interface QuotationItemsTableProps {
  items: QuotationItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
}

export default function QuotationItemsTable({
  items,
  searchTerm,
  setSearchTerm,
  onUpdateQuantity,
  onRemoveItem,
}: QuotationItemsTableProps) {
  const { isDarkMode } = useTheme();
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const filteredItems = items.filter(item =>
    (item.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.ean || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextItem = filteredItems[currentIndex + 1];
      if (nextItem) {
        const nextId = nextItem.id || nextItem.productId;
        inputRefs.current[nextId]?.focus();
        inputRefs.current[nextId]?.select();
      }
    }
  };

  return (
    <div className={`rounded-2xl border p-6 space-y-4 transition-all ${
      isDarkMode ? 'bg-slate-950/50 border-slate-800 text-white' : 'bg-slate-50/60 border-slate-200/80 text-slate-900'
    }`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-sm font-black uppercase tracking-wider">Itens da Cotação ({items.length})</h2>
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Buscar na lista por nome ou EAN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-xl border px-4 py-2.5 text-xs font-bold outline-none transition-all ${
              isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-600'
            }`}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-500/10 shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className={`border-b uppercase tracking-wider text-[11px] font-extrabold ${
              isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-900/30' : 'border-slate-200 text-slate-500 bg-slate-50/60'
            }`}>
              <th className="p-4 font-extrabold">Produto / Descrição</th>
              <th className="p-4 font-extrabold">Marca / EAN</th>
              <th className="p-4 font-extrabold text-center">Estoque Atual</th>
              <th className="p-4 font-extrabold text-center">Estoque Ideal</th>
              <th className="p-4 font-extrabold text-center">Qtd. Solicitada</th>
              <th className="p-4 font-extrabold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-500/10">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-16 text-center text-xs opacity-50 font-medium">
                  Nenhum item adicionado. Clique em &quot;+ Adicionar do Catálogo&quot; ou importe um arquivo acima.
                </td>
              </tr>
            ) : (
              filteredItems.map((item, index) => {
                const itemId = item.id || item.productId;
                return (
                  <tr key={itemId} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}`}>
                    <td className="p-4 font-bold text-sm tracking-tight">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <div className="relative h-10 w-10 flex-shrink-0 rounded-xl overflow-hidden border border-slate-500/20 bg-white">
                            <Image
                              src={item.imageUrl}
                              alt={item.description}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-500/30 bg-slate-500/10 text-xs">
                            📦
                          </div>
                        )}
                        <span className="line-clamp-2">{item.description}</span>
                      </div>
                    </td>
                    <td className="p-4 opacity-70 text-xs font-mono">
                      {item.brand || 'Geral'} {item.ean ? `| ${item.ean}` : ''}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-amber-500">{item.stockCurrent}</td>
                    <td className="p-4 text-center font-mono font-bold opacity-80">{item.stockIdeal}</td>
                    <td className="p-4 text-center">
                      <input
                        ref={(el) => { inputRefs.current[itemId] = el; }}
                        type="number"
                        min="0"
                        value={item.requestedQuantity ? item.requestedQuantity : ''}
                        placeholder=""
                        onChange={(e) => {
                          const rawVal = e.target.value;
                          const val = rawVal === '' ? 0 : parseInt(rawVal) || 0;
                          onUpdateQuantity(itemId, val);
                        }}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className={`w-20 text-center rounded-xl border py-2 text-xs font-black font-mono outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-emerald-400 focus:border-emerald-500' : 'bg-white border-slate-300 text-emerald-700 focus:border-emerald-600'
                        }`}
                      />
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(itemId)}
                        className="text-rose-500 hover:text-rose-600 font-extrabold text-xs transition cursor-pointer"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}