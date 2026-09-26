'use client';

import Link from 'next/link';

interface QuotationFormHeaderProps {
  onOpenModal: () => void;
}

export default function QuotationFormHeader({ onOpenModal }: QuotationFormHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Link href="/cotacoes" className="text-xs font-bold opacity-70 hover:opacity-100 transition flex items-center gap-1.5">
          &larr; Voltar para cotações
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center rounded-2xl border border-slate-500/10 p-6 bg-slate-50/60 dark:bg-slate-950/40 dark:border-slate-800 gap-4 transition-all">
        <div>
          <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
            Nova Cotação
          </span>
          <h1 className="text-xl md:text-2xl font-black tracking-tight">Monte uma solicitação de preços</h1>
          <p className="text-xs opacity-60 mt-1 font-medium">
            Escolha os fornecedores, defina os prazos, selecione os produtos ou importe por arquivo.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenModal}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>+ Adicionar do Catálogo</span>
        </button>
      </div>
    </div>
  );
}