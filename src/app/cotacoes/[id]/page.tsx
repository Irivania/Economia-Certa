'use client';

import { use, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';

import { useQuotationTracking } from '@/features/quotations/hooks/useQuotationTracking';
import { useQuotationPublication } from '@/features/quotations/hooks/useQuotationPublication';
import { useQuotationShortcuts } from '@/features/quotations/hooks/useQuotationShortcuts';

import { QuotationTrackingHeader } from '@/features/quotations/components/QuotationTrackingHeader';
import { QuotationTrackingTable } from '@/features/quotations/components/QuotationTrackingTable';
import { TrackingLoadingState } from '@/features/quotations/components/TrackingLoadingState';
import { TrackingErrorState } from '@/features/quotations/components/TrackingErrorState';

interface QuotationDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function QuotationDetailsPage({ params }: QuotationDetailsPageProps) {
  const { id } = use(params);
  const { isDarkMode } = useTheme();
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const { quotation, tracking, loading, error, updateSupplierStatusLocally } = useQuotationTracking(id);

  const { publishQuotation, sendingId } = useQuotationPublication(id, (supplierId) => {
    updateSupplierStatusLocally(supplierId, 'ENVIADO');
  });

  useQuotationShortcuts({
    onToggleCmd: () => setIsCmdOpen((prev) => !prev),
    onCloseModals: () => setIsCmdOpen(false),
  });

  if (loading) {
    return <TrackingLoadingState isDarkMode={isDarkMode} />;
  }

  if (error || !quotation) {
    return <TrackingErrorState message={error || 'Cotação não encontrada.'} isDarkMode={isDarkMode} />;
  }

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Economia Certa"
        subtitle="Painel gerencial inteligente e controle de compras em tempo real."
        onOpenCmd={() => setIsCmdOpen(true)}
      />
      {/* Ajustado de -mt-8 para pt-6 para remover a sobreposição com o cabeçalho verde */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 space-y-6">
        <QuotationTrackingHeader quotation={quotation} isDarkMode={isDarkMode} />
        <QuotationTrackingTable
          tracking={tracking}
          isDarkMode={isDarkMode}
          sendingId={sendingId}
          onSend={(supplierId) => void publishQuotation(supplierId)}
        />
      </main>
      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId={id} />
    </div>
  );
}