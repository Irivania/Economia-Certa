'use client';

import { useEffect, useState, use } from 'react';
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
  status?: string | null;
}

interface TrackingItem {
  id: string;
  name: string;
  phone?: string | null;
  status: string;
  answeredAt?: string | null;
  totalOffered: number;
  token: string;
  isB2BActive: boolean;
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

  const { isDarkMode, mounted } = useTheme();
  const [quotation, setQuotation] = useState<QuotationInfo | null>(null);
  const [tracking, setTracking] = useState<TrackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const latestQuotationId = quotationId;

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

  const handlePublishToPortal = async (supplierId: string, supplierName: string) => {
    try {
      setPublishingId(supplierId);
      const response = await fetch(`/api/quotations/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotationId, supplierId }),
      });

      if (!response.ok) {
        throw new Error('Erro ao publicar cotação no portal.');
      }

      alert(`Cotação liberada com sucesso para ${supplierName} no portal B2B!`);
    } catch (err) {
      console.error(err);
      alert('Erro ao liberar cotação no portal.');
    } finally {
      setPublishingId(null);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-slate-950" />;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <AppHeader
        title="Acompanhamento de Cotação"
        subtitle="Monitorização em tempo real de distribuidores."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-6 sm:px-12 -mt-12 pb-20 relative z-20 space-y-8">
        
        <div>
          <Link href="/cotacoes" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 transition hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-2">
            ← Voltar para cotações
          </Link>
        </div>

        {loading ? (
          <div className={`p-12 text-center rounded-3xl shadow-2xl border ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
            <p className="text-xs font-medium opacity-60">A carregar dados de acompanhamento...</p>
          </div>
        ) : error || !quotation ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
            {error || 'Cotação não encontrada.'}
          </div>
        ) : (
          <>
            <header className={`p-8 rounded-3xl shadow-2xl border space-y-3 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/80'}`}>
              <span className="text-xs font-mono font-bold uppercase tracking-widest bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full">
                Painel Ativo
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{quotation.title}</h1>
              <div className="flex flex-wrap gap-6 text-xs opacity-70 pt-1 font-medium">
                <span>Início: <strong className="opacity-100">{formatDate(quotation.startDate)}</strong></span>
                <span>Término: <strong className="opacity-100">{formatDate(quotation.endDate)}{quotation.closingTime ? ` às ${quotation.closingTime}` : ''}</strong></span>
              </div>
            </header>

            <div className={`p-8 rounded-3xl shadow-2xl border space-y-6 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/80'}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5 border-slate-500/10">
                <div>
                  <h2 className="text-base font-black tracking-tight">Distribuidores Convidados e Parceiros B2B</h2>
                  <p className="text-xs opacity-60 mt-0.5">Liberte a cotação no painel dos parceiros ativos ou utilize o WhatsApp para o fluxo tradicional.</p>
                </div>
                <span className="text-xs font-mono font-bold opacity-70 bg-slate-500/10 px-3 py-2 rounded-xl whitespace-nowrap">
                  {tracking.length} convidados
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-950/40' : 'border-slate-200 text-slate-600 bg-slate-50/50'}`}>
                    <tr>
                      <th className="p-4 font-bold">Distribuidor / Fornecedor</th>
                      <th className="p-4 text-center font-bold">Status</th>
                      <th className="p-4 text-center font-bold">Total Oferecido</th>
                      <th className="p-4 text-right font-bold">Ações de Envio / Liberação</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                    {tracking.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-12 text-center opacity-60">
                          Nenhum distribuidor vinculado a esta cotação.
                        </td>
                      </tr>
                    ) : (
                      tracking.map((item) => {
                        const whatsUrl = getWhatsappUrl(quotation.title, item.name, item.phone || '', item.token);
                        const isAnswered = item.status === 'RESPONDIDO';

                        return (
                          <tr key={item.id} className={`transition ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/60'}`}>
                            <td className="p-4 font-semibold">
                              <div className="text-sm flex items-center gap-2">
                                {item.name}
                                {item.isB2BActive && (
                                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                    Parceiro Ativo
                                  </span>
                                )}
                              </div>
                              {item.phone && <div className="text-xs opacity-50 font-normal mt-0.5">Tel: {item.phone}</div>}
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${isAnswered ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                {isAnswered ? 'Respondido' : 'Pendente'}
                              </span>
                            </td>
                            <td className="p-4 text-center font-mono font-bold opacity-90">
                              {item.totalOffered > 0 ? `R$ ${item.totalOffered.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2.5">
                                {item.isB2BActive ? (
                                  <button
                                    onClick={() => handlePublishToPortal(item.id, item.name)}
                                    disabled={publishingId === item.id}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer"
                                  >
                                    {publishingId === item.id ? 'A publicar...' : '⚡ Publicar no Portal'}
                                  </button>
                                ) : (
                                  item.phone && (
                                    <a
                                      href={whatsUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500"
                                    >
                                      💬 Enviar WhatsApp
                                    </a>
                                  )
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </main>

      <CommandMenu 
        isOpen={isCmdOpen} 
        onClose={() => setIsCmdOpen(false)} 
        isDarkMode={isDarkMode} 
        latestQuotationId={latestQuotationId} 
      />

    </div>
  );
}