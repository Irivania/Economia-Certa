'use client';

import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';

interface QuotationItem {
  id: string;
  productId: string;
  description?: string;
  brand?: string | null;
  ean?: string | null;
  imageUrl?: string | null;
  requestedQuantity: number;
  costPrice?: number;
}

interface QuotationItemsSectionProps {
  items: QuotationItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onUpdatePrice: (id: string, price: number) => void;
  onRemoveItem: (id: string) => void;
  onOpenModal: () => void;
}

export default function QuotationItemsSection({
  items,
  searchTerm,
  setSearchTerm,
  onUpdateQuantity,
  onUpdatePrice,
  onRemoveItem,
  onOpenModal,
}: QuotationItemsSectionProps) {
  const { isDarkMode } = useTheme();

  const filteredItems = items.filter(
    (item) =>
      (item.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.ean || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`rounded-2xl border p-6 space-y-4 transition-all ${
      isDarkMode ? 'bg-slate-950/50 border-slate-800 text-white' : 'bg-slate-50/60 border-slate-200/80 text-slate-900'
    }`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-black uppercase tracking-wider">
          Itens da Cotação ({items.length})
        </h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Buscar na lista por nome ou EAN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full sm:w-80 rounded-xl border px-4 py-2.5 text-xs font-bold outline-none transition-all ${
              isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-600'
            }`}
          />
          <button
            type="button"
            onClick={onOpenModal}
            className="whitespace-nowrap rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/25 transition-all cursor-pointer shrink-0"
          >
            + Adicionar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-500/10 shadow-sm">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className={`border-b uppercase tracking-wider text-[11px] font-extrabold ${
              isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-900/30' : 'border-slate-200 text-slate-500 bg-slate-50/60'
            }`}>
              <th className="p-4 font-extrabold">Produto / Descrição</th>
              <th className="p-4 font-extrabold">Código de Barras (EAN)</th>
              <th className="p-4 text-center font-extrabold">Qtd. Solicitada</th>
              <th className="p-4 text-center font-extrabold">Preço de Custo (R$)</th>
              <th className="p-4 text-right font-extrabold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-500/10">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-16 text-center text-xs opacity-50 font-medium">
                  Nenhum item adicionado. Clique em &quot;+ Adicionar&quot; acima.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id || item.productId} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}`}>
                  <td className="p-4 font-bold text-sm tracking-tight">
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border border-slate-500/20 bg-white">
                          <Image
                            src={item.imageUrl}
                            alt={item.description || 'Produto'}
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
                      <div>
                        <p className="font-bold tracking-tight text-sm">{item.description}</p>
                        {item.brand && <p className="text-[11px] opacity-60 font-medium">{item.brand}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-xs opacity-70">
                    {item.ean || 'Não informado'}
                  </td>
                  <td className="p-4 text-center">
                    <input
                      type="number"
                      min="1"
                      value={item.requestedQuantity}
                      onChange={(e) => onUpdateQuantity(item.id || item.productId, parseInt(e.target.value) || 1)}
                      className={`w-20 text-center rounded-xl border py-2 text-xs font-black font-mono outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-emerald-400 focus:border-emerald-500' : 'bg-white border-slate-300 text-emerald-700 focus:border-emerald-600'
                      }`}
                    />
                  </td>
                  <td className="p-4 text-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={item.costPrice ?? ''}
                      onChange={(e) => onUpdatePrice(item.id || item.productId, parseFloat(e.target.value) || 0)}
                      className={`w-28 text-center rounded-xl border py-2 text-xs font-black font-mono outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-amber-400 focus:border-emerald-500' : 'bg-amber-50/50 border-slate-300 text-amber-700 focus:border-emerald-600'
                      }`}
                    />
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id || item.productId)}
                      className="text-xs font-extrabold text-rose-500 transition hover:text-rose-600 cursor-pointer"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}