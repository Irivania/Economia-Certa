'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import QuotationForm from '@/components/QuotationForm';
import QuotationItemForm from '@/components/QuotationItemForm';
import QuotationCard from '@/components/QuotationCard';

interface Product {
  id: string;
  description: string;
}

interface Supplier {
  id: string;
  name: string;
}

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
  title: string;
  status: string;
  createdAt: string;
  items?: QuotationItem[];
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const [qRes, pRes, sRes] = await Promise.all([
          fetch(`/api/quotations?companyId=${companyId}`),
          fetch(`/api/products?companyId=${companyId}`),
          fetch(`/api/suppliers?companyId=${companyId}`),
        ]);

        if (!qRes.ok || !pRes.ok) throw new Error('Falha ao carregar dados do sistema.');

        const qData = await qRes.json();
        const pData = await pRes.json();
        const sData = sRes.ok ? await sRes.json() : [];

        if (isMounted) {
          setQuotations(Array.isArray(qData) ? qData : []);
          setProducts(Array.isArray(pData) ? pData : []);
          setSuppliers(Array.isArray(sData) ? sData : []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError('Não foi possível carregar as informações das cotações.');
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const handleRefresh = async () => {
    const [qRes] = await Promise.all([
      fetch(`/api/quotations?companyId=${companyId}`),
    ]);
    if (qRes.ok) {
      const qData = await qRes.json();
      setQuotations(Array.isArray(qData) ? qData : []);
    }
  };

  const exportToCSV = (quotationTitle: string, items: QuotationItem[]) => {
    let csvContent = "data:text/csv;charset=utf-8,Produto,Fornecedor,Quantidade,Preco Unitario,Total\n";
    
    items.forEach((item) => {
      const priceVal = Number(item.price) || 0;
      const qtyVal = Number(item.requestedQuantity) || 0;
      const row = [
        `"${item.product?.description || 'Produto'}"`,
        `"${item.supplier?.name || 'Fornecedor'}"`,
        qtyVal,
        priceVal,
        qtyVal * priceVal
      ].join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cotacao_${quotationTitle.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Relatório exportado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">📊 Painel de Cotações & Comparador</h1>
            <p className="text-slate-600 text-sm">Melo Perfumaria — Gestão de compras e melhores preços.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors">
              &larr; Dashboard
            </Link>
            <Link href="/produtos" className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors">
              Ir para Produtos &rarr;
            </Link>
          </div>
        </div>

        <QuotationForm companyId={companyId} onSuccess={handleRefresh} showToast={showToast} />

        {quotations.length > 0 && (
          <QuotationItemForm
            quotations={quotations}
            products={products}
            suppliers={suppliers}
            onSuccess={handleRefresh}
            showToast={showToast}
          />
        )}

        {loading ? (
          <p className="text-slate-500 text-center py-10">Carregando cotações...</p>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Cotações Cadastradas & Comparativo</h2>
            {quotations.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                <p className="text-slate-400 mb-1">Nenhuma cotação cadastrada ainda.</p>
              </div>
            ) : (
              quotations.map((q) => (
                <QuotationCard 
                  key={q.id} 
                  quotation={q} 
                  onExport={exportToCSV} 
                  showToast={showToast} 
                />
              ))
            )}
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 px-5 py-3 bg-emerald-600 text-white rounded-lg shadow-lg text-sm font-semibold transition-all z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}