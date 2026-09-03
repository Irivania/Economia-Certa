'use client';

import { useState } from 'react';
import ProductSelectionModal from './ProductSelectionModal';

interface Product {
  id: string;
  description: string;
  ean?: string;
  brand?: string;
  imageUrl?: string;
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
  const [supplierId, setSupplierId] = useState('');
  const [itemSubmitting, setItemSubmitting] = useState(false);

  // Estado para controlar a abertura do modal de seleção de produtos
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddSelectedProducts = async (selectedProductIds: string[]) => {
    if (!selectedQuotationId || !supplierId) {
      alert('Selecione primeiro a Cotação e o Fornecedor.');
      return;
    }

    if (selectedProductIds.length === 0) return;

    try {
      setItemSubmitting(true);

      // Insere cada produto selecionado na cotação
      for (const productId of selectedProductIds) {
        await fetch('/api/quotations/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quotationId: selectedQuotationId,
            productId,
            supplierId,
            quantity: 1,
            price: 0,
          }),
        });
      }

      showToast(`${selectedProductIds.length} produto(s) adicionado(s) com sucesso à cotação!`);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Erro ao adicionar produtos à cotação.');
    } finally {
      setItemSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-8 p-6 bg-blue-50/40 rounded-lg border border-blue-100">
        <h2 className="text-md font-bold text-slate-800 mb-3">Adicionar Proposta de Fornecedor</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <select
            value={selectedQuotationId}
            onChange={(e) => setSelectedQuotationId(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            <option value="">Selecione a Cotação</option>
            {quotations.map((q) => (
              <option key={q.id} value={q.id}>{q.title}</option>
            ))}
          </select>

          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            <option value="">Selecione o Fornecedor</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Botão que abre a lista/modal para buscar e selecionar os produtos */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t border-blue-100 gap-2">
          <p className="text-xs text-slate-500">
            Busque por nome ou marca para selecionar múltiplos produtos do catálogo.
          </p>
          <button
            type="button"
            onClick={() => {
              if (!selectedQuotationId || !supplierId) {
                alert('Por favor, selecione a Cotação e o Fornecedor antes de escolher os produtos.');
                return;
              }
              setIsModalOpen(true);
            }}
            disabled={itemSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            🔍 Escolher Produtos do Catálogo...
          </button>
        </div>
      </div>

      {/* Modal de Busca e Seleção de Produtos */}
      <ProductSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={products}
        onAddSelectedProducts={handleAddSelectedProducts}
      />
    </>
  );
}