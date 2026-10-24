'use client';

import { use, useEffect, useState } from 'react';
import ProductSelectionModal from '@/components/ProductSelectionModal';
import QuotationBasicInfo from '@/components/QuotationBasicInfo';
import QuotationItemsSection from '@/components/QuotationItemsSection';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';

import { useEditQuotation } from '../../../../features/quotations/hooks/useEditQuotation';
import { useQuotationItems } from '@/features/quotations/hooks/useQuotationItems';
import { useQuotationSuppliers } from '@/features/quotations/hooks/useQuotationSuppliers';
import { useQuotationProducts } from '@/features/quotations/hooks/useQuotationProducts';
import { useQuotationShortcuts } from '@/features/quotations/hooks/useQuotationShortcuts';

import { EditQuotationHeader } from '@/features/quotations/components/EditQuotationHeader';
import { QuantityVisibilitySection } from '@/features/quotations/components/QuantityVisibilitySection';
import { SuppliersSelectionCard } from '@/features/quotations/components/SuppliersSelectionCard';
import { EditQuotationFormActions } from '@/features/quotations/components/EditQuotationFormActions';
import { EditQuotationLoadingState } from '@/features/quotations/components/EditQuotationLoadingState';
import { EditQuotationErrorState } from '@/features/quotations/components/EditQuotationErrorState';

interface EditQuotationPageProps {
  params: Promise<{ id: string }>;
}

export default function EditQuotationPage({ params }: EditQuotationPageProps) {
  const resolvedParams = use(params);
  const quotationId = resolvedParams.id;
  const { isDarkMode } = useTheme();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const {
    suppliers,
    selectedSupplierIds,
    loadingSuppliers,
    toggleSupplier,
    handleSelectAllSuppliers,
    handleDeselectAllSuppliers,
  } = useQuotationSuppliers();

  const { catalogProducts, loadingProducts } = useQuotationProducts();

  const {
    quotationItems,
    searchTerm,
    setSearchTerm,
    handleRemoveItem,
    handleUpdateQuantity,
    handleAddSelectedProducts,
  } = useQuotationItems();

  const {
    quotation,
    loading,
    error,
    handleUpdateField,
    handleSaveQuotation,
  } = useEditQuotation();

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Efeito para carregamento inicial se necessário
  }, [quotationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotation) return;
    try {
      setSubmitting(true);
      await handleSaveQuotation({
        id: quotationId,
        companyId: 'default-company',
        title: quotation.title || '',
        paymentTerms: quotation.paymentTerms || '',
        supplierIds: selectedSupplierIds,
        startDate: quotation.startDate || null,
        endDate: quotation.endDate || null,
        closingTime: quotation.closingTime || null,
        showQuantities: true,
        items: quotationItems,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  useQuotationShortcuts({
    onToggleCmd: () => setIsCmdOpen((prev) => !prev),
    onCloseModals: () => {
      setIsCmdOpen(false);
      setIsModalOpen(false);
    },
  });

  if (loading) {
    return <EditQuotationLoadingState isDarkMode={isDarkMode} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Economia Certa"
        subtitle="Painel gerencial inteligente e controle de compras em tempo real."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 space-y-6">
        <div className={`rounded-xl border p-6 sm:p-7 shadow-xs transition-all space-y-6 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900'
        }`}>
          <EditQuotationHeader />

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
            <QuotationBasicInfo
              title={quotation?.title || ''}
              setTitle={(val) => handleUpdateField('title', val)}
              startDate={quotation?.startDate || ''}
              setStartDate={(val) => handleUpdateField('startDate', val)}
              endDate={quotation?.endDate || ''}
              setEndDate={(val) => handleUpdateField('endDate', val)}
              closingTime={quotation?.closingTime || ''}
              setClosingTime={(val) => handleUpdateField('closingTime', val)}
              paymentTerms={quotation?.paymentTerms || ''}
              setPaymentTerms={(val) => handleUpdateField('paymentTerms', val)}
            />

            <QuotationItemsSection
              items={quotationItems}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdatePrice={() => {}}
              onRemoveItem={handleRemoveItem}
              onOpenModal={() => setIsModalOpen(true)}
            />

            <QuantityVisibilitySection
              showQuantities={true}
              setShowQuantities={() => {}}
              isDarkMode={isDarkMode}
            />

            <SuppliersSelectionCard
              suppliers={suppliers}
              selectedSupplierIds={selectedSupplierIds}
              toggleSupplier={toggleSupplier}
              handleSelectAllSuppliers={handleSelectAllSuppliers}
              handleDeselectAllSuppliers={handleDeselectAllSuppliers}
              loadingSuppliers={loadingSuppliers || loadingProducts}
              isDarkMode={isDarkMode}
            />

            {error && <EditQuotationErrorState message={error} />}

            <EditQuotationFormActions submitting={submitting} />
          </form>

          <ProductSelectionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            products={catalogProducts.map((p) => ({
              ...p,
              brand: p.brand || undefined,
              ean: p.ean || undefined,
              imageUrl: p.imageUrl || undefined,
            }))}
            onAddSelectedProducts={(ids) => handleAddSelectedProducts(ids, catalogProducts)}
          />
        </div>
      </main>

      <CommandMenu
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        isDarkMode={isDarkMode}
        latestQuotationId={quotationId}
      />
    </div>
  );
}