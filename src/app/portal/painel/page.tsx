'use client';

import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { useRouter } from 'next/navigation';

interface QuotationSupplierResult {
  quotationSupplierId: string;
  quotationId: string;
  title?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  closingTime?: string | null;
  status: string;
  totalOffered?: number | null;
  token?: string | null;
  companyName: string;
}

interface SupplierSession {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export default function SupplierPortalDashboard() {
  const router = useRouter();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const sessionData = useSyncExternalStore(
    () => () => {},
    () => sessionStorage.getItem('melo_supplier_session') ?? '',
    () => ''
  );

  const supplier = useMemo<SupplierSession | null>(() => {
    if (!sessionData) return null;

    try {
      return JSON.parse(sessionData) as SupplierSession;
    } catch {
      return null;
    }
  }, [sessionData]);
  const [quotations, setQuotations] = useState<QuotationSupplierResult[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [representedCompanies, setRepresentedCompanies] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return ['MARTINS', 'ROGÊ', 'DPC'];
    }

    const currentSession = sessionStorage.getItem('melo_supplier_session');
    if (!currentSession) return ['MARTINS', 'ROGÊ', 'DPC'];

    try {
      const currentSupplier = JSON.parse(currentSession) as SupplierSession;
      const savedCompanies = localStorage.getItem(
        `represented_companies_${currentSupplier.id}`
      );

      return savedCompanies
        ? (JSON.parse(savedCompanies) as string[])
        : ['MARTINS', 'ROGÊ', 'DPC'];
    } catch {
      return ['MARTINS', 'ROGÊ', 'DPC'];
    }
  });
  const [newCompanyInput, setNewCompanyInput] = useState('');
  
  const [activeQuotation, setActiveQuotation] = useState<QuotationSupplierResult | null>(null);
  const [offerValue, setOfferValue] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const loadQuotations = useCallback(async (supplierId: string) => {
    try {
      const res = await fetch(`/api/portal/quotations?supplierId=${supplierId}`);
      if (!res.ok) throw new Error('Erro ao carregar cotações do portal.');
      const data = await res.json();
      setQuotations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!sessionData) {
      router.push('/portal/login');
      return;
    }

    if (!supplier) {
      router.push('/portal/login');
      return;
    }

    queueMicrotask(() => {
      void loadQuotations(supplier.id);
    });
  }, [router, loadQuotations, sessionData, supplier]);

  // Evita qualquer discrepância de hidratação SSR / Cliente
  if (!mounted) {
    return null;
  }

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyInput.trim() || !supplier) return;

    const companyNameClean = newCompanyInput.trim().toUpperCase();
    if (representedCompanies.includes(companyNameClean)) return;

    const updatedList = [...representedCompanies, companyNameClean];
    setRepresentedCompanies(updatedList);
    localStorage.setItem(`represented_companies_${supplier.id}`, JSON.stringify(updatedList));
    setNewCompanyInput('');
  };

  const handleRemoveCompany = (companyToRemove: string) => {
    if (!supplier) return;
    const updatedList = representedCompanies.filter((comp) => comp !== companyToRemove);
    setRepresentedCompanies(updatedList);
    localStorage.setItem(`represented_companies_${supplier.id}`, JSON.stringify(updatedList));
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuotation || !offerValue) return;

    try {
      setQuotations((prev) =>
        prev.map((q) =>
          q.quotationSupplierId === activeQuotation.quotationSupplierId
            ? { ...q, status: 'SENT', totalOffered: Number(offerValue) }
            : q
        )
      );

      showToast('Resposta enviada com sucesso à empresa lojista!');
      setActiveQuotation(null);
      setOfferValue('');
    } catch {
      showToast('Erro ao enviar resposta.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('melo_supplier_session');
    router.push('/portal/login');
  };

  if (!supplier) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">A carregar portal...</div>;
  }

  const groupedQuotations = quotations.reduce((acc, cot) => {
    const comp = cot.companyName || 'Empresa Parceira';
    if (!acc[comp]) acc[comp] = [];
    acc[comp].push(cot);
    return acc;
  }, {} as Record<string, QuotationSupplierResult[]>);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-800">🏢 Portal do Representante / Distribuidor</h1>
            <p className="text-xs text-slate-500 mt-1">
              Logado como: <span className="font-semibold text-slate-700">{supplier.name}</span> ({supplier.email})
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 border border-rose-200 hover:border-rose-300 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            Sair da Sessão &rarr;
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">🏭 Minhas Distribuidoras / Marcas Representadas</h2>
            <p className="text-xs text-slate-500">Adicione as empresas e distribuidoras pelas quais atua (ex: Rogê, DPC, Martins).</p>
          </div>

          <form onSubmit={handleAddCompany} className="flex gap-3">
            <input
              type="text"
              placeholder="Nome da Distribuidora (ex: Martins)"
              value={newCompanyInput}
              onChange={(e) => setNewCompanyInput(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600 transition uppercase"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
            >
              + Adicionar Marca
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2">
            {representedCompanies.map((comp) => (
              <div
                key={comp}
                className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-2xs"
              >
                <span>📦 {comp}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCompany(comp)}
                  className="text-slate-400 hover:text-rose-600 font-bold ml-1 cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
          <h2 className="text-sm font-bold text-slate-800">📋 Cotações e Notificações por Empresa Lojista</h2>
          
          {loading ? (
            <p className="text-xs text-slate-400 py-10 text-center">A carregar cotações...</p>
          ) : Object.keys(groupedQuotations).length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
              <p className="text-slate-400 text-xs">Não existem cotações atribuídas no momento.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedQuotations).map(([companyName, cots]) => (
                <div key={companyName} className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/50">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                      🏪 Lojista: {companyName}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {cots.length} cotação(ões) pendente(s)
                    </span>
                  </div>

                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                          <th className="p-3 font-semibold">ID Automático</th>
                          <th className="p-3 font-semibold">Título / Referência</th>
                          <th className="p-3 font-semibold text-center">Status</th>
                          <th className="p-3 font-semibold text-right">Total Oferecido (R$)</th>
                          <th className="p-3 font-semibold text-center">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cots.map((cot) => (
                          <tr key={cot.quotationSupplierId} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="p-3 font-mono text-[11px] text-slate-500">
                              #{cot.quotationId.slice(0, 8)}
                            </td>
                            <td className="p-3 text-slate-800 font-medium">{cot.title || 'Cotação Geral'}</td>
                            <td className="p-3 text-center">
                              <span className={`font-bold px-2.5 py-0.5 rounded text-[10px] ${
                                cot.status === 'SENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {cot.status === 'SENT' ? 'RESPONDIDA' : 'PENDENTE'}
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono text-slate-800 font-semibold">
                              R$ {cot.totalOffered ? Number(cot.totalOffered).toFixed(2) : '0,00'}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => {
                                  setActiveQuotation(cot);
                                  setOfferValue(cot.totalOffered ? String(cot.totalOffered) : '');
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                              >
                                Responder
                              </button>
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

      {activeQuotation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Responder Cotação</h3>
                <p className="text-[11px] text-slate-500">Lojista: {activeQuotation.companyName}</p>
              </div>
              <button
                onClick={() => setActiveQuotation(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendResponse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Valor Total da Proposta (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={offerValue}
                  onChange={(e) => setOfferValue(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-indigo-600 transition"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveQuotation(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm"
                >
                  Enviar Resposta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-5 right-5 px-5 py-3 bg-emerald-600 text-white rounded-lg shadow-lg text-xs font-semibold transition-all z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}