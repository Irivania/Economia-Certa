'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface Product {
  id: string;
  description: string;
  brand?: string | null;
  stockCurrent: number;
}

interface BatchStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  companyId: string;
  onSuccess: () => void;
}

export function BatchStockModal({ isOpen, onClose, products, companyId, onSuccess }: BatchStockModalProps) {
  const { isDarkMode } = useTheme();
  const [saving, setSaving] = useState(false);
  const [modifiedStocks, setModifiedStocks] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  const getStockValue = (p: Product) => {
    if (modifiedStocks[p.id] !== undefined) {
      return modifiedStocks[p.id];
    }
    return p.stockCurrent ?? 0;
  };

  const handleChange = (id: string, val: string) => {
    const num = parseInt(val, 10);
    setModifiedStocks((prev) => ({
      ...prev,
      [id]: isNaN(num) ? 0 : num,
    }));
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const promises = Object.entries(modifiedStocks).map(async ([id, stockCurrent]) => {
        const original = products.find((p) => p.id === id);
        if (original && original.stockCurrent !== stockCurrent) {
          const res = await fetch('/api/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, companyId, stockCurrent }),
          });
          if (!res.ok) throw new Error(`Erro ao atualizar produto ${id}`);
        }
      });

      await Promise.all(promises);
      alert('Balanço de estoque salvo com sucesso!');
      setModifiedStocks({});
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar alguns itens do balanço.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className={`w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
        
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center p-6 border-b border-slate-500/10">
          <div>
            <h2 className="text-base font-black tracking-tight">⚡ Ajuste Rápido de Estoque (Inventário em Lote)</h2>
            <p className="text-xs opacity-60 mt-0.5">Altere os saldos físicos contados na prateleira e salve tudo de uma vez.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-500/10 flex items-center justify-center hover:bg-slate-500/20 text-xs font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Corpo com Listagem Compacta */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          <div className="grid grid-cols-12 gap-3 pb-2 border-b border-slate-500/15 text-[11px] font-bold uppercase tracking-wider opacity-60 px-2">
            <div className="col-span-8">Produto / Marca</div>
            <div className="col-span-4 text-center">Novo Estoque Físico</div>
          </div>

          {products.map((p) => (
            <div key={p.id} className={`grid grid-cols-12 gap-3 items-center p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200/60'}`}>
              <div className="col-span-8">
                <p className="text-xs font-bold tracking-tight">{p.description}</p>
                <span className="text-[10px] opacity-60">{p.brand || 'Marca não informada'} • Atual: {p.stockCurrent} un</span>
              </div>
              <div className="col-span-4 flex justify-center">
                <input
                  type="number"
                  min="0"
                  value={getStockValue(p)}
                  onChange={(e) => handleChange(p.id, e.target.value)}
                  className={`w-28 px-3 py-2 text-center text-xs font-mono font-bold border rounded-xl outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé com Botão de Ação */}
        <div className="p-6 border-t border-slate-500/10 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-500/10 text-xs font-bold hover:bg-slate-500/20 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveAll}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Salvando Ajustes...' : 'Salvar Todos os Ajustes de Uma Vez'}
          </button>
        </div>

      </div>
    </div>
  );
}