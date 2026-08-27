'use client';

import { useEffect, useState } from 'react';

interface ProductItem {
  id: string;
  description: string;
  unit: string;
  internalCode?: string;
  brand?: string;
  category?: string;
  costPrice?: string;
  salePrice?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Erro ao buscar produtos da API:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">📦 Catálogo de Produtos</h1>
            <p className="text-slate-600 text-sm">Produtos reais cadastrados no Economia Certa ERP.</p>
          </div>
          <a
            href="/importar"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            + Importar Planilha
          </a>
        </div>

        {loading ? (
          <p className="text-slate-500 text-center py-10">Carregando produtos do banco...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold bg-slate-50">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Marca</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Unidade</th>
                  <th className="py-3 px-4">Custo (R$)</th>
                  <th className="py-3 px-4">Venda (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate100 text-sm text-slate-700">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-slate-400">Nenhum produto cadastrado ainda. Faça uma importação!</td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-xs">{p.internalCode || '-'}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{p.description}</td>
                      <td className="py-3 px-4">{p.brand || '-'}</td>
                      <td className="py-3 px-4">{p.category || '-'}</td>
                      <td className="py-3 px-4">{p.unit}</td>
                      <td className="py-3 px-4">R$ {p.costPrice || '0.00'}</td>
                      <td className="py-3 px-4 font-semibold text-blue-600">R$ {p.salePrice || '0.00'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}