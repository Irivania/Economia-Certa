'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SupplierQuotation {
  quotationSupplierId: string;
  quotationId: string;
  title: string;
  startDate?: string | null;
  endDate?: string | null;
  closingTime?: string | null;
  status: string;
  totalOffered?: number | null;
  token: string;
  companyName: string;
}

interface LoggedSupplier {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
}

export default function SupplierDashboardPage() {
  const router = useRouter();
  const [supplier] = useState<LoggedSupplier | null>(() => {
    if (typeof window === 'undefined') return null;

    const storedSupplier = localStorage.getItem('economia_certa_supplier');
    if (!storedSupplier) return null;

    try {
      return JSON.parse(storedSupplier) as LoggedSupplier;
    } catch {
      return null;
    }
  });
  const [quotations, setQuotations] = useState<SupplierQuotation[]>([]);
  const [loading, setLoading] = useState(() => supplier !== null);

  useEffect(() => {
    if (!supplier) return;

    const supplierId = supplier.id;

    async function loadQuotations() {
      try {
        const response = await fetch(`/api/portal/quotations?supplierId=${supplierId}`);
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          setQuotations(data);
        }
      } catch (error) {
        console.error('Erro ao carregar cotações:', error);
      } finally {
        setLoading(false);
      }
    }

    void loadQuotations();
  }, [supplier]);

  function handleLogout() {
    localStorage.removeItem('economia_certa_supplier');
    router.push('/portal/login');
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">A carregar painel...</div>;
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md w-full text-center space-y-4">
          <h1 className="text-xl font-bold text-slate-800">Acesso Restrito ao Fornecedor</h1>
          <p className="text-sm text-slate-500">Deve iniciar sessão com a sua conta para visualizar o painel unificado de cotações.</p>
          <Link href="/portal/login" className="block w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg text-sm hover:bg-indigo-700 transition">
            Iniciar Sessão
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Portal do Fornecedor B2B</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Bem-vindo, {supplier.name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Gerencie todas as cotações recebidas de diferentes empresas num único local.</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-lg transition"
          >
            Terminar Sessão
          </button>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 font-bold text-slate-800 text-sm">
            Caixa de Entrada de Cotações ({quotations.length})
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
                <tr>
                  <th className="p-4 font-semibold">Empresa Solicitante</th>
                  <th className="p-4 font-semibold">Título da Cotação</th>
                  <th className="p-4 text-center font-semibold">Início / Término</th>
                  <th className="p-4 text-center font-semibold">Estado</th>
                  <th className="p-4 text-right font-semibold">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Nenhuma cotação recebida no momento.
                    </td>
                  </tr>
                ) : (
                  quotations.map((q) => (
                    <tr key={q.quotationSupplierId} className="hover:bg-slate-50/50">
                      <td className="p-4 font-semibold text-indigo-900">
                        {q.companyName}
                      </td>
                      <td className="p-4 font-medium text-slate-800">
                        {q.title}
                      </td>
                      <td className="p-4 text-center text-xs text-slate-500">
                        {formatDate(q.startDate)} até {formatDate(q.endDate)}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${q.status === 'RESPONDIDO' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {q.status === 'RESPONDIDO' ? 'Respondido' : 'Pendente'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/portal/cotacao/${q.token}`}
                          className={`inline-block px-4 py-1.5 rounded-lg text-xs font-medium transition shadow-sm ${q.status === 'RESPONDIDO' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        >
                          {q.status === 'RESPONDIDO' ? 'Revisar Resposta' : 'Preencher Cotação'}
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}