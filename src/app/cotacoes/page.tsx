'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Quotation {
  id: string;
  title: string;
  status?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  closingTime?: string | null;
  supplierName?: string | null;
  supplierPhone?: string | null;
}

const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
}

function whatsappUrl(quotation: Quotation) {
  const phone = (quotation.supplierPhone || '').replace(/\D/g, '');
  const message = `Olá ${quotation.supplierName || 'fornecedor'}, passando para lembrar de enviar sua resposta da cotação!`;
  return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
}

export default function QuotationsListPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuotations() {
      try {
        const response = await fetch(`/api/quotations?companyId=${companyId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro ao buscar cotações.');
        setQuotations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erro ao buscar cotações:', error);
      } finally {
        setLoading(false);
      }
    }

    loadQuotations();
  }, []);

  async function handleDelete(quotation: Quotation) {
    if (!confirm(`Deseja realmente excluir a cotação "${quotation.title}"?`)) return;

    try {
      const response = await fetch(`/api/quotations/${quotation.id}?companyId=${companyId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Não foi possível excluir a cotação.');
      setQuotations((current) => current.filter((item) => item.id !== quotation.id));
    } catch (error) {
      console.error('Erro ao excluir cotação:', error);
      alert('Não foi possível excluir a cotação.');
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm text-slate-500">
        <Link href="/" className="font-medium transition hover:text-indigo-600">← Voltar para a página principal</Link>
        <Link href="/cotacoes/nova" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700">
          + Nova cotação
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Cotações cadastradas</h1>
        <p className="mt-1 text-sm text-slate-500">Acompanhe, revise e gerencie suas cotações.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <p className="px-6 py-10 text-center text-sm text-slate-400">Carregando cotações...</p>
        ) : quotations.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-400">Nenhuma cotação cadastrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-4 font-semibold">Título</th>
                  <th className="p-4 text-center font-semibold">Início</th>
                  <th className="p-4 text-center font-semibold">Término</th>
                  <th className="p-4 text-center font-semibold">Status</th>
                  <th className="p-4 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-slate-50/60">
                    <td className="p-4 font-medium text-slate-800">{quotation.title}</td>
                    <td className="p-4 text-center text-slate-500">{formatDate(quotation.startDate)}</td>
                    <td className="p-4 text-center text-slate-500">{formatDate(quotation.endDate)}{quotation.closingTime ? ` às ${quotation.closingTime}` : ''}</td>
                    <td className="p-4 text-center">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        {quotation.status === 'OPEN' ? 'Aberta' : quotation.status || 'Ativa'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link href={`/cotacoes/acompanhar/${quotation.id}`} className="rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200">Acompanhar</Link>
                        <Link href={`/cotacoes/respostas/${quotation.id}`} className="rounded-md bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100">Respostas</Link>
                        <a href={whatsappUrl(quotation)} target="_blank" rel="noopener noreferrer" className="rounded-md bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100">WhatsApp</a>
                        <button onClick={() => handleDelete(quotation)} className="rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
