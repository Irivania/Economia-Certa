'use client';

import Link from 'next/link';

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
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase">Fornecedores Participantes</h2>
          <p className="mt-0.5 text-xs text-slate-500">A cotação será criada separadamente para cada fornecedor selecionado.</p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-indigo-600">{selectedSupplierIds.length} selecionado(s)</span>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-400">Carregando fornecedores...</p>
      ) : suppliers.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-6 text-center">
          <p className="text-sm text-slate-600">Nenhum fornecedor cadastrado.</p>
          <Link href="/fornecedores" className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800">Cadastrar fornecedor</Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {suppliers.map((supplier) => (
            <label key={supplier.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition ${selectedSupplierIds.includes(supplier.id) ? 'border-indigo-400 bg-indigo-50/60 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
              <input type="checkbox" checked={selectedSupplierIds.includes(supplier.id)} onChange={() => onToggleSupplier(supplier.id)} className="mt-0.5 h-4 w-4 accent-indigo-600" />
              <span>
                <span className="block text-sm font-semibold text-slate-800">{supplier.name}</span>
                {supplier.contactPerson && <span className="mt-0.5 block text-xs text-slate-500">{supplier.contactPerson}</span>}
              </span>
            </label>
          ))}
        </div>
      )}
    </section>
  );
}