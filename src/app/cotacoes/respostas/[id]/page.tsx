'use client';

import React, { use, Suspense } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';

import { useQuotationComparison } from '@/features/quotations/hooks/useQuotationComparison';
import { useSupplierSelection } from '@/features/quotations/hooks/useSupplierSelection';
import { useQuotationFinalization } from '@/features/quotations/hooks/useQuotationFinalization';
import { useQuotationExport } from '@/features/quotations/hooks/useQuotationExport';
import { useQuotationShortcuts } from '@/features/quotations/hooks/useQuotationShortcuts';

import { ComparisonLoadingState } from '@/features/quotations/components/comparison/ComparisonLoadingState';
import { ComparisonErrorState } from '@/features/quotations/components/comparison/ComparisonErrorState';
import { ComparisonHeader } from '@/features/quotations/components/comparison/ComparisonHeader';
import { ComparisonTable } from '@/features/quotations/components/comparison/ComparisonTable';
import { ComparisonSummary } from '@/features/quotations/components/comparison/ComparisonSummary';
import { ComparisonPendingAlert } from '@/features/quotations/components/comparison/ComparisonPendingAlert';

import { getPendingProducts } from '@/features/quotations/selectors/pending-products.selector';
import { getSelectedBySupplier } from '@/features/quotations/selectors/selected-by-supplier.selector';
import { getUnrequestedSummary } from '@/features/quotations/selectors/unrequested-products.selector';
import { calculateSummaryTotal } from '@/features/quotations/calculators/quotation-summary.calculator';

import { formatCurrency } from '@/features/quotations/utils/currency.utils';
import { formatDate } from '@/features/quotations/utils/date.utils';

function QuotationResponsesContent({ id }: { id: string }) {
  const { isDarkMode } = useTheme();
  const { isCmdOpen, setIsCmdOpen } = useQuotationShortcuts();

  const {
    quotation,
    productsList,
    suppliers,
    loading,
    error,
    selectedChoices,
    setSelectedChoices,
    ignoredProducts,
    setIgnoredProducts,
  } = useQuotationComparison(id);

  const {
    handleSmartQuote,
    handleSelectChoice,
    handleToggleIgnoredProduct,
    handleSelectAllForSupplier,
  } = useSupplierSelection({
    productsList,
    suppliers,
    setSelectedChoices,
    ignoredProducts,
    setIgnoredProducts,
  });

  const { saving, handleFinalizeQuotation } = useQuotationFinalization({
    quotationId: id,
    quotation,
    productsList,
    selectedChoices,
    ignoredProducts,
  });

  const { handleExportSelection } = useQuotationExport({
    productsList,
    suppliers,
    selectedChoices,
    ignoredProducts,
    quotationTitle: quotation?.title || 'Cotação',
  });

  if (loading) {
    return <ComparisonLoadingState isDarkMode={isDarkMode} />;
  }

  if (error || !quotation) {
    return <ComparisonErrorState error={error} isDarkMode={isDarkMode} />;
  }

  const pendingProducts = getPendingProducts(productsList, suppliers, selectedChoices, ignoredProducts);
  const selectedBySupplier = getSelectedBySupplier(productsList, suppliers, selectedChoices);
  const unrequestedSummary = getUnrequestedSummary(productsList, suppliers, selectedChoices, ignoredProducts);
  const summaryTotal = calculateSummaryTotal(selectedBySupplier);

  return (
    <div className={`min-h-screen transition-colors duration-300 pb-20 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Cabeçalho isolado sem sobreposição */}
      <div className="pb-8">
        <AppHeader
          title="Economia Certa"
          subtitle="Painel gerencial inteligente e controle de compras em tempo real."
          onOpenCmd={() => setIsCmdOpen(true)}
        />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10" role="main">
        <ComparisonHeader
          title={quotation.title}
          startDate={quotation.startDate}
          endDate={quotation.endDate}
          saving={saving}
          onSmartQuote={handleSmartQuote}
          onExportSelection={handleExportSelection}
          onFinalize={handleFinalizeQuotation}
        />

        <ComparisonTable
          productsList={productsList}
          suppliers={suppliers}
          paymentTerms={quotation.paymentTerms}
          selectedChoices={selectedChoices}
          ignoredProducts={ignoredProducts}
          onToggleIgnoredProduct={handleToggleIgnoredProduct}
          onSelectChoice={handleSelectChoice}
          onSelectAllForSupplier={handleSelectAllForSupplier}
          formatCurrency={formatCurrency}
        />

        <ComparisonSummary
          isDarkMode={isDarkMode}
          totalItemsCount={productsList.length}
          unrequestedCount={unrequestedSummary.length}
          summaryTotal={summaryTotal}
          selectedBySupplier={selectedBySupplier}
          unrequestedSummary={unrequestedSummary}
          startDate={quotation.startDate}
          endDate={quotation.endDate}
          paymentTerms={quotation.paymentTerms}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />

        <ComparisonPendingAlert isDarkMode={isDarkMode} pendingCount={pendingProducts.length} />
      </main>

      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId={id} />
    </div>
  );
}

export default function QuotationResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const quotationId = resolvedParams?.id;

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-500">A carregar mapa comparativo...</div>}>
      <QuotationResponsesContent id={quotationId} />
    </Suspense>
  );
}