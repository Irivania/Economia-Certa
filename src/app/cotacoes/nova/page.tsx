'use client';

import { FormEvent, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import QuotationBasicInfo from '@/components/QuotationBasicInfo';
import QuotationItemsTable from '@/components/QuotationItemsTable';
import QuotationSuggestionBar from '@/components/QuotationSuggestionBar';
import { ProductImportModal } from '@/components/ProductImportModal';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';
import { getCompanyId } from '@/lib/companySession';

import { useCatalogProducts } from '@/features/quotations/hooks/useCatalogProducts';
import { useQuotationSuppliers } from '@/features/quotations/hooks/useQuotationSuppliers';
import { useQuotationItems } from '@/features/quotations/hooks/useQuotationItems';
import { useCreateQuotation } from '@/features/quotations/hooks/useCreateQuotation';
import { useQuotationShortcuts } from '@/features/quotations/hooks/useQuotationShortcuts';

import { CreateQuotationHeader } from '@/features/quotations/components/CreateQuotationHeader';
import { QuantityVisibilitySection } from '@/features/quotations/components/QuantityVisibilitySection';
import { SuppliersSelectionCard } from '@/features/quotations/components/SuppliersSelectionCard';
import { QuotationFormActions } from '@/features/quotations/components/QuotationFormActions';
import { QuotationErrorAlert } from '@/features/quotations/components/QuotationErrorAlert';

const companyId = getCompanyId();

export default function CreateQuotationPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const catalog = useCatalogProducts();
  const suppliersDomain = useQuotationSuppliers();
  const itemsDomain = useQuotationItems();
  const quotationForm = useCreateQuotation();

  useQuotationShortcuts({
    onToggleCmd: () => setIsCmdOpen((prev) => !prev),
    onCloseModals: () => setIsCmdOpen(false),
  });

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await quotationForm.submitQuotation(
      companyId,
      suppliersDomain.selectedSupplierIds,
      itemsDomain.quotationItems,
      () => {
        router.push('/cotacoes');
      }
    );
  }, [quotationForm, suppliersDomain.selectedSupplierIds, itemsDomain.quotationItems, router]);

  return (
    <div className={`min-h-screen transition-colors duration-300 pb-24 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Cabeçalho verde com espaçamento interno adequado */}
      <div className="pb-12">
        <AppHeader
          title="Economia Certa"
          subtitle="Painel gerencial inteligente e controle de compras em tempo real."
          onOpenCmd={() => setIsCmdOpen(true)}
        />
      </div>

      {/* Container principal com margem superior ajustada para evitar sobreposição */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-6">
        
        <div className={`rounded-xl border p-6 sm:p-7 shadow-sm transition-all space-y-6 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900'
        }`}>
          
          <CreateQuotationHeader onOpenModal={() => {}} />

          <form onSubmit={handleSubmit} className="space-y-6">
            <QuotationBasicInfo
              title={quotationForm.title}
              setTitle={quotationForm.setTitle}
              startDate={quotationForm.startDate}
              setStartDate={quotationForm.setStartDate}
              endDate={quotationForm.endDate}
              setEndDate={quotationForm.setEndDate}
              closingTime={quotationForm.closingTime}
              setClosingTime={quotationForm.setClosingTime}
              paymentTerms={quotationForm.paymentTerms}
              setPaymentTerms={quotationForm.setPaymentTerms}
            />

            <ProductImportModal 
              products={catalog.catalogProducts as unknown as Parameters<typeof ProductImportModal>[0]['products']} 
              onQuickRegister={async (itemPendente) => {
                await catalog.quickRegisterProduct({
                  companyId,
                  description: itemPendente.descricaoPadronizada,
                  code: itemPendente.ean || null,
                  salePrice: Number(itemPendente.precoVenda) || 34.99,
                  stockIdeal: 10,
                  stockCurrent: 0,
                });
              }} 
              onImportComplete={itemsDomain.handleImportComplete}
            />

            <QuotationSuggestionBar
              itemsCount={itemsDomain.quotationItems.length}
              onApplySuggestion={itemsDomain.handleApplyStockSuggestion}
            />

            <QuotationItemsTable
              items={itemsDomain.quotationItems}
              searchTerm={itemsDomain.searchTerm}
              setSearchTerm={itemsDomain.setSearchTerm}
              onUpdateQuantity={itemsDomain.handleUpdateQuantity}
              onRemoveItem={itemsDomain.handleRemoveItem}
            />

            <QuantityVisibilitySection
              showQuantities={quotationForm.showQuantities}
              setShowQuantities={quotationForm.setShowQuantities}
              isDarkMode={isDarkMode}
            />

            <SuppliersSelectionCard
              suppliers={suppliersDomain.suppliers}
              selectedSupplierIds={suppliersDomain.selectedSupplierIds}
              toggleSupplier={suppliersDomain.toggleSupplier}
              handleSelectAllSuppliers={suppliersDomain.handleSelectAllSuppliers}
              handleDeselectAllSuppliers={suppliersDomain.handleDeselectAllSuppliers}
              loadingSuppliers={suppliersDomain.loadingSuppliers}
              isDarkMode={isDarkMode}
            />

            <QuotationErrorAlert error={quotationForm.error} />

            <QuotationFormActions
              submitting={quotationForm.submitting}
              loadingSuppliers={suppliersDomain.loadingSuppliers}
              suppliersLength={suppliersDomain.suppliers.length}
            />
          </form>
        </div>
      </main>

      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId="" />

    </div>
  );
}