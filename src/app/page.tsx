'use client';

import { useEffect, useState, useSyncExternalStore, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { ToastContainer } from '@/components/ToastContainer';
import { CommandMenu } from '@/components/CommandMenu';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { DashboardQuickAccess } from '@/components/dashboard/DashboardQuickAccess';
import { RoleSelectionModal } from '@/components/dashboard/RoleSelectionModal';

const subscribeToHydration = () => () => {};

interface Product {
  id: string;
  description: string;
  internalCode?: string;
  stockCurrent?: number;
  stockMin?: number;
}

interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'warning';
}

type UserRole = 'admin' | 'gerente' | 'supervisor' | 'geral';

export default function DashboardPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [productCount, setProductCount] = useState(0);
  const [quotationCount, setQuotationCount] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const [userRole, setUserRole] = useState<UserRole>(() => {
    if (typeof window === 'undefined') return 'admin';
    try {
      const sessionData = sessionStorage.getItem('melo_company_session');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        return parsed.role || 'admin';
      }
    } catch (e) {
      console.error(e);
    }
    return 'admin';
  });

  const [userName] = useState<string>(() => {
    if (typeof window === 'undefined') return 'Melo Perfumaria';
    try {
      const sessionData = sessionStorage.getItem('melo_company_session');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        return parsed.name || 'Melo Perfumaria';
      }
    } catch (e) {
      console.error(e);
    }
    return 'Melo Perfumaria';
  });

  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';
  const latestQuotationId = 'd7f46ae7-19c2-409d-8ab4-dfbb458c5248';

  const handleLogout = () => {
    sessionStorage.removeItem('melo_company_session');
    router.push('/login');
  };

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    try {
      const sessionData = sessionStorage.getItem('melo_company_session');
      const parsed = sessionData ? JSON.parse(sessionData) : {};
      parsed.role = newRole;
      sessionStorage.setItem('melo_company_session', JSON.stringify(parsed));
    } catch (e) {
      console.error(e);
    }
    addToast('Nível Alterado', `Permissão atualizada para: ${newRole.toUpperCase()}`, 'info');
    setIsPermissionModalOpen(false);
  };

  const addToast = (title: string, description: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      setIsCmdOpen((open) => !open);
    }
    if (e.key === 'Escape') {
      setIsCmdOpen(false);
      setIsPermissionModalOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        const [pRes, qRes] = await Promise.all([
          fetch(`/api/products?companyId=${companyId}`),
          fetch(`/api/quotations?companyId=${companyId}`),
        ]);

        if (pRes.ok) {
          const products: Product[] = await pRes.json();
          setProductCount(Array.isArray(products) ? products.length : 0);

          const criticalItems = products.filter(
            (p) => (p.stockCurrent ?? 0) <= (p.stockMin ?? 0) && (p.stockMin ?? 0) > 0
          );
          setLowStockProducts(criticalItems);
        }

        if (qRes.ok) {
          const quotations = await qRes.json();
          setQuotationCount(Array.isArray(quotations) ? quotations.length : 0);
        }
      } catch (err) {
        console.error('Erro ao carregar métricas do dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, [companyId]);

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  const canManageSuppliers = ['admin', 'gerente'].includes(userRole);
  const canImportData = ['admin', 'gerente', 'supervisor'].includes(userRole);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <AppHeader
        title="Economia Certa"
        subtitle="Painel gerencial inteligente e controle de compras em tempo real."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      <DashboardHeader
        userName={userName}
        userRole={userRole}
        onOpenPermissionModal={() => setIsPermissionModalOpen(true)}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
      />

      <main className="max-w-7xl mx-auto px-6 sm:px-12 mt-8 pb-20 relative z-20 space-y-8">
        
        <div className={`p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
          <div className="flex items-center gap-2 text-xs">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold">💡 Dica Pro:</span>
            <span>Pressione <kbd className="px-2 py-0.5 rounded bg-slate-500/20 font-mono text-[11px] font-bold">Ctrl + K</kbd> para abrir a busca rápida.</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => addToast('Ação Simulada', 'Link de cotação copiado para o WhatsApp com sucesso!', 'success')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-bold transition-colors border border-emerald-500/25"
            >
              Testar Toast WhatsApp 📲
            </button>
            <button 
              onClick={() => setIsCmdOpen(true)}
              className="text-xs font-bold text-indigo-500 hover:underline px-2"
            >
              Abrir Menu &rarr;
            </button>
          </div>
        </div>

        {!loading && lowStockProducts.length > 0 && (
          <div className={`${isDarkMode ? 'bg-rose-950/40 border-rose-900 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'} border backdrop-blur-md rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all`}>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-500/20 rounded-xl text-rose-600 mt-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold">Alerta de Reposição Urgente ({lowStockProducts.length} itens críticos)</h3>
                <p className="text-xs opacity-80 mt-0.5">Existem produtos abaixo do estoque mínimo estabelecido. Recomendamos iniciar uma cotação imediata.</p>
              </div>
            </div>
            <Link
              href="/produtos"
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-rose-600/25 whitespace-nowrap"
            >
              Ver Produtos &rarr;
            </Link>
          </div>
        )}

        <DashboardMetrics
          productCount={productCount}
          quotationCount={quotationCount}
          loading={loading}
          canImportData={canImportData}
          isDarkMode={isDarkMode}
        />

        <DashboardQuickAccess
          canManageSuppliers={canManageSuppliers}
          canImportData={canImportData}
          latestQuotationId={latestQuotationId}
          isDarkMode={isDarkMode}
        />

      </main>

      <RoleSelectionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        userRole={userRole}
        onRoleChange={handleRoleChange}
      />

      <ToastContainer toasts={toasts} isDarkMode={isDarkMode} />
      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId={latestQuotationId} />

    </div>
  );
}