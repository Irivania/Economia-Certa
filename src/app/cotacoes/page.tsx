'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';
import { apiFetch } from '@/lib/apiClient';

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

function formatDate(value?: string | null) {
  if (!value) return '-';
  const cleanStr = String(value).split('T')[0];
  const parts = cleanStr.split('-');
  if (parts.length !== 3) return '-';
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

function formatQuotationStatus(status?: string | null) {
  const labels: Record<string, string> = {
    OPEN: 'Aberta',
    ORDERED: 'Pedidos enviados',
    PARTIALLY_CLOSED: 'Parcialmente encerrada',
    CLOSED: 'Encerrada',
  };
  return labels[status || ''] || status || 'Ativa';
}

export default function Page() {
  const { isDarkMode } = useTheme();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const latestQuotationId = quotations[0]?.id || '';

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      setIsCmdOpen((open) => !open);
    }
    if (e.key === 'Escape') {
      setIsCmdOpen(false);
      setOpenDropdownId(null);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    async function loadQuotations() {
      try {
        const response = await apiFetch('/api/quotations');
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
      const response = await apiFetch(`/api/quotations?id=${quotation.id}`, { 
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
          isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white backdrop-blur-xl' : 'bg-white/90 border-slate-200/80 text-slate-900 shadow-slate-200/50 backdrop-blur-xl'
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
              <Link href="/cotacoes/nova" className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs font-extrabold text-white transition-all shadow-lg shadow-emerald-600/25 active:scale-95">
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
                      isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-950/40' : 'border-slate-200 text-slate-500 bg-slate-50/90'
                    }`}>
                      <th className="p-5 font-extrabold min-w-[220px]">Título / Pagamento</th>
                      <th className="p-5 text-center font-extrabold">Início</th>
                      <th className="p-5 text-center font-extrabold">Término & Fecho</th>
                      <th className="p-5 font-extrabold min-w-[260px]">Fornecedores Convidados</th>
                      <th className="p-5 text-center font-extrabold">Status</th>
                      <th className="p-5 text-right font-extrabold min-w-[200px]">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-500/10">
                    {quotations.map((quotation) => (
                      <tr key={quotation.id} className={`group transition-all align-middle ${isDarkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50/90'}`}>
                        <td className="p-5">
                          <div className="font-bold text-sm tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">{quotation.title}</div>
                          {quotation.paymentTerms && (
                            <div className="mt-1 text-[11px] opacity-70">
                              Pagamento: <strong className="font-mono">{quotation.paymentTerms}</strong>
                            </div>
                          )}
                        </td>
                        <td className="p-5 text-center font-mono opacity-80 text-xs">
                          {formatDate(quotation.startDate)}
                        </td>
                        <td className="p-5 text-center font-mono opacity-80 text-xs">
                          <div>{formatDate(quotation.endDate)}</div>
                          {quotation.closingTime && <div className="text-[10px] opacity-60 font-sans">às {quotation.closingTime}</div>}
                        </td>
                        <td className="p-5">
                          {quotation.suppliers && quotation.suppliers.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {quotation.suppliers.map((sup, idx) => (
                                <span
                                  key={idx}
                                  className={`inline-block rounded-xl px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                                    sup.status === 'RESPONDIDO'
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm'
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
                        <td className="p-5 text-center">
                          <span className="inline-flex rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
                            {formatQuotationStatus(quotation.status)}
                          </span>
                        </td>
                        <td className="p-5 text-right relative">
                          {/* Layout Moderno: Botão de Ação Direta + Menu Contextual (...) */}
                          <div className="flex items-center justify-end gap-2">
                            
                            {/* Ação Principal: Mapa de Respostas */}
                            <Link 
                              href={`/cotacoes/respostas/${quotation.id}`} 
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 active:scale-95"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span>Respostas</span>
                            </Link>

                            {/* Gatilho do Menu Mais Opções (...) */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setOpenDropdownId(openDropdownId === quotation.id ? null : quotation.id)}
                                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                                  isDarkMode 
                                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                                }`}
                                title="Mais opções"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </button>

                              {/* Dropdown Flutuante Estilizado */}
                              {openDropdownId === quotation.id && (
                                <div 
                                  ref={dropdownRef}
                                  className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl border py-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                                    isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                                  }`}
                                >
                                  <Link
                                    href={`/cotacoes/acompanhar/${quotation.id}`}
                                    onClick={() => setOpenDropdownId(null)}
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold hover:bg-slate-500/10 transition-colors"
                                  >
                                    <svg className="w-4 h-4 opacity-75" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Acompanhar / Enviar
                                  </Link>

                                  <Link
                                    href={`/cotacoes/pedidos/${quotation.id}`}
                                    onClick={() => setOpenDropdownId(null)}
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold hover:bg-slate-500/10 transition-colors"
                                  >
                                    <svg className="w-4 h-4 opacity-75" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    Ver Pedidos
                                  </Link>

                                  <Link
                                    href={`/cotacoes/editar/${quotation.id}`}
                                    onClick={() => setOpenDropdownId(null)}
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Editar Cotação
                                  </Link>

                                  <div className="my-1 border-t border-slate-500/15" />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      handleDelete(quotation);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 2 0 00-1-1h-4a1 2 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Excluir Cotação
                                  </button>
                                </div>
                              )}
                            </div>

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