'use client';

import Link from 'next/link';

interface QuotationFormHeaderProps {
  onOpenModal: () => void;
}

export default function QuotationFormHeader({ onOpenModal }: QuotationFormHeaderProps) {
  return (
    <>
      <Link href="/cotacoes" className="text-sm font-medium text-slate-500 transition hover:text-indigo-600">
        ← Voltar para cotações
      </Link>

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100 gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Nova Cotação</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Monte uma solicitação de preços</h1>
          <p className="mt-1 text-sm text-slate-500">Escolha os fornecedores, defina os prazos, selecione os produtos ou importe por arquivo.</p>
        </div>
        <div>
          <button
            type="button"
            onClick={onOpenModal}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-4 py-2.5 rounded-lg text-sm transition shadow-sm border border-indigo-100"
          >
            + Adicionar do Catálogo
          </button>
        </div>
      </header>
    </>
  );
}