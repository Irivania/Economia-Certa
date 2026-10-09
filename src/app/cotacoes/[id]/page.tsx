'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';

interface QuotationInfo {
  id: string;
  title: string;
  startDate?: string | null;
  endDate?: string | null;
  closingTime?: string | null;
}

interface TrackingSupplier {
  id: string;
  supplierId: string;
  brandId?: string | null;
  name: string;
  phone?: string | null;
  status: string;
  totalOffered: number;
  token: string;
  isB2BActive?: boolean;
}

function formatDate(value?: string | null) {
  if (!value) return '-';

  const dateMatch = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) return `${dateMatch[3]}/${dateMatch[2]}/${dateMatch[1]}`;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
}

export default function QuotationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isDarkMode } = useTheme();
  const [quotation, setQuotation] = useState<QuotationInfo | null>(null);
  const [tracking, setTracking] = useState<TrackingSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  async function sendDirectly(quotationSupplierId: string) {
    setSendingId(quotationSupplierId);
    try {
      const response = await fetch('/api/quotations/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quotationId: id, quotationSupplierId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível enviar a cotação.');
      setTracking((current) => current.map((item) =>
        item.id === quotationSupplierId ? { ...item, status: 'ENVIADO' } : item,
      ));
    } catch (sendError) {
      console.error(sendError);
      setError(sendError instanceof Error ? sendError.message : 'Não foi possível enviar a cotação.');
    } finally {
      setSendingId(null);
    }
  }

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
    return (
      <main className={`flex min-h-screen items-center justify-center text-sm ${isDarkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-400'}`}>
        Carregando encaminhamento...
      </main>
    );
  }

  if (error || !quotation) {
    return (
      <main className={`min-h-screen p-6 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="mx-auto max-w-5xl space-y-4">
          <Link href="/cotacoes" className="text-sm text-slate-500 hover:text-indigo-600">← Voltar para cotações</Link>
          <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || 'Cotação não encontrada.'}</p>
        </div>
      </main>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Economia Certa"
        subtitle="Painel gerencial inteligente e controle de compras em tempo real."
        onOpenCmd={() => setIsCmdOpen(true)}
      />
      <main className="mx-auto max-w-7xl space-y-6 px-6 pb-20 sm:px-12">
        <Link href="/cotacoes" className="inline-flex items-center gap-2 text-xs font-bold opacity-70 transition hover:opacity-100">
          ← Voltar para cotações
        </Link>

        <header className={`rounded-3xl border p-8 shadow-2xl ${
          isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200/80 bg-white'
        }`}>
          <span className="inline-flex rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Encaminhamento de cotação
          </span>
          <h1 className="mt-3 text-2xl font-black tracking-tight">{quotation.title}</h1>
          <p className="mt-2 max-w-2xl text-xs font-medium opacity-60">
            Envie a cotação diretamente para cada distribuidora participante. Cada distribuidora recebe um vínculo independente.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-xs opacity-70">
            <span>Início: <strong>{formatDate(quotation.startDate)}</strong></span>
            <span>Término: <strong>{formatDate(quotation.endDate)}{quotation.closingTime ? ` às ${quotation.closingTime}` : ''}</strong></span>
          </div>
        </header>

        <section className={`overflow-hidden rounded-3xl border shadow-xl ${
          isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200/80 bg-white'
        }`}>
          <div className={`border-b p-6 ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/70'}`}>
            <h2 className="text-sm font-black uppercase tracking-wider">Distribuidoras participantes ({tracking.length})</h2>
            <p className="mt-1 text-xs opacity-60">O envio é feito uma única vez para cada distribuidora.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className={`border-b uppercase tracking-wider ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                <tr>
                  <th className="p-5 font-extrabold">Distribuidora</th>
                  <th className="p-5 text-center font-extrabold">Status</th>
                  <th className="p-5 text-center font-extrabold">Total oferecido</th>
                  <th className="p-5 text-right font-extrabold">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tracking.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center opacity-50">Nenhuma distribuidora vinculada.</td></tr>
                ) : tracking.map((supplier) => {
                  const isSent = supplier.status === 'ENVIADO';
                  const isAnswered = supplier.status === 'RESPONDIDO';
                  return (
                    <tr key={supplier.id} className={`border-b last:border-0 ${isDarkMode ? 'border-slate-800 hover:bg-slate-800/40' : 'border-slate-100 hover:bg-slate-50/80'}`}>
                      <td className="p-5 font-bold">
                        <div>{supplier.name}</div>
                        {supplier.phone && <div className="mt-1 text-[11px] font-normal opacity-50">Tel: {supplier.phone}</div>}
                      </td>
                      <td className="p-5 text-center">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                          isAnswered ? 'bg-emerald-50 text-emerald-700' : isSent ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {isAnswered ? 'Respondido' : isSent ? 'Enviado' : 'Pendente de envio'}
                        </span>
                      </td>
                      <td className="p-5 text-center font-semibold">
                        {supplier.totalOffered > 0 ? `R$ ${supplier.totalOffered.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="p-5 text-right">
                        {isAnswered ? (
                          <span className="text-xs font-medium text-emerald-700">Cotação respondida</span>
                        ) : isSent ? (
                          <span className="text-xs font-medium text-blue-700">✓ Cotação enviada ao representante</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void sendDirectly(supplier.id)}
                            disabled={sendingId === supplier.id}
                            className="inline-flex rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {sendingId === supplier.id ? 'Enviando...' : '📨 Enviar direto'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId={id} />
    </div>
  );
}