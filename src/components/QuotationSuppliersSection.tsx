'use client';

import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

interface Supplier {
  id: string;
  name: string;
  contactPerson?: string | null;
}

interface QuotationSuppliersSectionProps {
  suppliers: Supplier[];
  selectedSupplierIds: string[];
  onToggleSupplier: (id: string) => void;
  loading: boolean;
}

export default function QuotationSuppliersSection({
  suppliers,
  selectedSupplierIds,
  onToggleSupplier,
  loading,
}: QuotationSuppliersSectionProps) {
  const { isDarkMode } = useTheme();

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider">Fornecedores Participantes</h2>
          <p className="mt-0.5 text-xs opacity-60 font-medium">Os distribuidores selecionados serão convidados para participar desta cotação.</p>
        </div>
        <span className="shrink-0 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{selectedSupplierIds.length} selecionado(s)</span>
      </div>

      {loading ? (
        <p className="py-8 text-center text-xs opacity-50 font-medium">A carregar fornecedores...</p>
      ) : suppliers.length === 0 ? (
        <div className={`mt-4 rounded-2xl border border-dashed p-8 text-center ${
          isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-300 bg-slate-50/50'
        }`}>
          <p className="text-xs opacity-70 font-medium">Nenhum fornecedor cadastrado.</p>
          <Link href="/fornecedores" className="mt-2 inline-block text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">Cadastrar fornecedor</Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {suppliers.map((supplier) => {
            const isSelected = selectedSupplierIds.includes(supplier.id);
            return (
              <label
                key={supplier.id}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? isDarkMode
                      ? 'border-emerald-500/50 bg-emerald-950/30 shadow-lg shadow-emerald-950/20'
                      : 'border-emerald-500 bg-emerald-50/60 shadow-sm'
                    : isDarkMode
                      ? 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSupplier(supplier.id)}
                  className="mt-0.5 h-4 w-4 rounded accent-emerald-600 cursor-pointer"
                />
                <div>
                  <span className={`block text-xs font-black tracking-tight ${isSelected ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-900') : ''}`}>
                    {supplier.name}
                  </span>
                  {supplier.contactPerson && (
                    <span className="mt-0.5 block text-[11px] opacity-60 font-medium">{supplier.contactPerson}</span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
}