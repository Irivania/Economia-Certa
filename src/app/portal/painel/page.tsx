'use client';

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { SupplierHeader } from '@/components/portal/SupplierHeader';
import { ProfileSettingsCard } from '@/components/portal/ProfileSettingsCard';
import { BrandPortfolioSection } from '@/components/portal/BrandPortfolioSection';
import { ConnectionRequests, Connection } from '@/components/portal/ConnectionRequests';
import { QuotationsList, QuotationSupplierResult } from '@/components/portal/QuotationsList';

interface SupplierSession {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export interface RepresentedCompany {
  id: string;
  tradeName: string;
  corporateName: string;
  cnpj: string;
  email: string;
  phone: string;
}

const subscribeToHydration = () => () => {};

export default function SupplierPortalDashboard() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const sessionData = useSyncExternalStore(
    subscribeToHydration,
    () => sessionStorage.getItem('melo_supplier_session') ?? '',
    () => ''
  );

  // Redirecionamento seguro via useEffect
  useEffect(() => {
    if (mounted && !sessionData) {
      router.push('/portal/login');
    }
  }, [mounted, sessionData, router]);

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
  const [loading, setLoading] = useState(false);

  const [representedCompanies, setRepresentedCompanies] = useState<RepresentedCompany[]>(() => {
    if (typeof window === 'undefined') return [];
    const currentSession = sessionStorage.getItem('melo_supplier_session');
    if (!currentSession) return [];

    try {
      const currentSupplier = JSON.parse(currentSession) as SupplierSession;
      const saved = localStorage.getItem(`represented_full_companies_${currentSupplier.id}`);
      if (saved) {
        const parsed = JSON.parse(saved) as RepresentedCompany[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [activeCompany, setActiveCompany] = useState<RepresentedCompany>(() => {
    if (representedCompanies.length > 0) return representedCompanies[0];
    return {
      id: 'default-empty',
      tradeName: 'SELECIONE UMA MARCA',
      corporateName: '',
      cnpj: '',
      email: '',
      phone: ''
    };
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Carrega dados garantindo resolução por ID e E-mail
  const loadPortalData = useCallback(async (supplierId: string, supplierEmail: string) => {
    setLoading(true);
    try {
      const [cotRes, connRes] = await Promise.all([
        fetch(`/api/portal/quotations?supplierId=${supplierId}`),
        fetch(`/api/portal/connections?supplierId=${supplierId}&supplierEmail=${encodeURIComponent(supplierEmail)}`)
      ]);

      if (cotRes.ok) setQuotations(await cotRes.json());
      if (connRes.ok) setConnections(await connRes.json());
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (supplier?.id && supplier?.email) {
      queueMicrotask(() => {
        void loadPortalData(supplier.id, supplier.email);
      });
    }
  }, [supplier?.id, supplier?.email, loadPortalData]);

  if (!mounted || !supplier) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs font-bold text-slate-500">
        A carregar portal comercial...
      </div>
    );
  }

  const handleUpdateConnection = async (connectionId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/portal/connections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, status })
      });
      if (!res.ok) throw new Error();
      showToast(status === 'ACCEPTED' ? 'Parceria aceita com sucesso!' : 'Convite recusado.');
      await loadPortalData(supplier.id, supplier.email);
    } catch {
      showToast('Erro ao processar convite.');
    }
  };

  const handleAddCompany = (newCompData: Omit<RepresentedCompany, 'id'>) => {
    const newComp: RepresentedCompany = { id: crypto.randomUUID(), ...newCompData };
    const updated = [...representedCompanies, newComp];
    setRepresentedCompanies(updated);
    localStorage.setItem(`represented_full_companies_${supplier.id}`, JSON.stringify(updated));
    setActiveCompany(newComp);
    showToast(`Distribuidora "${newComp.tradeName}" adicionada e ativada!`);
  };

  const handleRemoveCompany = (id: string) => {
    if (representedCompanies.length <= 1) {
      showToast('⚠️ Deve manter pelo menos uma distribuidora no portfólio.');
      return;
    }
    const updated = representedCompanies.filter(c => c.id !== id);
    setRepresentedCompanies(updated);
    localStorage.setItem(`represented_full_companies_${supplier.id}`, JSON.stringify(updated));
    if (activeCompany?.id === id) {
      setActiveCompany(updated[0]);
    }
    showToast('Distribuidora removida.');
  };

  const handleSaveProfile = (name: string, phone: string) => {
    const updatedSession = { ...supplier, name, phone };
    sessionStorage.setItem('melo_supplier_session', JSON.stringify(updatedSession));
    showToast('Perfil atualizado com sucesso!');
    window.location.reload();
  };

  const handleLogout = () => {
    sessionStorage.removeItem('melo_supplier_session');
    router.push('/portal/login');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <SupplierHeader
        title="Painel do Representante B2B"
        representativeName={supplier.name}
        representativeEmail={supplier.email}
        activeBrand={activeCompany?.tradeName || (representedCompanies[0]?.tradeName ?? 'SELECIONE UMA MARCA')}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-6 sm:px-12 -mt-4 pb-20 relative z-20 space-y-6">
        
        {/* Bloco de Código Comercial Visível (Ideal para WhatsApp, Telefone ou Presencial) */}
        <div className={`p-5 rounded-[2rem] border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl ${
          isDarkMode ? 'bg-slate-900/90 border-indigo-500/30' : 'bg-white/95 border-indigo-200'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">ID / Código Comercial B2B</span>
            <p className="text-xs font-mono font-bold text-slate-900 dark:text-white select-all">{supplier.id}</p>
            <p className="text-[11px] text-slate-500">Informe este código ou seu e-mail ({supplier.email}) ao lojista para conexões manuais.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(supplier.id);
              showToast('ID comercial copiado para a área de transferência!');
            }}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider transition shadow-md shadow-indigo-600/30 cursor-pointer active:scale-95 shrink-0"
          >
            📋 Copiar ID Comercial
          </button>
        </div>

        <ProfileSettingsCard
          isDarkMode={isDarkMode}
          representativeName={supplier.name}
          representativeEmail={supplier.email}
          representativePhone={supplier.phone}
          onSaveProfile={handleSaveProfile}
        />

        <BrandPortfolioSection
          isDarkMode={isDarkMode}
          representedCompanies={representedCompanies}
          activeCompany={activeCompany}
          onSelectCompany={setActiveCompany}
          onAddCompany={handleAddCompany}
          onRemoveCompany={handleRemoveCompany}
        />

        <ConnectionRequests
          isDarkMode={isDarkMode}
          supplierId={supplier.id}
          connections={connections}
          onUpdateConnection={handleUpdateConnection}
          onRefreshConnections={() => loadPortalData(supplier.id, supplier.email)}
        />

        <QuotationsList
          isDarkMode={isDarkMode}
          quotations={quotations}
          loading={loading}
          activeBrandName={activeCompany?.tradeName || 'GERAL'}
        />
      </main>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 px-6 py-4 bg-emerald-600 text-white rounded-2xl shadow-2xl text-xs font-bold z-50 animate-in slide-in-from-bottom-5">
          {toastMessage}
        </div>
      )}
    </div>
  );
}