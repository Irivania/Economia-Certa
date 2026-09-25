'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';

interface QuotationInfo {
  id: string;
  title: string;
  startDate?: string | null;
  endDate?: string | null;
  closingTime?: string | null;
}

interface TrackingSupplier {
  id: string;
  name: string;
  phone?: string | null;
  status: string;
  totalOffered: number;
  token: string;
}

function formatDate(value?: string | null) {
  if (!value) return '-';

  const dateMatch = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) return `${dateMatch[3]}/${dateMatch[2]}/${dateMatch[1]}`;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
}

function formatQuotationDeadline(endDate?: string | null, closingTime?: string | null) {
  if (!endDate) return 'breve';

  const dateMatch = endDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  const formattedDate = dateMatch
    ? `${dateMatch[3]}/${dateMatch[2]}/${dateMatch[1]}`
    : new Date(endDate).toLocaleDateString('pt-BR');

  return closingTime ? `${formattedDate} às ${closingTime}` : formattedDate;
}

export function getWhatsAppQuoteLink(
  supplierPhone: string,
  supplierName: string,
  companyName: string,
  quotationTitle: string,
  token: string,
  endDate?: string | null,
  closingTime?: string | null,
) {
  const cleanPhone = supplierPhone.replace(/\D/g, '');
  const phone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

  const portalUrl = `${window.location.origin}/portal/cotacao/${token}`;
  const formattedDeadline = formatQuotationDeadline(endDate, closingTime);

  const message = `Olá *${supplierName}*! Aqui é da *${companyName}* 🛍️.
Enviamos uma nova cotação: *${quotationTitle}*.
Prazo de resposta até: *${formattedDeadline}*.

Por favor, acesse o nosso portal seguro para preencher os preços dos produtos através do link abaixo:
🔗 ${portalUrl}

Aguardamos o seu retorno. Obrigado!`;

  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

export default function QuotationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quotation, setQuotation] = useState<QuotationInfo | null>(null);
  const [tracking, setTracking] = useState<TrackingSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuotation() {
      try {
        const response = await fetch(`/api/quotations/${id}/tracking`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Não foi possível carregar a cotação.');
        }

        setQuotation(data.quotation);
        setTracking(Array.isArray(data.tracking) ? data.tracking : []);
      } catch (loadError) {
        console.error(loadError);
        setError('Não foi possível carregar os dados da cotação.');
      } finally {
        setLoading(false);
      }
    }

    if (id) void loadQuotation();
  }, [id]);

  if (loading) {
    return <main className="min-h-screen bg-slate-50 p-6 text-center text-sm text-slate-400">Carregando cotação...</main>;
  }

  if (error || !quotation) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl space-y-4">
          <Link href="/cotacoes" className="text-sm text-slate-500 hover:text-indigo-600">← Voltar para cotações</Link>
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error || 'Cotação não encontrada.'}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/cotacoes" className="text-sm font-medium text-slate-500 hover:text-indigo-600">← Voltar para cotações</Link>

        <header className="space-y-2 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Detalhes da Cotação</p>
          <h1 className="text-2xl font-bold text-slate-900">{quotation.title}</h1>
          <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-500">
            <span>Início: <strong className="text-slate-700">{formatDate(quotation.startDate)}</strong></span>
            <span>Término: <strong className="text-slate-700">{formatDate(quotation.endDate)}{quotation.closingTime ? ` às ${quotation.closingTime}` : ''}</strong></span>
          </div>
        </header>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
            Fornecedores convidados ({tracking.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-slate-100 text-slate-600">
                <tr>
                  <th className="p-4 font-semibold">Fornecedor</th>
                  <th className="p-4 text-center font-semibold">Status</th>
                  <th className="p-4 text-center font-semibold">Total oferecido</th>
                  <th className="p-4 text-right font-semibold">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tracking.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-slate-400">Nenhum fornecedor vinculado.</td></tr>
                ) : tracking.map((supplier) => {
                  const whatsappUrl = supplier.phone
                    ? getWhatsAppQuoteLink(supplier.phone, supplier.name, 'Melo Perfumaria', quotation.title, supplier.token, quotation.endDate, quotation.closingTime)
                    : null;

                  return (
                    <tr key={supplier.id} className="hover:bg-slate-50/60">
                      <td className="p-4 font-medium text-slate-800">
                        <div>{supplier.name}</div>
                        {supplier.phone && <div className="text-xs font-normal text-slate-400">Tel: {supplier.phone}</div>}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${supplier.status === 'RESPONDIDO' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {supplier.status === 'RESPONDIDO' ? 'Respondido' : 'Pendente'}
                        </span>
                      </td>
                      <td className="p-4 text-center font-semibold text-slate-700">
                        {supplier.totalOffered > 0 ? `R$ ${supplier.totalOffered.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="p-4 text-right">
                        {whatsappUrl ? (
                          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700">
                            💬 Enviar WhatsApp
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">Telefone não informado</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}