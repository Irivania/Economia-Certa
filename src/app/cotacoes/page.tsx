'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';

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

export default function Page() {
  const { isDarkMode } = useTheme();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const latestQuotationId = quotations[0]?.id || 'd7f46ae7-19c2-409d-8ab4-dfbb458c5248';

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      setIsCmdOpen((open) => !open);
    }
    if (e.key === 'Escape') {
      setIsCmdOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* HEADER GLOBAL UNIFICADO */}
      <AppHeader
        title="Economia Certa"
        subtitle="Painel gerencial inteligente e controle de compras em tempo real."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 -mt-12 pb-20 relative z-25 space-y-8">
        
        {/* Cartão Principal da Listagem de Cotações */}
        <div className={`rounded-3xl border p-8 shadow-2xl transition-all space-y-6 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900 shadow-slate-200/50'
        }`}>
          
          {/* Cabeçalho do Cartão */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-500/10 gap-4">
            <div>
              <span className="inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-500 border border-amber-500/20 mb-2">
                Gestão Comercial
              </span>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-black tracking-tight">Cotações Cadastradas</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {quotations.length}
                </span>
              </div>
              <p className="text-xs opacity-60 mt-1 font-medium">Acompanhe, revise e gerencie suas cotações e o envio para os distribuidores.</p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/" className="text-xs font-bold opacity-70 hover:opacity-100 transition flex items-center gap-1.5">
                &larr; Voltar ao Início
              </Link>
              <Link href="/cotacoes/nova" className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs font-extrabold text-white transition-all shadow-lg shadow-emerald-600/25">
                + Nova Cotação
              </Link>
            </div>
          </div>

          {/* Tabela de Cotações */}
          <div className="overflow-hidden rounded-2xl border border-slate-500/10 shadow-sm">
            {loading ? (
              <p className="px-6 py-16 text-center text-xs opacity-50 font-medium">Carregando cotações...</p>
            ) : quotations.length === 0 ? (
              <p className="px-6 py-16 text-center text-xs opacity-50 font-medium">Nenhuma cotação cadastrada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className={`border-b uppercase tracking-wider text-[11px] font-extrabold ${
                      isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-950/30' : 'border-slate-200 text-slate-500 bg-slate-50/80'
                    }`}>
                      <th className="p-4 font-extrabold min-w-[220px]">Título / Pagamento</th>
                      <th className="p-4 text-center font-extrabold">Início</th>
                      <th className="p-4 text-center font-extrabold">Término & Fecho</th>
                      <th className="p-4 font-extrabold min-w-[260px]">Fornecedores Convidados</th>
                      <th className="p-4 text-center font-extrabold">Status</th>
                      <th className="p-4 text-center font-extrabold min-w-[280px]">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-500/10">
                    {quotations.map((quotation) => (
                      <tr key={quotation.id} className={`transition-colors align-middle ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}`}>
                        <td className="p-4">
                          <div className="font-bold text-sm tracking-tight">{quotation.title}</div>
                          {quotation.paymentTerms && (
                            <div className="mt-1 text-[11px] opacity-70">
                              Pagamento: <strong className="font-mono">{quotation.paymentTerms}</strong>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center font-mono opacity-80 text-xs">
                          {formatDate(quotation.startDate)}
                        </td>
                        <td className="p-4 text-center font-mono opacity-80 text-xs">
                          <div>{formatDate(quotation.endDate)}</div>
                          {quotation.closingTime && <div className="text-[10px] opacity-60">às {quotation.closingTime}</div>}
                        </td>
                        <td className="p-4">
                          {quotation.suppliers && quotation.suppliers.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {quotation.suppliers.map((sup, idx) => (
                                <span
                                  key={idx}
                                  className={`inline-block rounded-xl px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                                    sup.status === 'RESPONDIDO'
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                      : 'bg-slate-500/10 opacity-75 border border-slate-500/20'
                                  }`}
                                  title={`Status: ${sup.status}`}
                                >
                                  {sup.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs opacity-40 italic">Nenhum fornecedor vinculado</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {quotation.status === 'OPEN' ? 'Aberta' : quotation.status || 'Ativa'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Link href={`/cotacoes/pedidos/${quotation.id}`} title="Ver Pedidos" className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-extrabold transition-all">📦</Link>
                            <Link href={`/cotacoes/acompanhar/${quotation.id}`} title="Acompanhar / Enviar" className="p-2 rounded-xl bg-slate-500/10 opacity-80 hover:opacity-100 hover:bg-slate-500/20 font-extrabold transition-all">📊</Link>
                            <Link href={`/cotacoes/respostas/${quotation.id}`} title="Respostas" className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 font-extrabold transition-all">💬</Link>
                            <Link href={`/cotacoes/editar/${quotation.id}`} title="Editar" className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-extrabold transition-all">✏️</Link>
                            <button type="button" onClick={() => handleDelete(quotation)} title="Excluir" className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-extrabold transition-all cursor-pointer">🗑️</button>
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

      </main>

      {/* MENU DE COMANDOS */}
      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId={latestQuotationId} />

    </div>
  );
}