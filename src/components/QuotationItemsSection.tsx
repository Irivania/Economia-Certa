'use client';

import Image from 'next/image';

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
  const filteredItems = items.filter(
    (item) =>
      (item.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.ean || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-bold text-slate-700">
          Itens da Cotação ({items.length})
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar na lista por nome ou EAN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-72 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={onOpenModal}
            className="whitespace-nowrap rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 shadow-sm"
          >
            + Adicionar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-slate-600">
              <th className="p-3 font-semibold">Produto / Descrição</th>
              <th className="p-3 font-semibold">Código de Barras (EAN)</th>
              <th className="p-3 text-center font-semibold">Qtd. Solicitada</th>
              <th className="p-3 text-center font-semibold">Preço de Custo (R$)</th>
              <th className="p-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400">
                  Nenhum item adicionado. Clique em &quot;+ Adicionar&quot; acima.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id || item.productId} className="hover:bg-slate-50/50">
                  <td className="p-3 font-medium text-slate-800">
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                          <Image
                            src={item.imageUrl}
                            alt={item.description || 'Produto'}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
                          📦
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-800">{item.description}</p>
                        {item.brand && <p className="text-xs text-slate-400">{item.brand}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-slate-600">
                    {item.ean || 'Não informado'}
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      min="1"
                      value={item.requestedQuantity}
                      onChange={(e) => onUpdateQuantity(item.id || item.productId, parseInt(e.target.value) || 1)}
                      className="w-20 rounded-md border border-slate-200 py-1 text-center text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={item.costPrice ?? ''}
                      onChange={(e) => onUpdatePrice(item.id || item.productId, parseFloat(e.target.value) || 0)}
                      className="w-28 rounded-md border border-slate-200 bg-amber-50/50 py-1 text-center text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id || item.productId)}
                      className="text-xs font-medium text-red-500 transition hover:text-red-700"
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