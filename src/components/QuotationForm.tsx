'use client';

import { useState } from 'react';
import { uppercaseText } from '@/lib/text';

interface QuotationFormProps {
  companyId: string;
  onSuccess: () => void;
  showToast: (msg: string) => void;
}

export default function QuotationForm({ companyId, onSuccess, showToast }: QuotationFormProps) {
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
    <form onSubmit={handleSubmit} className="mb-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
      <h2 className="text-md font-bold text-slate-800 mb-3">Criar Nova Cotação</h2>
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Ex: Cotação de Perfumaria - Setembro"
          value={title}
          onChange={(e) => setTitle(uppercaseText(e.target.value))}
          className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {submitting ? 'Salvando...' : 'Criar Cotação'}
        </button>
      </div>
      {formError && <p className="text-xs text-red-600 mt-2">{formError}</p>}
    </form>
  );
}