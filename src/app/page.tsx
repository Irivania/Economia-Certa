'use client';

import { useState, useSyncExternalStore, useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { ToastContainer } from '@/components/ToastContainer';
import { CommandMenu } from '@/components/CommandMenu';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { CashFlowWidget } from '@/components/dashboard/CashFlowWidget';
import { DashboardQuickAccess } from '@/components/dashboard/DashboardQuickAccess';
import { RoleSelectionModal } from '@/components/dashboard/RoleSelectionModal';
import { getCompanyId } from '@/lib/companySession';

import { useUserSession } from '@/features/dashboard/hooks/useUserSession';
import { useDashboardMetrics } from '@/features/dashboard/hooks/useDashboardMetrics';
import { useDashboardShortcuts } from '@/features/dashboard/hooks/useDashboardShortcuts';
import { useToast } from '@/features/dashboard/hooks/useToast';
import { DashboardBanner } from '@/features/dashboard/components/DashboardBanner';
import { LowStockAlert } from '@/features/dashboard/components/LowStockAlert';
import { PERMISSIONS, ADMIN_ROLE } from '@/features/dashboard/constants/roles';
import { UserRole } from '@/features/dashboard/types/user.types';

const subscribeToHydration = () => () => {};

export default function DashboardPage() {
  const { isDarkMode } = useTheme();
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const companyId = getCompanyId();

  const { toasts, addToast } = useToast();
  const { userName, userRole, isPermissionModalOpen, setIsPermissionModalOpen, handleLogout, handleRoleChange } = useUserSession();
  const metrics = useDashboardMetrics(companyId);

  const handleCloseModals = useCallback(() => {
    setIsCmdOpen(false);
    setIsPermissionModalOpen(false);
  }, [setIsPermissionModalOpen]);

  const handleToggleCmd = useCallback(() => {
    setIsCmdOpen((prev) => !prev);
  }, []);

  useDashboardShortcuts({
    onToggleCmd: handleToggleCmd,
    onCloseModals: handleCloseModals,
  });

  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50" aria-hidden="true" />;
  }

  const canManageSuppliers = PERMISSIONS.CAN_MANAGE_SUPPLIERS.includes(userRole);
  const canImportData = PERMISSIONS.CAN_IMPORT_DATA.includes(userRole);

  const handleTestToast = () => {
    addToast('Ação Simulada', 'Link de cotação copiado para o WhatsApp com sucesso!', 'success');
  };

  const onRoleChangeAction = (newRole: UserRole) => {
    handleRoleChange(newRole, addToast);
    if (newRole === userRole && userRole === ADMIN_ROLE) {
      addToast('Nível Alterado', `Permissão atualizada para: ${newRole.toUpperCase()}`, 'info');
    }
  };

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
        onOpenPermissionModal={() => {
          if (userRole === ADMIN_ROLE) {
            setIsPermissionModalOpen(true);
          } else {
            addToast('Acesso Restrito', 'Apenas administradores podem alterar o nível de permissão.', 'warning');
          }
        }}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-20 relative z-25 space-y-6">
        <DashboardBanner
          isDarkMode={isDarkMode}
          onTestToast={handleTestToast}
          onOpenCmd={() => setIsCmdOpen(true)}
        />

        <LowStockAlert
          lowStockProducts={metrics.lowStockProducts}
          isDarkMode={isDarkMode}
        />

        <DashboardMetrics
          productCount={metrics.productCount}
          quotationCount={metrics.quotationCount}
          completedQuotationCount={metrics.completedQuotationCount}
          loading={metrics.loading}
          isDarkMode={isDarkMode}
        />

        <CashFlowWidget isDarkMode={isDarkMode} />

        <DashboardQuickAccess
          canManageSuppliers={canManageSuppliers}
          canImportData={canImportData}
          latestQuotationId={metrics.latestQuotationId}
          isDarkMode={isDarkMode}
        />
      </main>

      {userRole === ADMIN_ROLE && (
        <RoleSelectionModal
          isOpen={isPermissionModalOpen}
          onClose={() => setIsPermissionModalOpen(false)}
          userRole={userRole}
          onRoleChange={onRoleChangeAction}
        />
      )}

      <ToastContainer toasts={toasts} isDarkMode={isDarkMode} />
      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId={metrics.latestQuotationId} />
    </div>
  );
}