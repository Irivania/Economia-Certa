'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';

interface QuotationInfo {
  id: string;
  title: string;
  startDate?: string | null;
  endDate?: string | null;
  closingTime?: string | null;
  status?: string | null;
}

interface TrackingItem {
  id: string;
  name: string;
  phone?: string | null;
  status: string;
  answeredAt?: string | null;
  totalOffered: number;
  token: string; // Token individual e exclusivo do distribuidor
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
}

function getWhatsappUrl(quotationTitle: string, supplierName: string, supplierPhone: string, token: string) {
  const phone = (supplierPhone || '').replace(/\D/g, '');
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const portalUrl = `${baseUrl}/portal/cotacao/${token}`;

  const message = `Olá ${supplierName || 'fornecedor'}, segue o link da cotação "${quotationTitle}" para preenchimento de preços e prazos na Melo Perfumaria:\n\n🔗 ${portalUrl}\n\nAgradecemos a parceria!`;

  return `https://api.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent(message)}`;
}

export default function QuotationTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const quotationId = resolvedParams.id;

  const [quotation, setQuotation] = useState<QuotationInfo | null>(null);
  const [tracking, setTracking] = useState<TrackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTracking() {
      if (!quotationId) return;

      try {
        const response = await fetch(`/api/quotations/${quotationId}/tracking`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao carregar o acompanhamento.');
        }

        setQuotation(data.quotation);
        setTracking(Array.isArray(data.tracking) ? data.tracking : []);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar os dados de acompanhamento.');
      } finally {
        setLoading(false);
      }
    }

    loadTracking();
  }, [quotationId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <p className="mx-auto max-w-4xl text-center text-sm text-slate-400">Carregando acompanhamento...</p>
      </main>
    );
  }

  if (error || !quotation) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/cotacoes" className="text-sm font-medium text-slate-500 transition hover:text-indigo-600">← Voltar para cotações</Link>
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error || 'Cotação não encontrada.'}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/cotacoes" className="text-sm font-medium text-slate-500 transition hover:text-indigo-600">← Voltar para cotações</Link>

        <header className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Acompanhamento de Cotação</p>
          <h1 className="text-2xl font-bold text-slate-900">{quotation.title}</h1>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
            <span>Início: <strong className="text-slate-700">{formatDate(quotation.startDate)}</strong></span>
            <span>Término: <strong className="text-slate-700">{formatDate(quotation.endDate)}{quotation.closingTime ? ` às ${quotation.closingTime}` : ''}</strong></span>
          </div>
        </header>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700 text-sm">
            Distribuidores Convidados ({tracking.length})
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/50 text-slate-600">
                <tr>
                  <th className="p-4 font-semibold">Distribuidor / Fornecedor</th>
                  <th className="p-4 text-center font-semibold">Status</th>
                  <th className="p-4 text-center font-semibold">Total Oferecido</th>
                  <th className="p-4 text-right font-semibold">Ações / Envio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tracking.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400">
                      Nenhum distribuidor vinculado a esta cotação.
                    </td>
                  </tr>
                ) : (
                  tracking.map((item) => {
                    const whatsUrl = getWhatsappUrl(quotation.title, item.name, item.phone || '', item.token);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="p-4 font-medium text-slate-800">
                          <div>{item.name}</div>
                          {item.phone && <div className="text-xs text-slate-400 font-normal">Tel: {item.phone}</div>}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${item.status === 'RESPONDIDO' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {item.status === 'RESPONDIDO' ? 'Respondido' : 'Pendente'}
                          </span>
                        </td>
                        <td className="p-4 text-center font-semibold text-slate-700">
                          {item.totalOffered > 0 ? `R$ ${item.totalOffered.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="p-4 text-right">
                          <a
                            href={whatsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 shadow-sm"
                          >
                            💬 Enviar WhatsApp
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}