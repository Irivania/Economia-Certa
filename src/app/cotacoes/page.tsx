'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';

import { useQuotations } from '@/features/quotations/hooks/useQuotations';
import { useQuotationActions } from '@/features/quotations/hooks/useQuotationActions';
import { useQuotationShortcuts } from '@/features/quotations/hooks/useQuotationShortcuts';
import { QuotationsHeader } from '@/features/quotations/components/QuotationsHeader';
import { QuotationsTable } from '@/features/quotations/components/QuotationsTable';

export default function QuotationsPage() {
  const { isDarkMode } = useTheme();
  const [isCmdOpen, setIsCmdOpen] = useState<boolean>(false);

  const { quotations, loading, setQuotations } = useQuotations();
  const { handleDelete, handleCancel } = useQuotationActions({ setQuotations });

  const latestQuotationId = useMemo(() => quotations[0]?.id || '', [quotations]);

  const handleCloseModals = useCallback(() => {
    setIsCmdOpen(false);
  }, []);

  const handleToggleCmd = useCallback(() => {
    setIsCmdOpen((prev) => !prev);
  }, []);

  useQuotationShortcuts({
    onToggleCmd: handleToggleCmd,
    onCloseModals: handleCloseModals,
  });

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Economia Certa"
        subtitle="Painel gerencial inteligente e controle de compras em tempo real."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      {/* CONTEÚDO PRINCIPAL - Sem duplicação de botões */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-24 relative z-25 space-y-6">
        <div className={`rounded-xl border pt-8 px-6 sm:px-7 pb-32 shadow-xs transition-all space-y-5 ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white backdrop-blur-md' : 'bg-white border-slate-200/90 text-slate-900 backdrop-blur-md'
        }`}>
          <QuotationsHeader count={quotations.length} />

          <QuotationsTable
            quotations={quotations}
            loading={loading}
            isDarkMode={isDarkMode}
            onDelete={handleDelete}
            onCancel={handleCancel}
          />
        </div>
      </main>

      <CommandMenu 
        isOpen={isCmdOpen} 
        onClose={() => setIsCmdOpen(false)} 
        isDarkMode={isDarkMode} 
        latestQuotationId={latestQuotationId} 
      />
    </div>
  );
}