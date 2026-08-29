'use client';

import { Product } from '@/app/produtos/page';

interface ProductTableProps {
  products: Product[];
  selectedProductIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  loading: boolean;
  error: string | null;
}

export function ProductTable({
  products,
  selectedProductIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
  loading,
  error
}: ProductTableProps) {
  if (loading) return <p className="text-slate-500 text-center py-8 text-xs">Carregando...</p>;
  if (error) return <div className="p-4 bg-red-50 text-red-700 rounded-md text-xs">{error}</div>;
  if (products.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg">
        <p className="text-slate-400 text-xs">Nenhum produto encontrado.</p>
      </div>
    );
  }

  const allSelected = products.length > 0 && products.every((p) => selectedProductIds.includes(p.id));

  return (
    <div className="border border-slate-200 rounded-lg overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
            <th className="p-3 w-10 text-center">
              <input
                type="checkbox"
                onChange={onToggleSelectAll}
                checked={allSelected}
                className="rounded border-slate-300 text-blue-600"
              />
            </th>
            <th className="p-3 w-12 text-center font-semibold">Foto</th>
            <th className="p-3 font-semibold">Código</th>
            <th className="p-3 font-semibold">Descrição</th>
            <th className="p-3 font-semibold">Marca</th>
            <th className="p-3 font-semibold text-center">Atual</th>
            <th className="p-3 font-semibold text-center">Mín</th>
            <th className="p-3 font-semibold text-center">Ideal</th>
            <th className="p-3 font-semibold text-center">Máx</th>
            <th className="p-3 font-semibold text-right">Custo R$</th>
            <th className="p-3 font-semibold text-right">Venda R$</th>
            <th className="p-3 font-semibold text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const isSelected = selectedProductIds.includes(p.id);
            const currentStock = p.stockCurrent ?? 0;
            const minStock = p.stockMin ?? 0;
            const isLowStock = currentStock <= minStock && minStock > 0;

            return (
              <tr key={p.id} className={`border-b border-slate-100 ${isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(p.id)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                </td>
                
                {/* Miniatura da Imagem */}
                <td className="p-3 text-center">
                  <div className="w-9 h-9 mx-auto rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={p.imageUrl} 
                        alt={p.description} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-xs">📦</span>
                    )}
                  </div>
                </td>

                <td className="p-3 text-slate-600 font-mono">{p.internalCode || '-'}</td>
                <td className="p-3 font-medium text-slate-800 uppercase">{p.description}</td>
                <td className="p-3 text-slate-600">{p.brand || '-'}</td>
                
                {/* Colunas de Estoque */}
                <td className={`p-3 text-center font-bold ${isLowStock ? 'text-rose-600 bg-rose-50' : 'text-slate-800'}`}>
                  {currentStock} {isLowStock && <span title="Estoque abaixo do mínimo!">⚠️</span>}
                </td>
                <td className="p-3 text-center text-slate-500 font-mono">{p.stockMin ?? 0}</td>
                <td className="p-3 text-center text-blue-600 font-mono">{p.stockIdeal ?? 0}</td>
                <td className="p-3 text-center text-emerald-600 font-mono">{p.stockMax ?? 0}</td>

                <td className="p-3 text-right text-slate-700">R$ {Number(p.costPrice || 0).toFixed(2)}</td>
                <td className="p-3 text-right font-semibold text-emerald-600">R$ {Number(p.salePrice || 0).toFixed(2)}</td>
                
                <td className="p-3 text-center space-x-2">
                  <button onClick={() => onEdit(p)} className="text-blue-600 hover:underline font-semibold">Editar</button>
                  <button onClick={() => onDelete(p.id)} className="text-rose-600 hover:underline font-semibold">Excluir</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}