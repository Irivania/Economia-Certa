'use client';

import Image from 'next/image';
import { useRef } from 'react';

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
  // Cria um mapa de referências para os inputs de quantidade
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const filteredItems = items.filter(item =>
    (item.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.ean || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Evita submeter o formulário ao pressionar Enter
      const nextItem = filteredItems[currentIndex + 1];
      if (nextItem) {
        const nextId = nextItem.id || nextItem.productId;
        inputRefs.current[nextId]?.focus();
        inputRefs.current[nextId]?.select(); // Seleciona o texto atual para facilitar a edição
      }
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="font-bold text-slate-700 text-sm">Itens da Cotação ({items.length})</h2>
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar na lista por nome ou EAN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-100 rounded-lg">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-100">
              <th className="p-3 font-semibold">Produto / Descrição</th>
              <th className="p-3 font-semibold">Marca / EAN</th>
              <th className="p-3 font-semibold text-center">Estoque Atual</th>
              <th className="p-3 font-semibold text-center">Estoque Ideal</th>
              <th className="p-3 font-semibold text-center">Qtd. Solicitada</th>
              <th className="p-3 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  Nenhum item adicionado. Clique em &quot;+ Adicionar do Catálogo&quot; ou importe um arquivo acima.
                </td>
              </tr>
            ) : (
              filteredItems.map((item, index) => {
                const itemId = item.id || item.productId;
                return (
                  <tr key={itemId} className="hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-800">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-white">
                            <Image
                              src={item.imageUrl}
                              alt={item.description}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-slate-400 text-xs">
                            📦
                          </div>
                        )}
                        <span className="line-clamp-2">{item.description}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-500 text-xs font-mono">
                      {item.brand || 'Geral'} {item.ean ? `| ${item.ean}` : ''}
                    </td>
                    <td className="p-3 text-center text-amber-600 font-medium">{item.stockCurrent}</td>
                    <td className="p-3 text-center text-slate-600">{item.stockIdeal}</td>
                    <td className="p-3 text-center">
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
                        className="w-20 text-center border border-slate-200 rounded-md py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(itemId)}
                        className="text-red-500 hover:text-red-700 font-medium text-xs transition"
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