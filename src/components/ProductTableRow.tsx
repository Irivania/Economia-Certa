'use client';

import React, { useState } from 'react';

interface Product {
  id: string;
  description: string;
  ean?: string | null;
  brand?: string | null;
  imageUrl?: string | null;
  unit: string;
  boxQuantity: number;
  costPrice?: string | null;
  lastPurchasePrice?: string | null;
  salePrice?: string | null;
  stockCurrent: number;
  stockMin: number;
  stockIdeal: number;
  stockMax: number;
  ncm?: string | null;
  cest?: string | null;
  isKit?: boolean;
  useFixedStock?: boolean; // 💡 Adicionado suporte à estratégia híbrida
}

interface ProductTableRowProps {
  product: Product;
  isDarkMode: boolean;
  companyId: string;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onQuickQuote: (productId: string) => void;
  onRefresh?: () => void;
}

export function ProductTableRow({
  product: p,
  isDarkMode,
  companyId,
  onEdit,
  onDelete,
  onQuickQuote,
  onRefresh,
}: ProductTableRowProps) {
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<string>('');
  const [savingStockId, setSavingStockId] = useState<string | null>(null);

  const calculateMargin = (cost?: string | null, sale?: string | null) => {
    const c = parseFloat(cost || '0');
    const s = parseFloat(sale || '0');
    if (c > 0 && s >= c) {
      return (((s - c) / c) * 100).toFixed(0);
    }
    return '0';
  };

  const margin = calculateMargin(p.costPrice, p.salePrice);
  const currentStock = p.stockCurrent ?? 0;
  const minStock = p.stockMin ?? 0;
  const isCritical = currentStock <= minStock;
  const isEditingThisStock = editingStockId === p.id;
  const isSavingThisStock = savingStockId === p.id;

  const handleStartStockEdit = () => {
    setEditingStockId(p.id);
    setTempStockValue(String(currentStock));
  };

  const handleSaveStock = async () => {
    const newStock = parseInt(tempStockValue, 10);
    if (isNaN(newStock) || newStock < 0) {
      setEditingStockId(null);
      return;
    }

    try {
      setSavingStockId(p.id);
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: p.id,
          companyId,
          stockCurrent: newStock,
        }),
      });

      if (!res.ok) throw new Error('Erro ao atualizar estoque.');

      onRefresh?.();
    } catch (err) {
      console.error(err);
      alert('Não foi possível atualizar o estoque.');
    } finally {
      setSavingStockId(null);
      setEditingStockId(null);
    }
  };

  return (
    <tr className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}`}>
      <td className="p-3 text-center">
        <div className="w-10 h-10 rounded-xl border border-slate-500/20 bg-slate-500/5 flex items-center justify-center overflow-hidden mx-auto">
          {p.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.imageUrl} alt={p.description} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs opacity-50">📦</span>
          )}
        </div>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-sm tracking-tight">{p.description}</p>
          
          {/* 🔗 DISTINTIVO DE KIT AGRUPADO */}
          {p.isKit && (
            <span 
              className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 rounded-full inline-flex items-center gap-1 shadow-sm"
              title="Kit Agrupado: Composto por múltiplos itens avulsos"
            >
              🔗 Kit Agrupado (Composto)
            </span>
          )}

          {/* ⚡📦 DISTINTIVO DA ESTRATÉGIA HÍBRIDA DE ESTOQUE */}
          {p.isKit && (
            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border inline-flex items-center gap-1 ${
              p.useFixedStock 
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' 
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
            }`}>
              {p.useFixedStock ? '📦 Fixo (Próprio)' : '⚡ Dinâmico (Gargalo)'}
            </span>
          )}
        </div>
        <p className="text-[11px] opacity-60 font-mono mt-0.5">
          EAN: {p.ean || 'N/A'} {p.brand ? `• Marca: ${p.brand}` : ''} • Unid: {p.unit}
        </p>
      </td>
      <td className="p-3 text-right font-mono opacity-80 font-medium">
        R$ {Number(p.costPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        {p.lastPurchasePrice && (
          <span className="block text-[10px] opacity-60">Últ: R$ {Number(p.lastPurchasePrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        )}
      </td>
      <td className="p-3 text-right font-mono">
        <div className="font-bold text-emerald-600 dark:text-emerald-400">
          {p.salePrice ? `R$ ${Number(p.salePrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
        </div>
        <span className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
          Margem: {margin}%
        </span>
      </td>
      <td className="p-3 text-center">
        <div className="font-mono font-bold text-sm inline-flex flex-col items-center justify-center">
          {isEditingThisStock ? (
            <input
              type="number"
              autoFocus
              value={tempStockValue}
              onChange={(e) => setTempStockValue(e.target.value)}
              onBlur={handleSaveStock}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveStock();
                if (e.key === 'Escape') setEditingStockId(null);
              }}
              className="w-20 px-2 py-1 text-center text-xs font-mono border-2 border-indigo-500 rounded-lg bg-indigo-50 dark:bg-slate-950 text-indigo-700 dark:text-indigo-300 outline-none shadow-md"
            />
          ) : (
            <button
              type="button"
              onClick={handleStartStockEdit}
              title="Clique para editar o estoque rapidamente"
              className="group relative px-2.5 py-1 rounded-xl hover:bg-indigo-500/10 transition-all cursor-pointer inline-flex items-center gap-1.5 font-mono"
            >
              <span>{isSavingThisStock ? 'Salvando...' : currentStock}</span>
              <span className="opacity-0 group-hover:opacity-100 text-[10px] text-indigo-500 font-sans transition-opacity">
                ✏️
              </span>
            </button>
          )}

          {/* 💡 SUBTÍTULO CLARO DO COMPORTAMENTO DE ESTOQUE */}
          {p.isKit && !p.useFixedStock && (
            <span className="text-[9px] font-sans font-medium text-emerald-600 dark:text-emerald-400 -mt-0.5 leading-tight" title="Calculado automaticamente pelo menor estoque dos itens filhos">
              🔄 Sincronizado com filhos (gargalo)
            </span>
          )}

          {p.isKit && p.useFixedStock && (
            <span className="text-[9px] font-sans font-medium text-amber-600 dark:text-amber-400 -mt-0.5 leading-tight" title="Estoque independente gerido no próprio kit">
              🔒 Estoque independente (próprio)
            </span>
          )}

          {isCritical && !isEditingThisStock && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse mt-1">
              ⚠️ Repor
            </span>
          )}
        </div>
      </td>
      <td className="p-3 text-center font-mono text-[11px] opacity-80">
        <span className="text-amber-500 font-bold" title="Estoque Mínimo">{minStock}</span> /{' '}
        <span className="text-blue-500 font-bold" title="Estoque Ideal">{p.stockIdeal ?? 0}</span> /{' '}
        <span className="opacity-60" title="Estoque Máximo">{p.stockMax ?? 0}</span>
      </td>
      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
        <button
          onClick={() => onQuickQuote(p.id)}
          title="Cotar Preço com Fornecedores"
          className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer inline-flex items-center gap-1"
        >
          ⚡ Cotar
        </button>
        <button
          onClick={() => onEdit(p)}
          className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(p.id)}
          className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          Excluir
        </button>
      </td>
    </tr>
  );
}