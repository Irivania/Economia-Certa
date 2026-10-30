'use client';

import { useState, FormEvent } from 'react';
import QuotationBasicInfo from '@/components/QuotationBasicInfo';
import QuotationItemsTable from '@/components/QuotationItemsTable';
import QuotationSuggestionBar from '@/components/QuotationSuggestionBar';
import { ProductSelectionModal } from '@/features/quotations/components/ProductSelectionModal';
import { ProductImportModal } from '@/features/quotations/components/ProductImportModal';
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
  stockCurrent?: number;
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
      {/* Cabeçalho limpo da página de criação */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
        <div>
          <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full mb-1">
            Nova Cotação
          </span>
          <h2 className="text-lg font-black tracking-tight">Monte uma solicitação de preços</h2>
          <p className="text-xs text-slate-500 mt-0.5">Escolha os fornecedores, defina os prazos e adicione os produtos do catálogo ou arquivo.</p>
        </div>
      </div>

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

        {/* SEÇÃO UNIFICADA: Catálogo do Banco de Dados + Importação de Ficheiro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Opção 1: Selecionar do Catálogo do Banco de Dados */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">Catálogo de Produtos</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Selecione os itens cadastrados no banco de dados.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                catalog.refreshCatalog();
                setIsCatalogModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              + Adicionar do Catálogo
            </button>
          </div>

          {/* Opção 2: Importar Ficheiro Externo (Excel / CSV) */}
          <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Importação por Ficheiro</h4>
              <p className="text-xs text-slate-500 mt-0.5">Carregue uma lista externa via Excel ou CSV.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsFileImportModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              Carregar Ficheiro
            </button>
          </div>

        </div>

        {/* Modal 1: Seleção de Produtos do Catálogo Interno */}
        <ProductSelectionModal
          isOpen={isCatalogModalOpen}
          onClose={() => setIsCatalogModalOpen(false)}
          products={rawCatalogList.map((p) => ({
            id: p.id,
            description: p.name || p.description || 'Produto sem descrição',
            ean: p.ean || '',
            brand: p.brand || null,
            imageUrl: p.imageUrl || null,
            stockCurrent: p.stockCurrent || 0,
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

        {/* Modal 2: Importação de Ficheiro Externo (Excel/CSV) - Bem Amplo e Espaçoso */}
        {isFileImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 sm:p-6">
            <div className={`relative w-full max-w-6xl w-[95vw] max-h-[92vh] overflow-y-auto rounded-3xl p-8 sm:p-10 shadow-2xl border ${
              isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white text-slate-900 border-slate-200'
            }`}>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-500/10">
                <div>
                  <h3 className="text-lg font-black tracking-tight">📁 Central de Importação Inteligente</h3>
                  <p className="text-xs opacity-60 mt-0.5">Importe ficheiros (.xlsx, .xls, .csv) ou cole os dados para validação e cruzamento.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFileImportModalOpen(false)}
                  className="w-9 h-9 rounded-xl bg-slate-500/10 flex items-center justify-center hover:bg-slate-500/20 text-sm font-bold transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <ProductImportModal 
                products={catalog.catalogProducts as Parameters<typeof ProductImportModal>[0]['products']} 
                onQuickRegister={handleQuickRegisterProduct} 
                onImportComplete={(items: Parameters<typeof quotationItems.handleImportComplete>[0]) => {
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