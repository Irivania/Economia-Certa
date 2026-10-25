'use client';

import { FormEvent } from 'react';
import QuotationBasicInfo from '@/components/QuotationBasicInfo';
import QuotationItemsTable from '@/components/QuotationItemsTable';
import QuotationSuggestionBar from '@/components/QuotationSuggestionBar';
import { ProductImportModal } from '@/components/ProductImportModal';
import { CreateQuotationHeader } from '@/features/quotations/components/CreateQuotationHeader';
import { QuantityVisibilitySection } from '@/features/quotations/components/QuantityVisibilitySection';
import { SuppliersSelectionCard } from '@/features/quotations/components/SuppliersSelectionCard';
import { QuotationFormActions } from '@/features/quotations/components/QuotationFormActions';
import { QuotationErrorAlert } from '@/features/quotations/components/QuotationErrorAlert';
import { QuotationCreationDomain } from '../hooks/useQuotationCreation';

interface CreateQuotationFormProps {
  domain: QuotationCreationDomain;
  isDarkMode: boolean;
}

export function CreateQuotationForm({ domain, isDarkMode }: CreateQuotationFormProps) {
  const { catalog, quotationSuppliers, quotationItems, quotationForm, submitting, error, handleQuickRegisterProduct, submit } = domain;

  const handleSubmitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit();
  };

  return (
    <div className={`rounded-xl border p-6 sm:p-7 shadow-sm transition-all space-y-6 ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900'
    }`}>
      <CreateQuotationHeader onOpenModal={() => {}} />

      <form onSubmit={handleSubmitForm} className="space-y-6">
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
          products={catalog.catalogProducts as Parameters<typeof ProductImportModal>[0]['products']} 
          onQuickRegister={handleQuickRegisterProduct} 
          onImportComplete={quotationItems.handleImportComplete}
        />

        <QuotationSuggestionBar
          itemsCount={quotationItems.quotationItems.length}
          onApplySuggestion={quotationItems.handleApplyStockSuggestion}
        />

        <QuotationItemsTable
          items={quotationItems.quotationItems}
          searchTerm={quotationItems.searchTerm}
          setSearchTerm={quotationItems.setSearchTerm}
          onUpdateQuantity={quotationItems.handleUpdateQuantity}
          onRemoveItem={quotationItems.handleRemoveItem}
        />

        <QuantityVisibilitySection
          showQuantities={quotationForm.showQuantities}
          setShowQuantities={quotationForm.setShowQuantities}
          isDarkMode={isDarkMode}
        />

        <SuppliersSelectionCard
          suppliers={quotationSuppliers.suppliers}
          selectedSupplierIds={quotationSuppliers.selectedSupplierIds}
          toggleSupplier={quotationSuppliers.toggleSupplier}
          handleSelectAllSuppliers={quotationSuppliers.handleSelectAllSuppliers}
          handleDeselectAllSuppliers={quotationSuppliers.handleDeselectAllSuppliers}
          loadingSuppliers={quotationSuppliers.loadingSuppliers}
          isDarkMode={isDarkMode}
        />

        <QuotationErrorAlert error={error} />

        <QuotationFormActions
          submitting={submitting}
          loadingSuppliers={quotationSuppliers.loadingSuppliers}
          suppliersLength={quotationSuppliers.suppliers.length}
        />
      </form>
    </div>
  );
}