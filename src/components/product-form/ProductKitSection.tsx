'use client';

import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/apiClient';

interface ComponentItem {
  componentProductId: string;
  quantity: number;
  description?: string;
  imageUrl?: string | null;
}

interface ProductOption {
  id: string;
  description: string;
  ean?: string | null;
  imageUrl?: string | null;
  stockCurrent: number;
}

interface ProductKitSectionProps {
  editingId: string | null;
  companyId?: string;
  isKit: boolean;
  setIsKit: (val: boolean) => void;
  kitComponents: ComponentItem[];
  setKitComponents: React.Dispatch<React.SetStateAction<ComponentItem[]>>;
  useFixedStock: boolean;
  setUseFixedStock: (val: boolean) => void;
}

export function ProductKitSection({
  editingId,
  companyId = '',
  isKit,
  setIsKit,
  kitComponents,
  setKitComponents,
  useFixedStock,
  setUseFixedStock,
}: ProductKitSectionProps) {
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadKitData() {
      try {
        const url = companyId ? `/api/products?companyId=${companyId}` : '/api/products';
        const prodRes = await apiFetch(url);
        const prodData = await prodRes.json();
        
        if (Array.isArray(prodData)) {
          setAllProducts(prodData.filter((p: ProductOption) => p.id !== editingId));
        }

        if (editingId) {
          const compRes = await apiFetch(`/api/products/composition?productId=${editingId}`);
          const compData = await compRes.json();
          if (compData.success && compData.items.length > 0) {
            setIsKit(true);
            setKitComponents(compData.items);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados do kit:', err);
      }
    }
    loadKitData();
  }, [editingId, companyId, setIsKit, setKitComponents]);

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = allProducts.filter((p) => {
    const term = searchTerm.toLowerCase();
    const desc = p.description?.toLowerCase() || '';
    const ean = p.ean?.toLowerCase() || '';
    return desc.includes(term) || ean.includes(term);
  });

  const handleSelectProduct = (product: ProductOption) => {
    setSelectedProduct(product);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleAddComponent = () => {
    if (!selectedProduct) return;
    
    const existingIndex = kitComponents.findIndex(
      (c) => c.componentProductId === selectedProduct.id
    );

    if (existingIndex >= 0) {
      const updated = [...kitComponents];
      updated[existingIndex].quantity += Number(selectedQuantity);
      setKitComponents(updated);
    } else {
      setKitComponents([
        ...kitComponents,
        {
          componentProductId: selectedProduct.id,
          quantity: Number(selectedQuantity),
          description: selectedProduct.description,
          imageUrl: selectedProduct.imageUrl,
        },
      ]);
    }
    setSelectedProduct(null);
    setSelectedQuantity(1);
  };

  const handleRemoveComponent = (componentProductId: string) => {
    setKitComponents(kitComponents.filter((c) => c.componentProductId !== componentProductId));
  };

  return (
    <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl space-y-4">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isKit}
          onChange={(e) => setIsKit(e.target.checked)}
          className="w-4 h-4 text-purple-600 rounded border-purple-300 focus:ring-purple-500 cursor-pointer"
        />
        <div>
          <span className="font-bold text-xs text-purple-900 dark:text-purple-300">📦 Este produto é um Kit / Composto?</span>
          <p className="text-[11px] text-slate-500">Marque para configurar os itens filhos que compõem este kit.</p>
        </div>
      </label>

      {isKit && (
        <div className="space-y-4 pt-3 border-t border-purple-500/10">
          
          {/* 💡 SELETOR DA ESTRATÉGIA HÍBRIDA DE ESTOQUE */}
          <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-purple-500/20 space-y-2">
            <span className="block text-[11px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wide">
              ⚡ Estratégia de Controlo de Estoque para este Kit:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${!useFixedStock ? 'bg-purple-500/10 border-purple-500 text-purple-900 dark:text-purple-200 font-medium' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
                <input
                  type="radio"
                  name="stockStrategy"
                  checked={!useFixedStock}
                  onChange={() => setUseFixedStock(false)}
                  className="mt-0.5 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <span className="text-xs">
                  <strong className="block">Dinâmico (Gargalo em Cascata)</strong>
                  Calculado automaticamente pelo menor saldo dos itens filhos.
                </span>
              </label>

              <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${useFixedStock ? 'bg-purple-500/10 border-purple-500 text-purple-900 dark:text-purple-200 font-medium' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
                <input
                  type="radio"
                  name="stockStrategy"
                  checked={useFixedStock}
                  onChange={() => setUseFixedStock(true)}
                  className="mt-0.5 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <span className="text-xs">
                  <strong className="block">Fixo / Próprio (Independente)</strong>
                  Estoque gerido manualmente no próprio kit (ideal para kits pré-montados).
                </span>
              </label>
            </div>
          </div>

          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 pt-2">
            Composição do Kit (Itens Filhos)
          </h4>

          <div className="flex flex-col sm:flex-row gap-3 items-end bg-white dark:bg-slate-950 p-3 rounded-xl border border-purple-500/10 relative">
            
            {/* Campo de Busca Autocomplete com Lista Flutuante */}
            <div className="flex-1 w-full space-y-1 relative" ref={dropdownRef}>
              <label className="block text-[10px] font-semibold text-slate-500">Selecionar Produto Componente</label>
              
              {selectedProduct ? (
                <div className="flex items-center justify-between border border-purple-500/40 rounded-lg p-2 bg-purple-500/5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                      {selectedProduct.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={selectedProduct.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px]">📦</span>
                      )}
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{selectedProduct.description}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="text-rose-500 text-[10px] font-bold hover:underline ml-2 whitespace-nowrap"
                  >
                    Trocar
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Digite para buscar por descrição ou EAN (ex: Skala)..."
                    value={searchTerm}
                    onFocus={() => setIsDropdownOpen(true)}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none"
                  />

                  {/* Lista Flutuante em Tempo Real */}
                  {isDropdownOpen && (
                    <div className="absolute z-50 left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredOptions.length === 0 ? (
                        <div className="p-3 text-xs text-slate-400 text-center">Nenhum produto encontrado.</div>
                      ) : (
                        filteredOptions.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handleSelectProduct(p)}
                            className="flex items-center gap-3 p-2.5 hover:bg-purple-500/10 cursor-pointer transition-colors text-xs"
                          >
                            <div className="w-8 h-8 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                              {p.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px]">📦</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{p.description}</p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                Estoque: {p.stockCurrent} {p.ean ? `• EAN: ${p.ean}` : ''}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="w-28">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Qtd no Kit</label>
              <input
                type="number"
                min="1"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleAddComponent}
              disabled={!selectedProduct}
              className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              + Adicionar Item
            </button>
          </div>

          {/* Tabela de Componentes Selecionados com Imagem */}
          {kitComponents.length > 0 && (
            <div className="overflow-x-auto border border-purple-500/20 rounded-xl bg-white dark:bg-slate-950">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-purple-500/10 text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">
                    <th className="p-2.5 w-12 text-center">Foto</th>
                    <th className="p-2.5">Item Componente</th>
                    <th className="p-2.5 text-center">Quantidade</th>
                    <th className="p-2.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {kitComponents.map((item) => {
                    const prodInfo = allProducts.find((p) => p.id === item.componentProductId);
                    const img = prodInfo?.imageUrl || item.imageUrl;
                    return (
                      <tr key={item.componentProductId} className="hover:bg-purple-500/5">
                        <td className="p-2.5 text-center">
                          <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 flex items-center justify-center overflow-hidden mx-auto">
                            {img ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] opacity-50">📦</span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 font-medium">{prodInfo?.description || item.description}</td>
                        <td className="p-2.5 text-center font-bold text-purple-600">{item.quantity} un</td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveComponent(item.componentProductId)}
                            className="text-rose-500 hover:underline text-[11px] font-semibold cursor-pointer"
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}