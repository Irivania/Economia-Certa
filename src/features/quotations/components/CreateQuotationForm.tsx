'use client';

import { useState, FormEvent } from 'react';
import QuotationBasicInfo from '@/components/QuotationBasicInfo';
import QuotationItemsTable from '@/components/QuotationItemsTable';
import QuotationSuggestionBar from '@/components/QuotationSuggestionBar';
import { ProductSelectionModal } from '@/features/quotations/components/ProductSelectionModal';
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

interface RawCatalogProduct {
  id: string;
  name?: string;
  description?: string;
  ean?: string;
  brand?: string | null;
  imageUrl?: string | null;
}

export function CreateQuotationForm({ domain, isDarkMode }: CreateQuotationFormProps) {
  const { catalog, quotationSuppliers, quotationItems, quotationForm, submitting, error, handleQuickRegisterProduct, submit } = domain;
  
  // Estados para controlar os modais
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isFileImportModalOpen, setIsFileImportModalOpen] = useState(false);

  const handleSubmitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit();
  };

  const rawCatalogList = (catalog.catalogProducts || (catalog as { products?: RawCatalogProduct[] }).products || (Array.isArray(catalog) ? catalog : [])) as RawCatalogProduct[];

  return (
    <div className={`rounded-xl border p-6 sm:p-7 shadow-sm transition-all space-y-6 ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900'
    }`}>
      {/* Botão principal que abre o catálogo de produtos cadastrados no banco de dados */}
      <CreateQuotationHeader onOpenModal={() => setIsCatalogModalOpen(true)} />

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

        {/* Secção / Botão opcional para importar ficheiro externo (Excel / CSV) */}
        <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Importação por Ficheiro (Excel / CSV)</h4>
            <p className="text-xs text-slate-500 mt-0.5">Prefere carregar uma lista externa de produtos? Utilize o importador.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsFileImportModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Carregar Ficheiro
          </button>
        </div>

        {/* Modal 1: Seleção de Produtos do Catálogo Interno (Banco de Dados) */}
        <ProductSelectionModal
          isOpen={isCatalogModalOpen}
          onClose={() => setIsCatalogModalOpen(false)}
          products={rawCatalogList.map((p) => ({
            id: p.id,
            description: p.name || p.description || 'Produto sem descrição',
            ean: p.ean || '',
            brand: p.brand || null,
            imageUrl: p.imageUrl || null,
          }))}
          onAddSelectedProducts={(selectedProductIds: string[]) => {
            const itemsToAdd = rawCatalogList
              .filter((p) => selectedProductIds.includes(p.id))
              .map((p) => ({
                id: p.id,
                productId: p.id,
                description: p.name || p.description || 'Produto sem descrição',
                ean: p.ean || '',
                brand: p.brand || null,
                imageUrl: p.imageUrl || null,
                requestedQuantity: 1,
              }));

            if (itemsToAdd.length > 0) {
              quotationItems.handleImportComplete(
                itemsToAdd as Parameters<typeof quotationItems.handleImportComplete>[0]
              );
            }
          }}
        />

        {/* Modal 2: Importação de Ficheiro Externo (Excel/CSV) */}
        {isFileImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl p-6 shadow-2xl ${
              isDarkMode ? 'bg-slate-900 text-slate-100 border border-slate-800' : 'bg-white text-slate-900'
            }`}>
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h3 className="text-base font-bold">Central de Importação Inteligente</h3>
                <button
                  type="button"
                  onClick={() => setIsFileImportModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-1"
                >
                  ✕
                </button>
              </div>

              <ProductImportModal 
                products={catalog.catalogProducts as Parameters<typeof ProductImportModal>[0]['products']} 
                onQuickRegister={handleQuickRegisterProduct} 
                onImportComplete={(items) => {
                  quotationItems.handleImportComplete(items);
                  setIsFileImportModalOpen(false);
                }}
              />
            </div>
          </div>
        )}

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