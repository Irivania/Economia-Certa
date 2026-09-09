'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';

interface TrackingSupplier {
  id: string;
  name: string;
  phone?: string | null;
  status: 'RESPONDIDO' | 'PENDENTE';
  answeredAt?: string | null;
  totalOffered: number;
  token: string;
}

interface QuotationTrackingData {
  id: string;
  title: string;
  startDate?: string | null;
  endDate?: string | null;
  closingTime?: string | null;
  status?: string | null;
}

export default function QuotationTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const quotationId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [quotation, setQuotation] = useState<QuotationTrackingData | null>(null);
  const [suppliersTracking, setSuppliersTracking] = useState<TrackingSupplier[]>([]);
  const [timeLeft, setTimeLeft] = useState<string>('Calculando...');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/quotations/${quotationId}/tracking`);
        if (res.ok) {
          const data = await res.json();
          setQuotation(data.quotation);
          setSuppliersTracking(data.tracking);
        }
      } catch (err) {
        console.error('Erro ao carregar acompanhamento:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [quotationId]);

  // Cronômetro regressivo para o término da cotação
  useEffect(() => {
    if (!quotation?.endDate) return;

    const targetDateStr = `${quotation.endDate}T${quotation.closingTime || '18:00'}:00`;
    const targetTime = new Date(targetDateStr).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft('Cotação Encerrada');
        clearInterval(timer);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft(`${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [quotation]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Carregando painel de acompanhamento...</div>;
  }

  const answeredCount = suppliersTracking.filter(s => s.status === 'RESPONDIDO').length;
  const pendingCount = suppliersTracking.length - answeredCount;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Voltar */}
        <div>
          <Link href="/cotacoes" className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition">
            ← Voltar para listagem de cotações
          </Link>
        </div>

        {/* Cabeçalho e Cronômetro */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Painel de Monitoramento Automático
            </span>
            <h1 className="text-xl font-bold text-slate-800 mt-2">{quotation?.title}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Acompanhamento em tempo real dos representantes convidados.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 px-4 py-3 rounded-lg text-right shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Tempo Restante para Encerramento</p>
            <p className="text-lg font-mono font-bold text-amber-900">{timeLeft}</p>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total de Convidados</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{suppliersTracking.length}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Já Responderam</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{answeredCount}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Faltam Responder (Pendentes)</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          </div>
        </div>

        {/* Tabela de Representantes / Fornecedores */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Status dos Representantes</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold">Representante / Fornecedor</th>
                  <th className="p-4 font-semibold">Contato (WhatsApp)</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Valor Ofertado</th>
                  <th className="p-4 font-semibold text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliersTracking.map((sup) => {
                  const isAnswered = sup.status === 'RESPONDIDO';
                  return (
                    <tr key={sup.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-bold text-slate-800">{sup.name}</td>
                      <td className="p-4 text-slate-600 font-mono">{sup.phone || 'Não informado'}</td>
                      <td className="p-4">
                        {isAnswered ? (
                          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                            ✅ Respondido
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                            ⏳ Pendente
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-slate-700">
                        {isAnswered ? `R$ ${sup.totalOffered.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {isAnswered ? (
                          <Link
                            href={`/cotacoes/respostas/${quotationId}`}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg transition"
                          >
                            👁️ Ver Resposta
                          </Link>
                        ) : (
                          <a
                            href={`https://wa.me/55${(sup.phone || '').replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(sup.name)},%20passando%20para%20lembrar%20de%20enviar%20sua%20resposta%20da%20cotação!`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg transition inline-block"
                          >
                            💬 Cobrar no WhatsApp
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}