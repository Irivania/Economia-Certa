'use client';

import { useState } from 'react';

interface QuotationItem {
  id: string;
  productId: string;
  supplierId: string;
  requestedQuantity: string;
  price: string;
  product?: { description: string };
  supplier?: { name: string };
}

interface Quotation {
  id: string;
  companyId?: string; // Ajustado para opcional para evitar erros de tipagem
  title: string;
  status: string;
  createdAt: string;
  items?: QuotationItem[];
}

interface QuotationCardProps {
  quotation: Quotation;
  onExport: (title: string, items: QuotationItem[]) => void;
  showToast: (msg: string) => void;
}

export default function QuotationCard({ quotation, onExport, showToast }: QuotationCardProps) {
  const [updating, setUpdating] = useState(false);
  const items = quotation.items || [];
  const lowestPrices: { [productId: string]: number } = {};

  items.forEach((item) => {
    const price = Number(item.price) || 0;
    if (!lowestPrices[item.productId] || price < lowestPrices[item.productId]) {
      lowestPrices[item.productId] = price;
    }
  });

  const handleUpdateCatalogCosts = async () => {
    if (!confirm('Deseja atualizar o preço de custo dos produtos no catálogo com os menores preços desta cotação?')) {
      return;
    }

    try {
      setUpdating(true);
      const res = await fetch('/api/quotations/update-costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: quotation.companyId,
          quotationId: quotation.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar custos.');

      showToast(data.message || 'Custos atualizados com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar os custos no catálogo.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-xs">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base">{quotation.title}</h3>
          <p className="text-xs text-slate-400">Criada em: {new Date(quotation.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {items.length > 0 && (
            <>
              <button
                onClick={handleUpdateCatalogCosts}
                disabled={updating}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {updating ? 'Atualizando...' : '⚡ Atualizar Custos no Catálogo'}
              </button>
              <button
                onClick={() => onExport(quotation.title, items)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                📥 Exportar
              </button>
            </>
          )}
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            {quotation.status === 'OPEN' ? 'Aberta' : quotation.status}
          </span>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="p-2 font-semibold">Produto</th>
                <th className="p-2 font-semibold">Fornecedor</th>
                <th className="p-2 font-semibold">Qtd</th>
                <th className="p-2 font-semibold">Preço Unitário</th>
                <th className="p-2 font-semibold">Total Item</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const price = Number(item.price) || 0;
                const isCheapest = price === lowestPrices[item.productId];
                const total = (Number(item.requestedQuantity) || 0) * price;

                return (
                  <tr
                    key={idx}
                    className={`border-b border-slate-100 ${
                      isCheapest ? 'bg-emerald-50/70 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="p-2 text-slate-800">
                      {item.product?.description || 'Produto'}
                      {isCheapest && (
                        <span className="ml-2 px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">
                          Melhor Preço
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-slate-600">{item.supplier?.name || 'Fornecedor'}</td>
                    <td className="p-2 text-slate-600">{item.requestedQuantity}</td>
                    <td className="p-2 text-slate-600">R$ {price.toFixed(2)}</td>
                    <td className="p-2 font-semibold text-slate-800">R$ {total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center">
          <p className="text-xs text-slate-500">Nenhum item adicionado a esta cotação ainda. Utilize o formulário acima.</p>
        </div>
      )}
    </div>
  );
}