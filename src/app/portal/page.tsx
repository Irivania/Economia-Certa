'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CotacaoItem {
  id: string;
  productId: string;
  productDescription: string;
  quantity: number;
  unitPrice?: number | null;
  totalPrice?: number | null;
}

interface Quotation {
  id: string;
  companyId: string;
  supplierId: string;
  status: 'PENDING' | 'SENT' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  items: CotacaoItem[];
}

interface SupplierSession {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export default function SupplierPortalDashboard() {
  const router = useRouter();
  const [supplier, setSupplier] = useState<SupplierSession | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let isMounted = true;

    async function verifySessionAndLoadData() {
      const sessionData = sessionStorage.getItem('melo_supplier_session');
      if (!sessionData) {
        router.push('/portal/login');
        return;
      }

      try {
        const parsedSupplier: SupplierSession = JSON.parse(sessionData);
        if (isMounted) {
          setSupplier(parsedSupplier);
        }

        const res = await fetch(`/api/portal/quotations?supplierId=${parsedSupplier.id}`);
        if (!res.ok) throw new Error('Erro ao carregar cotações do portal.');
        const data = await res.json();
        
        if (isMounted) {
          setQuotations(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verifySessionAndLoadData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('melo_supplier_session');
    router.push('/portal/login');
  };

  if (!supplier) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">A carregar portal...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
        
        {/* Cabeçalho do Fornecedor */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-800">🏢 Portal do Fornecedor / Distribuidor</h1>
            <p className="text-xs text-slate-500">Bem-vindo(a), <span className="font-semibold text-slate-700">{supplier.name}</span> ({supplier.email})</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 border border-rose-200 hover:border-rose-300 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            Sair da Sessão &rarr;
          </button>
        </div>

        {/* Lista de Cotações Recebidas */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-4">📋 Cotações e Pedidos Pendentes</h2>
          {loading ? (
            <p className="text-xs text-slate-400 py-10 text-center">A carregar cotações...</p>
          ) : quotations.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
              <p className="text-slate-400 text-xs">Não existem cotações pendentes no momento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quotations.map((cot) => (
                <div key={cot.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span><b>Cotação ID:</b> {cot.id.slice(0, 8)}...</span>
                    <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {cot.status}
                    </span>
                  </div>
                  
                  <div className="bg-white rounded border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                          <th className="p-2.5 font-semibold">Produto</th>
                          <th className="p-2.5 font-semibold text-center">Qtd Solicitada</th>
                          <th className="p-2.5 font-semibold text-right">Preço Unitário (R$)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cot.items?.map((item) => (
                          <tr key={item.id} className="border-b border-slate-100">
                            <td className="p-2.5 text-slate-800 font-medium">{item.productDescription}</td>
                            <td className="p-2.5 text-center text-slate-600">{item.quantity}</td>
                            <td className="p-2.5 text-right font-mono text-slate-800">
                              R$ {item.unitPrice ? item.unitPrice.toFixed(2) : '0,00'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}