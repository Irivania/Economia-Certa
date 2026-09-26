'use client';

import { useState, useEffect } from 'react';
import { ProductImportModal, Product, ItemPendente } from '@/components/ProductImportModal';

export default function ImportarPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(`/api/products?companyId=${companyId}`);
        if (!res.ok) throw new Error('Erro ao carregar produtos.');
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [companyId]);

  const handleQuickRegister = async (itemPendente: ItemPendente) => {
    // Função opcional caso utilize submissão direta no modal
    console.log(itemPendente);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-6 flex items-center justify-center">
        <p className="text-xs text-slate-500 font-semibold">A carregar catálogo de produtos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-800">🔄 Central de Importação Inteligente</h1>
            <p className="text-xs text-slate-500">Melo Perfumaria — Cruzamento e Cadastro Rápido de Produtos.</p>
          </div>
          <a
            href="/produtos"
            className="text-xs font-semibold text-slate-600 hover:underline"
          >
            &larr; Voltar para Catálogo de Produtos
          </a>
        </div>

        {/* Componente Modularizado da Central de Importação */}
        <ProductImportModal 
          products={products} 
          onQuickRegister={handleQuickRegister} 
        />

      </div>
    </div>
  );
}