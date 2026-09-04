'use client';

import { ChangeEvent, useState } from 'react';

interface QuotationBasicInfoProps {
  title: string;
  setTitle: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  closingTime: string;
  setClosingTime: (val: string) => void;
  paymentTerms: string;
  setPaymentTerms: (val: string) => void;
  attachedFile: File | null;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
}

const DEFAULT_TERMS = [
  'À Vista',
  'Boleto 7 Dias',
  'Boleto 14 Dias',
  'Boleto 21 Dias',
  'Boleto 28 Dias',
  'Boleto 35 Dias',
  'Boleto 7/14/21',
  'Boleto 14/21/28',
  'Boleto 21/28/35',
];

export default function QuotationBasicInfo({
  title,
  setTitle,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  closingTime,
  setClosingTime,
  paymentTerms,
  setPaymentTerms,
  attachedFile,
  onFileChange,
  onRemoveFile,
}: QuotationBasicInfoProps) {
  
  // Inicializa o estado lendo o localStorage de forma síncrona segura no carregamento inicial
  const [termsList, setTermsList] = useState<string[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_TERMS;
    try {
      const saved = localStorage.getItem('economia_certa_custom_terms');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return Array.from(new Set([...DEFAULT_TERMS, ...parsed]));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_TERMS;
  });

  const [isAddingTerm, setIsAddingTerm] = useState(false);
  const [newTermInput, setNewTermInput] = useState('');

  const handleAddCustomTerm = () => {
    const trimmed = newTermInput.trim();
    if (!trimmed) return;

    if (!termsList.includes(trimmed)) {
      const updated = [...termsList, trimmed];
      setTermsList(updated);
      try {
        localStorage.setItem(
          'economia_certa_custom_terms',
          JSON.stringify(updated.filter(t => !DEFAULT_TERMS.includes(t)))
        );
      } catch (e) {
        console.error(e);
      }
    }

    setPaymentTerms(trimmed);
    setNewTermInput('');
    setIsAddingTerm(false);
  };

  const handleCapitalizeTitle = () => {
    if (!title) return;
    const formatted = title
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    setTitle(formatted);
  };

  const handleApplyStandardTitle = () => {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const currentMonth = monthNames[new Date().getMonth()];
    setTitle(`Cotação De Reposição - ${currentMonth}`);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Informações e Prazos da Cotação</h2>
          <p className="text-xs text-slate-500">Defina o identificador, vigência, condições de pagamento e anexe a lista.</p>
        </div>
        <button
          type="button"
          onClick={handleApplyStandardTitle}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition self-start sm:self-auto"
        >
          ✨ Sugerir Título Padronizado
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Título */}
        <label className="block text-sm font-medium text-slate-700">
          Título da Cotação
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleCapitalizeTitle}
            placeholder="Ex: Cotação De Reposição - Setembro"
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
            required
          />
        </label>

        {/* Condição de Pagamento */}
        <label className="block text-sm font-medium text-slate-700">
          <div className="flex justify-between items-center">
            <span>Condição de Pagamento</span>
            <button
              type="button"
              onClick={() => setIsAddingTerm(!isAddingTerm)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
            >
              <span>{isAddingTerm ? '✕ Cancelar' : '➕ Cadastrar Nova'}</span>
            </button>
          </div>

          {!isAddingTerm ? (
            <select
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-700 font-medium"
              required
            >
              <option value="">Selecione a condição...</option>
              {termsList.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          ) : (
            <div className="mt-1.5 flex gap-2">
              <input
                type="text"
                value={newTermInput}
                onChange={(e) => setNewTermInput(e.target.value)}
                placeholder="Ex: Boleto 45 Dias, 7/14/28..."
                className="flex-1 rounded-lg border border-indigo-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 font-medium"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddCustomTerm}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
              >
                Salvar
              </button>
            </div>
          )}
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Anexo de Arquivo */}
        <label className="block text-sm font-medium text-slate-700">
          Importar Lista (TXT, CSV ou Excel)
          <div className="mt-1.5 flex items-center gap-2">
            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition text-xs font-medium text-slate-600">
              <span>{attachedFile ? `📎 ${attachedFile.name}` : '📁 Escolher arquivo (.txt, .xlsx)'}</span>
              <input type="file" accept=".txt,.csv,.xlsx,.xls" onChange={onFileChange} className="hidden" />
            </label>
            {attachedFile && (
              <button
                type="button"
                onClick={onRemoveFile}
                className="px-3 py-2.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                title="Remover arquivo"
              >
                Remover
              </button>
            )}
          </div>
        </label>

        {/* Datas e Horário Limite */}
        <div className="grid grid-cols-3 gap-2">
          <label className="text-sm font-medium text-slate-700">
            Início
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-2 py-2.5 text-xs outline-none focus:border-indigo-500 bg-white" 
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Término
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-2 py-2.5 text-xs outline-none focus:border-indigo-500 bg-white" 
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Limite
            <input 
              type="time" 
              value={closingTime} 
              onChange={(e) => setClosingTime(e.target.value)} 
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-2 py-2.5 text-xs outline-none focus:border-indigo-500 bg-white" 
            />
          </label>
        </div>
      </div>
    </div>
  );
}