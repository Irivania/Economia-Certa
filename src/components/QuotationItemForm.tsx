'use client';

import { useState } from 'react';
import ProductSelectionModal from './ProductSelectionModal';
import { useTheme } from '@/context/ThemeContext';

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
  const { isDarkMode } = useTheme();
  const [selectedQuotationId, setSelectedQuotationId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [itemSubmitting, setItemSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddSelectedProducts = async (selectedProductIds: string[]) => {
    if (!selectedQuotationId || !supplierId) {
      alert('Selecione primeiro a Cotação e o Fornecedor.');
      return;
    }

    if (selectedProductIds.length === 0) return;

    try {
      setItemSubmitting(true);

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
      <div className={`rounded-2xl border p-6 mb-8 space-y-6 transition-all ${
        isDarkMode ? 'bg-slate-950/50 border-slate-800 text-white' : 'bg-slate-50/60 border-slate-200/80 text-slate-900'
      }`}>
        <div>
          <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
            Gestão Comercial
          </span>
          <h2 className="text-base font-black tracking-tight">Adicionar Proposta de Fornecedor</h2>
          <p className="text-xs opacity-60 mt-1 font-medium">Selecione os parâmetros e escolha os itens do catálogo para compor a proposta.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider opacity-60 mb-1.5">Cotação</label>
            <select
              value={selectedQuotationId}
              onChange={(e) => setSelectedQuotationId(e.target.value)}
              className={`w-full rounded-xl border px-3 py-2.5 text-xs font-bold outline-none transition-all ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-600'
              }`}
            >
              <option value="">Selecione a Cotação</option>
              {quotations.map((q) => (
                <option key={q.id} value={q.id}>{q.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider opacity-60 mb-1.5">Fornecedor / Distribuidor</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className={`w-full rounded-xl border px-3 py-2.5 text-xs font-bold outline-none transition-all ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-600'
              }`}
            >
              <option value="">Selecione o Fornecedor</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-slate-500/10 gap-3">
          <p className="text-xs opacity-60 font-medium">
            💡 Busque por nome ou marca para selecionar múltiplos produtos do catálogo.
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
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-5 py-3 transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer flex items-center gap-2 shrink-0"
          >
            <span>🔍 Escolher Produtos do Catálogo...</span>
          </button>
        </div>
      </div>

      <ProductSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={products}
        onAddSelectedProducts={handleAddSelectedProducts}
      />
    </>
  );
}