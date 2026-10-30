'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';
import { ProductForm } from '@/components/ProductForm';
import { ProductTable } from '@/components/ProductTable';
import { useProductManagement } from '@/features/products/hooks/useProductManagement';

function ProductsContent() {
  const { isDarkMode, mounted } = useTheme();
  const prod = useProductManagement();

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <AppHeader
        title="Catálogo & Gestão de Produtos"
        subtitle="Controle de itens, custos, estoque, tributos, ANVISA e logística."
        onOpenCmd={() => prod.setIsCmdOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20 relative z-20 space-y-6">
        
        {prod.returnTo && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-400">
              ⚡ Você foi redirecionado para cadastrar um produto em falta. Conclua o cadastro abaixo e será retornado automaticamente!
            </span>
            <Link
              href={prod.returnTo}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition shadow-xs"
            >
              &larr; Voltar de onde veio
            </Link>
          </div>
        )}

        <div className={`p-6 sm:p-7 rounded-2xl shadow-xs border space-y-5 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/90'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                {prod.editingId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Selecione o modo de preenchimento ideal para a sua operação.</p>
            </div>

            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => prod.setFormMode('minimal')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  prod.formMode === 'minimal' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ⚡ Rápido
              </button>
              <button
                type="button"
                onClick={() => prod.setFormMode('complete')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  prod.formMode === 'complete' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                📋 Completo (Fiscal, Custos, ANVISA & Logística)
              </button>
            </div>
          </div>

          <ProductForm
            editingId={prod.editingId}
            description={prod.description}
            setDescription={prod.setDescription}
            ean={prod.ean}
            setEan={prod.setEan}
            brand={prod.brand}
            setBrand={prod.setBrand}
            brandsList={prod.brands}
            imageUrl={prod.imageUrl}
            setImageUrl={prod.setImageUrl}
            unit={prod.unit}
            setUnit={prod.setUnit}
            boxQuantity={prod.boxQuantity === '' ? 1 : prod.boxQuantity}
            setBoxQuantity={prod.setBoxQuantity}
            costPrice={prod.costPrice}
            setCostPrice={prod.setCostPrice}
            lastPurchasePrice={prod.lastPurchasePrice}
            setLastPurchasePrice={prod.setLastPurchasePrice}
            salePrice={prod.salePrice}
            setSalePrice={prod.setSalePrice}
            stockCurrent={prod.stockCurrent}
            setStockCurrent={prod.setStockCurrent}
            stockMin={prod.stockMin}
            setStockMin={prod.setStockMin}
            stockIdeal={prod.stockIdeal}
            setStockIdeal={prod.setStockIdeal}
            stockMax={prod.stockMax}
            setStockMax={prod.setStockMax}
            ncm={prod.ncm}
            setNcm={prod.setNcm}
            cest={prod.cest}
            setCest={prod.setCest}
            classTrib={prod.classTrib}
            setClassTrib={prod.setClassTrib}
            anvisaRegistry={prod.anvisaRegistry}
            setAnvisaRegistry={prod.setAnvisaRegistry}
            manufacturerName={prod.manufacturerName}
            setManufacturerName={prod.setManufacturerName}
            weight={prod.weight}
            setWeight={prod.setWeight}
            dimensions={prod.dimensions}
            setDimensions={prod.setDimensions}
            submitting={prod.submitting}
            onSubmit={prod.handleSubmit}
            onCancelEdit={prod.resetForm}
            isFromImport={prod.isFromImport}
            formMode={prod.formMode}
          />
        </div>

        <div className={`p-6 sm:p-7 rounded-2xl shadow-xs border space-y-5 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/90'}`}>
          <ProductTable
            products={prod.products}
            brands={prod.brands}
            loading={prod.loading}
            error={prod.error}
            searchTerm={prod.searchTerm}
            setSearchTerm={prod.setSearchTerm}
            selectedBrand={prod.selectedBrand}
            setSelectedBrand={prod.setSelectedBrand}
            onEdit={prod.handleEdit}
            onDelete={prod.handleDelete}
          />
        </div>

      </main>

      {prod.toastMessage && (
        <div className="fixed bottom-5 right-5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl shadow-xl text-xs font-semibold transition-all z-50">
          {prod.toastMessage}
        </div>
      )}

      <CommandMenu 
        isOpen={prod.isCmdOpen} 
        onClose={() => prod.setIsCmdOpen(false)} 
        isDarkMode={isDarkMode} 
        latestQuotationId="" 
      />

    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-500">A carregar catálogo...</div>}>
      <ProductsContent />
    </Suspense>
  );
}