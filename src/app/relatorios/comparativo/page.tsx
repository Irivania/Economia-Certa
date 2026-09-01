'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ComparativeItem {
  productId: string;
  description: string;
  suppliers: {
    supplierId: string;
    supplierName: string;
    price: number;
    isLowest: boolean;
  }[];
}

export default function ComparativeReportPage() {
  const [companyId] = useState('915a8bc1-5db7-4605-93a9-b78090e75679');
  const [quotationId, setQuotationId] = useState('');
  const [items, setItems] = useState<ComparativeItem[]>([]);
  const [suppliersList, setSuppliersList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!quotationId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/price-comparison?companyId=${companyId}&quotationId=${quotationId}`);
      const json = await response.json();
      if (response.ok) {
        setItems(json.items || []);
        setSuppliersList(json.suppliers || []);
      } else {
        alert(json.error || 'Erro ao carregar relatório');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        
        {/* Cabeçalho com Navegação */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">📈 Relatório Comparativo de Preços</h1>
            <p className="text-slate-600 text-sm">Análise lado a lado de preços por fornecedor.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors">
              &larr; Dashboard
            </Link>
            <Link href="/cotacoes" className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors">
              Ir para Cotações &rarr;
            </Link>
          </div>
        </div>

        {/* Input de Pesquisa */}
        <div className="flex gap-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 print:hidden">
          <input
            type="text"
            placeholder="Digite o ID da Cotação..."
            value={quotationId}
            onChange={(e) => setQuotationId(e.target.value)}
            className="border border-slate-300 p-2 rounded-lg flex-1 uppercase text-sm bg-white"
          />
          <button
            onClick={fetchReport}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </button>
        </div>

        {/* Tabela Comparativa */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="p-3 font-semibold">Produto</th>
                {suppliersList.map((sup, idx) => (
                  <th key={idx} className="p-3 text-right font-semibold">{sup}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={suppliersList.length + 1} className="p-8 text-center text-slate-500">
                    Nenhum dado encontrado. Informe uma cotação válida acima.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.productId} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-800">{item.description}</td>
                    {suppliersList.map((supName) => {
                      const found = item.suppliers.find((s) => s.supplierName === supName);
                      return (
                        <td
                          key={supName}
                          className={`p-3 text-right ${
                            found?.isLowest ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'
                          }`}
                        >
                          {found ? `R$ ${found.price.toFixed(2)}` : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}