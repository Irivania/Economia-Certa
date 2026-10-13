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
      <main className={`flex min-h-screen items-center justify-center text-xs font-medium ${isDarkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
        Carregando encaminhamento...
      </main>
    );
  }

  if (error || !quotation) {
    return (
      <main className={`min-h-screen p-6 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="mx-auto max-w-5xl space-y-4">
          <Link href="/cotacoes" className="text-xs font-semibold text-slate-500 hover:text-indigo-600">← Voltar para cotações</Link>
          <p className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">{error || 'Cotação não encontrada.'}</p>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20 relative z-20 space-y-6">
        <Link href="/cotacoes" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-lg shadow-xs border border-slate-200 dark:border-slate-800 transition hover:text-indigo-600 dark:hover:text-indigo-400">
          &larr; Voltar para cotações
        </Link>

        <header className={`rounded-xl border p-6 sm:p-7 shadow-xs ${
          isDarkMode ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200/90 bg-white text-slate-900'
        }`}>
          <span className="inline-flex rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Encaminhamento de cotação
          </span>
          <h1 className="mt-2 text-lg md:text-xl font-bold tracking-tight">{quotation.title}</h1>
          <p className="mt-1 max-w-2xl text-xs font-medium text-slate-500 dark:text-slate-400">
            Envie a cotação diretamente para cada distribuidora participante. Cada distribuidora recebe um vínculo independente.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span>Início: <strong className="font-mono text-slate-700 dark:text-slate-200">{formatDate(quotation.startDate)}</strong></span>
            <span>Término: <strong className="font-mono text-slate-700 dark:text-slate-200">{formatDate(quotation.endDate)}{quotation.closingTime ? ` às ${quotation.closingTime}` : ''}</strong></span>
          </div>
        </header>

        <section className={`overflow-hidden rounded-xl border shadow-xs ${
          isDarkMode ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200/90 bg-white text-slate-900'
        }`}>
          <div className={`border-b p-5 ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/70'}`}>
            <h2 className="text-xs font-bold uppercase tracking-wider">Distribuidoras participantes ({tracking.length})</h2>
            <p className="mt-0.5 text-[11px] text-slate-500">O envio é feito uma única vez para cada distribuidora.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className={`border-b uppercase tracking-wider text-[11px] font-bold ${isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-900/30' : 'border-slate-100 text-slate-500 bg-slate-50/60'}`}>
                <tr>
                  <th className="px-4 py-3">Distribuidora</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Total oferecido</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tracking.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhuma distribuidora vinculada.</td></tr>
                ) : tracking.map((supplier, index) => {
                  const uniqueKey = `${supplier.id}-${index}`;
                  const isSent = supplier.status === 'ENVIADO';
                  const isAnswered = supplier.status === 'RESPONDIDO';
                  return (
                    <tr key={uniqueKey} className={`transition-colors align-middle ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}`}>
                      <td className="px-4 py-3 font-semibold">
                        <div>{supplier.name}</div>
                        {supplier.phone && <div className="mt-0.5 text-[11px] font-normal text-slate-400">Tel: {supplier.phone}</div>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          isAnswered ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : isSent ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {isAnswered ? 'Respondido' : isSent ? 'Enviado' : 'Pendente de envio'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-semibold">
                        {supplier.totalOffered > 0 ? `R$ ${supplier.totalOffered.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isAnswered ? (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Cotação respondida</span>
                        ) : isSent ? (
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">✓ Cotação enviada ao representante</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void sendDirectly(supplier.id)}
                            disabled={sendingId === supplier.id}
                            className="inline-flex rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
                          >
                            {sendingId === supplier.id ? 'A enviar...' : '📨 Enviar direto'}
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