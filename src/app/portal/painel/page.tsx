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
import { SupplierHeader } from '@/components/portal/SupplierHeader';

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

interface Connection {
  id: string;
  companyId: string;
  status: string;
  initiatedBy: string;
}

interface SupplierSession {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

const subscribeToHydration = () => () => {};

export default function SupplierPortalDashboard() {
  const router = useRouter();
  const { isDarkMode, mounted: themeMounted } = useTheme();

  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const sessionData = useSyncExternalStore(
    subscribeToHydration,
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
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [representedCompanies, setRepresentedCompanies] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['MARTINS', 'ROGÊ', 'DPC'];
    const currentSession = sessionStorage.getItem('melo_supplier_session');
    if (!currentSession) return ['MARTINS', 'ROGÊ', 'DPC'];

    try {
      const currentSupplier = JSON.parse(currentSession) as SupplierSession;
      const savedCompanies = localStorage.getItem(`represented_companies_${currentSupplier.id}`);
      return savedCompanies ? (JSON.parse(savedCompanies) as string[]) : ['MARTINS', 'ROGÊ', 'DPC'];
    } catch {
      return ['MARTINS', 'ROGÊ', 'DPC'];
    }
  });

  const [newCompanyInput, setNewCompanyInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const loadPortalData = useCallback(async (supplierId: string) => {
    try {
      const [cotRes, connRes] = await Promise.all([
        fetch(`/api/portal/quotations`),
        fetch(`/api/portal/connections?supplierId=${supplierId}`)
      ]);

      if (cotRes.ok) {
        const cotData = await cotRes.json();
        setQuotations(Array.isArray(cotData) ? cotData : []);
      }
      if (connRes.ok) {
        const connData = await connRes.json();
        setConnections(Array.isArray(connData) ? connData : []);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do portal:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!sessionData || !supplier) {
      router.push('/portal/login');
      return;
    }
    queueMicrotask(() => {
      void loadPortalData(supplier.id);
    });
  }, [router, loadPortalData, sessionData, supplier]);

  if (!mounted || !themeMounted) {
    return null;
  }

  const handleUpdateConnection = async (connectionId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/portal/connections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, status })
      });

      if (!res.ok) throw new Error('Erro ao atualizar convite.');

      showToast(status === 'ACCEPTED' ? 'Parceria aceita com sucesso!' : 'Convite recusado.');
      if (supplier) {
        await loadPortalData(supplier.id);
      }
    } catch {
      showToast('Erro ao processar convite.');
    }
  };

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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <SupplierHeader
        title="Painel do Representante"
        subtitle={`Logado como: ${supplier.name} (${supplier.email})`}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-6 sm:px-12 mt-8 pb-20 relative z-20 space-y-8">

        {/* SECÇÃO DE CONVITES PENDENTES DE LOJISTAS */}
        {connections.length > 0 && (
          <div className={`p-8 rounded-3xl shadow-2xl border space-y-4 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/80'}`}>
            <h2 className="text-sm font-black tracking-tight">🤝 Convites e Parcerias Comerciais</h2>
            <div className="space-y-3">
              {connections.map((conn) => (
                <div key={conn.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/50'}`}>
                  <div>
                    <p className="text-xs font-bold">Solicitação de Parceria (Loja ID: #{conn.companyId.slice(0, 8)})</p>
                    <p className="text-[10px] opacity-60 font-mono mt-0.5">Estado atual: <span className="uppercase font-bold">{conn.status}</span></p>
                  </div>

                  {conn.status === 'PENDING' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateConnection(conn.id, 'ACCEPTED')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-md"
                      >
                        Aceitar Parceria
                      </button>
                      <button
                        onClick={() => handleUpdateConnection(conn.id, 'REJECTED')}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                      >
                        Recusar
                      </button>
                    </div>
                  ) : (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      conn.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                      {conn.status === 'ACCEPTED' ? 'PARCERIA ATIVA' : 'RECUSADO'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
          <div className="flex justify-between items-center border-b pb-4 border-slate-500/10">
            <div>
              <h2 className="text-sm font-black tracking-tight">📋 Cotações e Notificações por Empresa Lojista</h2>
              <p className="text-xs opacity-60 mt-0.5">Selecione uma cotação abaixo para preencher preços e prazos diretamente no portal.</p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              {quotations.length} disponíveis
            </span>
          </div>

          {loading ? (
            <p className="text-xs opacity-60 py-12 text-center font-medium">A carregar cotações...</p>
          ) : quotations.length === 0 ? (
            <div className={`text-center py-16 border-2 border-dashed rounded-3xl ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <p className="opacity-60 text-xs font-medium">Não existem cotações atribuídas no momento.</p>
            </div>
          ) : (
            <div className={`rounded-2xl border overflow-hidden shadow-inner ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-950/40' : 'border-slate-200 text-slate-600 bg-slate-50/50'}`}>
                    <th className="p-4 font-bold">Empresa Lojista</th>
                    <th className="p-4 font-bold">Título / Referência</th>
                    <th className="p-4 font-bold text-center">Status</th>
                    <th className="p-4 font-bold text-right">Total Oferecido (R$)</th>
                    <th className="p-4 font-bold text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                  {quotations.map((cot) => (
                    <tr key={cot.quotationSupplierId || cot.quotationId} className={`transition ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/60'}`}>
                      <td className="p-4 font-bold text-indigo-500">
                        🏪 {cot.companyName || 'Melo Perfumaria'}
                      </td>
                      <td className="p-4 font-semibold">{cot.title || 'Cotação de Reposição'}</td>
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
                            const targetToken = cot.token || cot.quotationId;
                            router.push(`/portal/cotacao/${targetToken}`);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-indigo-600/20"
                        >
                          Responder Cotação
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 px-5 py-3 bg-emerald-600 text-white rounded-2xl shadow-2xl text-xs font-bold transition-all z-50">
          {toastMessage}
        </div>
      )}

    </div>
  );
}