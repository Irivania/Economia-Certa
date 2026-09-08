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

interface EditQuotationItemsTableProps {
  items: QuotationItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onUpdateCostPrice: (id: string, price: number) => void;
  onRemoveItem: (id: string) => void;
}

export default function EditQuotationItemsTable({
  items,
  searchTerm,
  setSearchTerm,
  onUpdateQuantity,
  onUpdateCostPrice,
  onRemoveItem,
}: EditQuotationItemsTableProps) {
  const filteredItems = items.filter(item =>
    (item.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.ean || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-slate-700 text-sm">Itens da Cotação ({items.length})</h2>
        <div className="w-72">
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
              <th className="p-3 font-semibold">Código de Barras (EAN)</th>
              <th className="p-3 font-semibold text-center">Qtd. Solicitada</th>
              <th className="p-3 font-semibold text-center">Preço de Custo (R$)</th>
              <th className="p-3 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400">
                  Nenhum item adicionado. Clique em &quot;+ Adicionar do Catálogo&quot; acima.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id || item.productId} className="hover:bg-slate-50/50">
                  <td className="p-3 font-medium text-slate-800">
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-white">
                          <Image src={item.imageUrl} alt={item.description || 'Produto'} fill sizes="40px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-slate-400 text-xs">
                          📦
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-800">{item.description}</p>
                        {item.brand && <p className="text-xs text-slate-400">{item.brand}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-slate-600 font-mono text-xs">{item.ean || 'Não informado'}</td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      min="1"
                      value={item.requestedQuantity}
                      onChange={(e) => onUpdateQuantity(item.id || item.productId, parseInt(e.target.value) || 1)}
                      className="w-20 text-center border border-slate-200 rounded-md py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={item.costPrice ?? ''}
                      onChange={(e) => onUpdateCostPrice(item.id || item.productId, parseFloat(e.target.value) || 0)}
                      className="w-28 text-center border border-slate-200 rounded-md py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-amber-50/50 font-medium text-slate-700"
                    />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id || item.productId)}
                      className="text-red-500 hover:text-red-700 font-medium text-xs transition"
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