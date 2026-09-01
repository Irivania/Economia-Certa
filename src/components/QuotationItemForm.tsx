'use client';

import { useState } from 'react';

interface Product {
  id: string;
  description: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface Quotation {
  id: string;
  title: string;
}

interface QuotationItemFormProps {
  quotations: Quotation[];
  products: Product[];
  suppliers: Supplier[];
  onSuccess: () => void;
  showToast: (msg: string) => void;
}

export default function QuotationItemForm({
  quotations,
  products,
  suppliers,
  onSuccess,
  showToast,
}: QuotationItemFormProps) {
  const [selectedQuotationId, setSelectedQuotationId] = useState('');
  const [productId, setProductId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [itemSubmitting, setItemSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuotationId || !productId || !supplierId || !unitPrice) {
      alert('Preencha todos os campos do item (Cotação, Produto, Fornecedor e Preço).');
      return;
    }

    try {
      setItemSubmitting(true);
      const res = await fetch('/api/quotations/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationId: selectedQuotationId,
          productId,
          supplierId,
          quantity: Number(quantity),
          price: Number(unitPrice),
        }),
      });

      if (!res.ok) throw new Error('Erro ao adicionar item.');

      setUnitPrice('');
      showToast('Proposta de preço adicionada com sucesso!');
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar item na cotação.');
    } finally {
      setItemSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-6 bg-blue-50/40 rounded-lg border border-blue-100">
      <h2 className="text-md font-bold text-slate-800 mb-3">Adicionar Proposta de Fornecedor</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <select
          value={selectedQuotationId}
          onChange={(e) => setSelectedQuotationId(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
        >
          <option value="">Selecione a Cotação</option>
          {quotations.map((q) => (
            <option key={q.id} value={q.id}>{q.title}</option>
          ))}
        </select>

        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
        >
          <option value="">Selecione o Produto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.description}</option>
          ))}
        </select>

        <select
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
        >
          <option value="">Selecione o Fornecedor</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Qtd"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
        />

        <input
          type="number"
          step="0.01"
          placeholder="Preço Unit. R$"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
        />
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={itemSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {itemSubmitting ? 'Adicionando...' : '+ Adicionar Preço à Cotação'}
        </button>
      </div>
    </form>
  );
}