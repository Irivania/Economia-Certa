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
import { ConnectedStoresList } from '@/components/portal/ConnectedStoresList';
import { QuotationsList, QuotationSupplierResult } from '@/components/portal/QuotationsList';
import { PurchaseOrdersPanel, PortalPurchaseOrder } from '@/components/portal/PurchaseOrdersPanel';

interface SupplierSession {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export interface RepresentedCompany {
  id: string;
  supplierId?: string;
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
  const [representedCompanies, setRepresentedCompanies] = useState<RepresentedCompany[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PortalPurchaseOrder[]>([]);

  // Estado para rastrear qual loja específica está selecionada para gestão de cotações
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<{ companyId: string; storeName: string } | null>(null);

  const [activeCompany, setActiveCompany] = useState<RepresentedCompany>({
    id: 'default-empty',
    tradeName: 'SELECIONE UMA MARCA',
    corporateName: '',
    cnpj: '',
    email: '',
    phone: ''
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const loadPortalData = useCallback(async (supplierId: string, supplierEmail: string) => {
    setLoading(true);
    try {
      const [cotRes, connRes, brandsRes, ordersRes] = await Promise.all([
        fetch(`/api/portal/quotations?supplierId=${supplierId}`),
        fetch(`/api/portal/connections?supplierId=${supplierId}&supplierEmail=${encodeURIComponent(supplierEmail)}`),
        fetch(`/api/portal/brands?supplierId=${supplierId}`),
        fetch(`/api/portal/orders?supplierId=${supplierId}`),
      ]);

      if (cotRes.ok) setQuotations(await cotRes.json());
      if (connRes.ok) setConnections(await connRes.json());
      
      let brandsData: RepresentedCompany[] = [];
      if (brandsRes.ok) {
        brandsData = await brandsRes.json();
      }

      setRepresentedCompanies(brandsData);

      const representedSupplierIds = Array.from(new Set([
        supplierId,
        ...brandsData
          .map((brand) => brand.supplierId)
          .filter((id): id is string => Boolean(id)),
      ]));

      const orderResponses = await Promise.all(
        representedSupplierIds.map((representedSupplierId) =>
          representedSupplierId === supplierId && ordersRes.ok
            ? ordersRes.json() as Promise<PortalPurchaseOrder[]>
            : fetch(`/api/portal/orders?supplierId=${representedSupplierId}`)
                .then((response) => response.ok ? response.json() as Promise<PortalPurchaseOrder[]> : []),
        ),
      );

      const uniqueOrders = new Map<string, PortalPurchaseOrder>();
      orderResponses.flat().forEach((order) => uniqueOrders.set(order.id, order));
      setPurchaseOrders(Array.from(uniqueOrders.values()));
      
      setActiveCompany((prev) => {
        if (brandsData.length > 0 && (!prev || prev.id === 'default-empty')) {
          return brandsData[0];
        }
        const found = brandsData.find(b => b.id === prev?.id);
        return found || brandsData[0] || {
          id: 'default-empty',
          tradeName: 'SELECIONE UMA MARCA',
          corporateName: '',
          cnpj: '',
          email: '',
          phone: ''
        };
      });

    } catch (err) {
      console.error('Erro ao carregar dados do portal:', err);
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

  const handleSelectCompany = (company: RepresentedCompany) => {
    setActiveCompany(company);
    setSelectedStoreFilter(null);
  };

  if (!mounted || !supplier) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs font-bold text-slate-500 bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>A carregar painel...</span>
        </div>
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

  const handleAddCompany = async (newCompData: Omit<RepresentedCompany, 'id'>) => {
    try {
      const res = await fetch('/api/portal/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: supplier.id,
          ...newCompData
        })
      });

      if (!res.ok) throw new Error('Erro ao criar marca');
      
      const createdBrand = (await res.json()) as RepresentedCompany;
      const updated = [...representedCompanies, createdBrand];
      
      setRepresentedCompanies(updated);
      setActiveCompany(createdBrand);
      showToast(`Distribuidora "${createdBrand.tradeName}" adicionada com sucesso!`);
    } catch (err) {
      console.error(err);
      showToast('Erro ao adicionar distribuidora.');
    }
  };

  const handleUpdateCompany = async (updatedComp: RepresentedCompany) => {
    const updated = representedCompanies.map((c) => (c.id === updatedComp.id ? updatedComp : c));
    setRepresentedCompanies(updated);
    if (activeCompany?.id === updatedComp.id) {
      setActiveCompany(updatedComp);
    }
    showToast(`Distribuidora "${updatedComp.tradeName}" atualizada com sucesso!`);
  };

  const handleRemoveCompany = async (id: string) => {
    if (representedCompanies.length <= 1) {
      showToast('⚠️ Deve manter pelo menos uma distribuidora no portfólio.');
      return;
    }
    try {
      const res = await fetch(`/api/portal/brands?id=${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Erro ao remover marca');

      const updated = representedCompanies.filter(c => c.id !== id);
      setRepresentedCompanies(updated);
      if (activeCompany?.id === id) {
        setActiveCompany(updated[0]);
      }
      showToast('Distribuidora removida com sucesso.');
    } catch (err) {
      console.error(err);
      showToast('Erro ao remover distribuidora.');
    }
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

  const handleOrderStatusChange = async (
    orderId: string,
    quotationId: string,
    status: 'DISPATCHED',
  ) => {
    const response = await fetch(`/api/quotations/${quotationId}/finalize`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status, actorRole: 'REPRESENTATIVE' }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) {
      showToast(result.error || 'Não foi possível atualizar o pedido.');
      return;
    }
    setPurchaseOrders((current) => current.map((order) => (
      order.id === orderId ? { ...order, status } : order
    )));
    showToast('Pedido encaminhado para a empresa e registrado no histórico.');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <SupplierHeader
        title="Painel do Representante B2B"
        representativeName={supplier.name}
        representativeEmail={supplier.email}
        // Exibe estritamente o nome da distribuidora ativa selecionada no contexto
        activeBrand={activeCompany?.tradeName || representedCompanies[0]?.tradeName || 'GERAL'}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-6 sm:px-12 -mt-4 pb-20 relative z-20 space-y-6">
        
        {/* Bloco do ID Comercial */}
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

        {/* Configurações de Perfil */}
        <ProfileSettingsCard
          isDarkMode={isDarkMode}
          representativeName={supplier.name}
          representativeEmail={supplier.email}
          representativePhone={supplier.phone}
          onSaveProfile={handleSaveProfile}
        />

        {/* Portfólio de Marcas */}
        <BrandPortfolioSection
          isDarkMode={isDarkMode}
          representedCompanies={representedCompanies}
          activeCompany={activeCompany}
          onSelectCompany={handleSelectCompany}
          onAddCompany={handleAddCompany}
          onUpdateCompany={handleUpdateCompany}
          onRemoveCompany={handleRemoveCompany}
        />

        {/* Pedidos de Conexão */}
        <ConnectionRequests
          isDarkMode={isDarkMode}
          supplierId={supplier.id}
          connections={connections}
          onUpdateConnection={handleUpdateConnection}
          onRefreshConnections={() => loadPortalData(supplier.id, supplier.email)}
        />

        {/* Lojas Conectadas */}
        <ConnectedStoresList
          isDarkMode={isDarkMode}
          supplierId={supplier.id}
          supplierEmail={supplier.email}
          activeBrandId={activeCompany.id}
          activeBrandName={activeCompany.tradeName}
          onSelectStoreForQuotations={(companyId, storeName) => {
            setSelectedStoreFilter({ companyId, storeName });
            showToast(`A focar cotações da loja: ${storeName}`);
          }}
        />

        {/* Banner de Filtro Ativo por Loja */}
        {selectedStoreFilter && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isDarkMode ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span>🎯 A gerir cotações filtradas para a loja:</span>
              <span className="underline font-black">{selectedStoreFilter.storeName}</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedStoreFilter(null)}
              className="text-[10px] font-mono font-bold px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
            >
              ✕ Ver todas da marca
            </button>
          </div>
        )}

        {/* Lista de Cotações com Produtos Detalhados */}
        <QuotationsList
          isDarkMode={isDarkMode}
          quotations={quotations.filter((cot: QuotationSupplierResult & { supplierId?: string; supplierName?: string | null; companyId?: string; brandId?: string; brandName?: string; tradeName?: string; storeName?: string }) => {
            if (!activeCompany || activeCompany.id === 'default-empty') return true;

            const supplierName = String(cot.supplierName || '').toUpperCase();
            const matchesCompany =
              cot.supplierId === activeCompany.supplierId ||
              (Boolean(supplierName) &&
                (supplierName.includes(activeCompany.tradeName.toUpperCase()) ||
                  supplierName.includes(activeCompany.corporateName.toUpperCase())));

            if (!matchesCompany) return false;
            if (!selectedStoreFilter) return true;

            const matchesId = cot.companyId === selectedStoreFilter.companyId;
            const matchesStoreName = cot.storeName && selectedStoreFilter.storeName &&
              cot.storeName.toLowerCase().includes(selectedStoreFilter.storeName.toLowerCase());
            return matchesId || Boolean(matchesStoreName);
          })}
          loading={loading}
          activeBrandName={selectedStoreFilter ? `${activeCompany?.tradeName} (${selectedStoreFilter.storeName})` : (activeCompany?.tradeName || 'GERAL')}
        />

        <PurchaseOrdersPanel
          isDarkMode={isDarkMode}
          onOrderStatusChange={handleOrderStatusChange}
          orders={purchaseOrders.filter((order) => (
            activeCompany?.supplierId
              ? order.supplierId === activeCompany.supplierId
              : false
          ))}
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