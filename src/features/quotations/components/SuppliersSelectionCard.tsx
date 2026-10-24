'use client';

import { memo } from 'react';
import { Supplier } from '../types/supplier.types';
import QuotationSuppliersSection from '@/components/QuotationSuppliersSection';

interface SuppliersSelectionCardProps {
  suppliers: Supplier[];
  selectedSupplierIds: string[];
  toggleSupplier: (id: string) => void;
  handleSelectAllSuppliers: () => void;
  handleDeselectAllSuppliers: () => void;
  loadingSuppliers: boolean;
  isDarkMode: boolean;
}

export const SuppliersSelectionCard = memo(function SuppliersSelectionCard({
  suppliers,
  selectedSupplierIds,
  toggleSupplier,
  handleSelectAllSuppliers,
  handleDeselectAllSuppliers,
  loadingSuppliers,
  isDarkMode,
}: SuppliersSelectionCardProps) {
  return (
    <div className={`space-y-4 rounded-xl border p-5 transition-all ${
      isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/70 border-slate-200/90'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider">Distribuidores / Fornecedores Convidados</h2>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <button type="button" onClick={handleSelectAllSuppliers} className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">Marcar todos</button>
          <span className="opacity-30">|</span>
          <button type="button" onClick={handleDeselectAllSuppliers} className="text-slate-500 hover:underline cursor-pointer">Desmarcar todos</button>
        </div>
      </div>

      <QuotationSuppliersSection
        suppliers={suppliers}
        selectedSupplierIds={selectedSupplierIds}
        onToggleSupplier={toggleSupplier}
        loading={loadingSuppliers}
      />
    </div>
  );
});