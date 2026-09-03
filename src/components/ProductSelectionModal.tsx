'use client';

import { useState } from 'react';

interface Product {
  id: string;
  ean?: string;
  description: string;
  brand?: string;
  imageUrl?: string;
}

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddSelectedProducts: (selectedProductIds: string[]) => void;
}

export default function ProductSelectionModal({
  isOpen,
  onClose,
  products,
  onAddSelectedProducts,
}: ProductSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  // Filtra por descrição, marca ou código de barras
  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const desc = p.description?.toLowerCase() || '';
    const brand = p.brand?.toLowerCase() || '';
    const ean = p.ean?.toLowerCase() || '';
    return desc.includes(term) || brand.includes(term) || ean.includes(term);
  });

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleConfirm = () => {
    onAddSelectedProducts(selectedIds);
    setSelectedIds([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-sm font-bold text-slate-800">🔍 Selecionar Produtos do Catálogo</h3>
          <button 
            type="button" 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
          >
            ✕ Fechar
          </button>
        </div>

        {/* Campo de Busca */}
        <div className="p-4 border-b border-slate-100">
          <input
            type="text"
            placeholder="Buscar por descrição, marca ou código de barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Lista de Produtos com Imagem e Checkboxes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredProducts.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">Nenhum produto encontrado.</p>
          ) : (
            <>
              <div className="flex justify-between items-center mb-2 px-1">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  {selectedIds.length === filteredProducts.length ? 'Desmarcar Todos' : 'Selecionar Todos Filtrados'}
                </button>
                <span className="text-[11px] text-slate-500 font-medium">
                  {selectedIds.length} selecionado(s)
                </span>
              </div>

              {filteredProducts.map((p) => {
                const isChecked = selectedIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleToggleSelect(p.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isChecked ? 'bg-blue-50/60 border-blue-300' : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} 
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      {/* Miniatura da Imagem do Produto */}
                      <div className="w-10 h-10 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt={p.description} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm">📷</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{p.description}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          EAN: {p.ean || 'Não informado'} {p.brand ? `| Marca: ${p.brand}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Adicionar Selecionados ({selectedIds.length})
          </button>
        </div>

      </div>
    </div>
  );
}