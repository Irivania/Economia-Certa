'use client';

import { useState } from 'react';
import { uppercaseText } from '@/lib/text';
import { useTheme } from '@/context/ThemeContext';

interface QuotationFormProps {
  companyId: string;
  onSuccess: () => void;
  showToast: (msg: string) => void;
}

export default function QuotationForm({ companyId, onSuccess, showToast }: QuotationFormProps) {
  const { isDarkMode } = useTheme();
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('O título da cotação é obrigatório.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, title, items: [] }),
      });

      if (!response.ok) throw new Error('Erro ao criar cotação.');

      setTitle('');
      showToast('Cotação criada com sucesso!');
      onSuccess();
    } catch (err) {
      setFormError('Erro ao salvar a cotação.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`rounded-2xl border p-6 mb-8 space-y-4 transition-all shadow-xl ${
      isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900 shadow-slate-200/50'
    }`}>
      <div>
        <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
          Gestão Rápida
        </span>
        <h2 className="text-base font-black tracking-tight">Criar Nova Cotação</h2>
        <p className="text-xs opacity-60 mt-0.5 font-medium">Insira o título descritivo para iniciar o processo de compras.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Ex: Cotação de Perfumaria - Setembro"
          value={title}
          onChange={(e) => setTitle(uppercaseText(e.target.value))}
          className={`flex-1 rounded-xl border px-4 py-3 text-xs font-bold outline-none transition-all ${
            isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-emerald-600'
          }`}
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-6 py-3 transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer shrink-0"
        >
          {submitting ? 'Salvando...' : 'Criar Cotação'}
        </button>
      </div>

      {formError && <p className="text-xs font-bold text-rose-500 mt-1">{formError}</p>}
    </form>
  );
}