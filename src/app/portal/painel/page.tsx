'use client';

import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';

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
  const { isDarkMode, mounted: themeMounted } = useTheme();

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
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  
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

  if (!mounted || !themeMounted) {
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
    return (
      <div className={`min-h-screen flex items-center justify-center text-xs ${isDarkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
        A carregar portal...
      </div>
    );
  }

  const groupedQuotations = quotations.reduce((acc, cot) => {
    const comp = cot.companyName || 'Empresa Parceira';
    if (!acc[comp]) acc[comp] = [];
    acc[comp].push(cot);
    return acc;
  }, {} as Record<string, QuotationSupplierResult[]>);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <AppHeader
        title="Painel do Representante"
        subtitle={`Logado como: ${supplier.name} (${supplier.email})`}
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-6 sm:px-12 -mt-12 pb-20 relative z-20 space-y-8">
        
        <div className="flex justify-end">
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-rose-500 hover:text-rose-600 border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/10 px-4 py-2 rounded-xl transition cursor-pointer shadow-sm"
          >
            Sair da Sessão &rarr;
          </button>
        </div>

        <div className={`p-8 rounded-3xl shadow-2xl border space-y-5 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/80'}`}>
          <div>
            <h2 className="text-sm font-black tracking-tight">🏭 Minhas Distribuidoras / Marcas Representadas</h2>
            <p className="text-xs opacity-60 mt-0.5">Adicione as empresas e distribuidoras pelas quais atua (ex: Rogê, DPC, Martins).</p>
          </div>

          <form onSubmit={handleAddCompany} className="flex gap-3">
            <input
              type="text"
              placeholder="Nome da Distribuidora (ex: Martins)"
              value={newCompanyInput}
              onChange={(e) => setNewCompanyInput(e.target.value)}
              className={`flex-1 px-4 py-3 text-xs border rounded-2xl outline-none uppercase ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer shadow-lg shadow-indigo-600/20 whitespace-nowrap"
            >
              + Adicionar Marca
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2">
            {representedCompanies.map((comp) => (
              <div
                key={comp}
                className={`border text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2.5 shadow-sm ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'}`}
              >
                <span>📦 {comp}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCompany(comp)}
                  className="opacity-50 hover:opacity-100 text-rose-500 font-bold ml-1 cursor-pointer text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-8 rounded-3xl shadow-2xl border space-y-6 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/80'}`}>
          <h2 className="text-sm font-black tracking-tight">📋 Cotações e Notificações por Empresa Lojista</h2>
          
          {loading ? (
            <p className="text-xs opacity-60 py-12 text-center font-medium">A carregar cotações...</p>
          ) : Object.keys(groupedQuotations).length === 0 ? (
            <div className={`text-center py-16 border-2 border-dashed rounded-3xl ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <p className="opacity-60 text-xs font-medium">Não existem cotações atribuídas no momento.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedQuotations).map(([companyName, cots]) => (
                <div key={companyName} className={`border rounded-2xl p-6 space-y-4 ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/50'}`}>
                  <div className="flex justify-between items-center border-b pb-4 border-slate-500/10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full">
                      🏪 Lojista: {companyName}
                    </h3>
                    <span className="text-xs opacity-70 font-mono font-semibold">
                      {cots.length} cotação(ões) pendente(s)
                    </span>
                  </div>

                  <div className={`rounded-2xl border overflow-hidden shadow-inner ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-950/40' : 'border-slate-200 text-slate-600 bg-slate-50/50'}`}>
                          <th className="p-4 font-bold">ID Automático</th>
                          <th className="p-4 font-bold">Título / Referência</th>
                          <th className="p-4 font-bold text-center">Status</th>
                          <th className="p-4 font-bold text-right">Total Oferecido (R$)</th>
                          <th className="p-4 font-bold text-center">Ação</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                        {cots.map((cot) => (
                          <tr key={cot.quotationSupplierId} className={`transition ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/60'}`}>
                            <td className="p-4 font-mono opacity-70">
                              #{cot.quotationId.slice(0, 8)}
                            </td>
                            <td className="p-4 font-semibold">{cot.title || 'Cotação Geral'}</td>
                            <td className="p-4 text-center">
                              <span className={`font-bold px-3 py-1 rounded-full text-[10px] border ${
                                cot.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              }`}>
                                {cot.status === 'SENT' ? 'RESPONDIDA' : 'PENDENTE'}
                              </span>
                            </td>
                            <td className="p-4 text-right font-mono font-bold opacity-90">
                              R$ {cot.totalOffered ? Number(cot.totalOffered).toFixed(2) : '0,00'}
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => {
                                  setActiveQuotation(cot);
                                  setOfferValue(cot.totalOffered ? String(cot.totalOffered) : '');
                                }}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-indigo-600/20"
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

      </main>

      {activeQuotation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6 border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center border-b pb-4 border-slate-500/10">
              <div>
                <h3 className="text-sm font-black">Responder Cotação</h3>
                <p className="text-xs opacity-60 mt-0.5">Lojista: {activeQuotation.companyName}</p>
              </div>
              <button
                onClick={() => setActiveQuotation(null)}
                className="opacity-50 hover:opacity-100 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendResponse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 opacity-80">Valor Total da Proposta (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={offerValue}
                  onChange={(e) => setOfferValue(e.target.value)}
                  className={`w-full px-4 py-3 text-sm font-mono border rounded-2xl outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveQuotation(null)}
                  className={`flex-1 font-bold py-3 rounded-2xl text-xs transition cursor-pointer border ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-2xl text-xs transition cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  Enviar Resposta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-5 right-5 px-5 py-3 bg-emerald-600 text-white rounded-2xl shadow-2xl text-xs font-bold transition-all z-50">
          {toastMessage}
        </div>
      )}

      <CommandMenu 
        isOpen={isCmdOpen} 
        onClose={() => setIsCmdOpen(false)} 
        isDarkMode={isDarkMode} 
        latestQuotationId=""
      />

    </div>
  );
}