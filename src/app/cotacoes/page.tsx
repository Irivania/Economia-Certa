'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SupplierTracking {
  id: string;
  name: string;
  status: string;
}

interface Quotation {
  id: string;
  title: string;
  paymentTerms?: string | null;
  status?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  closingTime?: string | null;
  suppliers?: SupplierTracking[];
}

const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';

function formatDate(value?: string | null) {
  if (!value) return '-';
  const cleanStr = String(value).split('T')[0];
  const parts = cleanStr.split('-');
  if (parts.length !== 3) return '-';
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
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
      const response = await fetch(`/api/quotations?id=${quotation.id}&companyId=${companyId}`, { 
        method: 'DELETE' 
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Não foi possível excluir a cotação.');

      setQuotations((current) => current.filter((item) => item.id !== quotation.id));
    } catch (error) {
      console.error('Erro ao excluir cotação:', error);
      alert('Não foi possível excluir a cotação.');
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm text-slate-500">
        <Link href="/" className="font-medium transition hover:text-indigo-600">← Voltar para a página principal</Link>
        <Link href="/cotacoes/nova" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700">
          + Nova cotação
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Cotações cadastradas</h1>
        <p className="mt-1 text-sm text-slate-500">Acompanhe, revise e gerencie suas cotações e o envio para os distribuidores.</p>
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
                  <th className="p-4 font-semibold">Título / Pagamento</th>
                  <th className="p-4 text-center font-semibold">Início</th>
                  <th className="p-4 text-center font-semibold">Término & Fecho</th>
                  <th className="p-4 font-semibold">Fornecedores Convidados</th>
                  <th className="p-4 text-center font-semibold">Status</th>
                  <th className="p-4 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-slate-50/60 align-top">
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{quotation.title}</div>
                      {quotation.paymentTerms && (
                        <div className="mt-1 text-xs text-slate-500">
                          Pagamento: <strong className="text-slate-700">{quotation.paymentTerms}</strong>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center text-slate-600 text-xs">
                      {formatDate(quotation.startDate)}
                    </td>
                    <td className="p-4 text-center text-slate-600 text-xs">
                      <div>{formatDate(quotation.endDate)}</div>
                      {quotation.closingTime && <div className="text-slate-400">às {quotation.closingTime}</div>}
                    </td>
                    <td className="p-4">
                      {quotation.suppliers && quotation.suppliers.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {quotation.suppliers.map((sup, idx) => (
                            <span
                              key={idx}
                              className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ${
                                sup.status === 'RESPONDIDO'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                              title={`Status: ${sup.status}`}
                            >
                              {sup.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Nenhum fornecedor vinculado</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        {quotation.status === 'OPEN' ? 'Aberta' : quotation.status || 'Ativa'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Link href={`/cotacoes/acompanhar/${quotation.id}`} className="rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200">Acompanhar / Enviar</Link>
                        <Link href={`/cotacoes/respostas/${quotation.id}`} className="rounded-md bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100">Respostas</Link>
                        <Link href={`/cotacoes/editar/${quotation.id}`} className="rounded-md bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100">Editar</Link>
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