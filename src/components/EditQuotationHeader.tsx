'use client';

interface EditQuotationHeaderProps {
  onOpenModal: () => void;
}

export default function EditQuotationHeader({ onOpenModal }: EditQuotationHeaderProps) {
  return (
    <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">Edição de Cotação</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Modificar Solicitação e Produtos</h1>
        <p className="mt-1 text-sm text-slate-500">Altere os dados gerais, adicione/remova produtos e ajuste quantidades e preços.</p>
      </div>
      <div>
        <button
          type="button"
          onClick={onOpenModal}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2.5 rounded-lg text-sm transition shadow-sm"
        >
          + Adicionar do Catálogo
        </button>
      </div>
    </header>
  );
}