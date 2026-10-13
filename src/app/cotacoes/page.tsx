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
    CANCELLED: 'Cancelada',
  };
  return labels[status || ''] || status || 'Ativa';
}

export default function QuotationsPage() {
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

  async function handleCancel(quotation: Quotation) {
      if (!confirm(`Deseja cancelar a cotação "${quotation.title}"? O representante não poderá mais acessá-la, mas o histórico será preservado.`)) return;

      try {
        const response = await apiFetch('/api/quotations', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: quotation.id, action: 'cancel' }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Não foi possível cancelar a cotação.');
        setQuotations((current) => current.map((item) =>
          item.id === quotation.id
            ? { ...item, status: 'CANCELLED', suppliers: item.suppliers?.map((supplier) => ({ ...supplier, status: 'CANCELLED' })) }
            : item,
        ));
      } catch (error) {
        console.error('Erro ao cancelar cotação:', error);
        alert(error instanceof Error ? error.message : 'Não foi possível cancelar a cotação.');
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20 relative z-25 space-y-6">
        
        {/* Cartão Principal da Listagem de Cotações */}
        <div className={`rounded-xl border p-6 sm:p-7 shadow-xs transition-all space-y-5 ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white backdrop-blur-md' : 'bg-white border-slate-200/90 text-slate-900 backdrop-blur-md'
        }`}>
          
          {/* Cabeçalho do Cartão */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-5 border-b border-slate-100 dark:border-slate-800 gap-4">
            <div>
              <span className="inline-flex rounded-md bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-500 border border-amber-500/15 mb-2">
                Gestão Comercial
              </span>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg md:text-xl font-bold tracking-tight">Cotações Cadastradas</h1>
                <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15">
                  {quotations.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Acompanhe, revise e gerencie suas cotações e o envio para os distribuidores.</p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/" className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1">
                &larr; Voltar ao Início
              </Link>
              <Link href="/cotacoes/nova" className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-all shadow-xs active:scale-95">
                + Nova Cotação
              </Link>
            </div>
          </div>

          {/* Tabela de Cotações */}
          <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            {loading ? (
              <p className="px-6 py-12 text-center text-xs text-slate-500 font-medium">Carregando cotações...</p>
            ) : quotations.length === 0 ? (
              <p className="px-6 py-12 text-center text-xs text-slate-500 font-medium">Nenhuma cotação cadastrada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className={`border-b uppercase tracking-wider text-[11px] font-bold ${
                      isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-950/50' : 'border-slate-200 text-slate-500 bg-slate-50/90'
                    }`}>
                      <th className="p-4 font-bold min-w-[200px]">Título / Pagamento</th>
                      <th className="p-4 text-center font-bold">Início</th>
                      <th className="p-4 text-center font-bold">Término & Fecho</th>
                      <th className="p-4 font-bold min-w-[240px]">Fornecedores Convidados</th>
                      <th className="p-4 text-center font-bold">Status</th>
                      <th className="p-4 text-right font-bold min-w-[180px]">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {quotations.map((quotation) => (
                      <tr key={quotation.id} className={`group transition-all align-middle ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}`}>
                        <td className="p-4">
                          <div className="font-semibold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{quotation.title}</div>
                          {quotation.paymentTerms && (
                            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                              Pagamento: <strong className="font-mono">{quotation.paymentTerms}</strong>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center font-mono text-slate-600 dark:text-slate-400 text-xs">
                          {formatDate(quotation.startDate)}
                        </td>
                        <td className="p-4 text-center font-mono text-slate-600 dark:text-slate-400 text-xs">
                          <div>{formatDate(quotation.endDate)}</div>
                          {quotation.closingTime && <div className="text-[10px] text-slate-400 font-sans">às {quotation.closingTime}</div>}
                        </td>
                        <td className="p-4">
                          {quotation.suppliers && quotation.suppliers.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {quotation.suppliers.map((sup, idx) => (
                                <span
                                  key={idx}
                                  className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-all ${
                                    sup.status === 'RESPONDIDO'
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
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
                          <span className="inline-flex rounded-md bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {formatQuotationStatus(quotation.status)}
                          </span>
                        </td>
                        <td className="p-4 text-right relative">
                          <div className="flex items-center justify-end gap-2">
                            
                            {/* Ação Principal: Respostas */}
                            <Link 
                              href={`/cotacoes/respostas/${quotation.id}`} 
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-xs active:scale-95"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span>Respostas</span>
                            </Link>

                            {/* Menu Contextual (...) */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setOpenDropdownId(openDropdownId === quotation.id ? null : quotation.id)}
                                className={`p-2 rounded-lg border transition-all cursor-pointer ${
                                  isDarkMode 
                                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                                }`}
                                title="Mais opções"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </button>

                              {openDropdownId === quotation.id && (
                                <div 
                                  ref={dropdownRef}
                                  className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl border py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                                    isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                                  }`}
                                >
                                  <Link
                                    href={`/cotacoes/acompanhar/${quotation.id}`}
                                    onClick={() => setOpenDropdownId(null)}
                                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium hover:bg-slate-500/10 transition-colors"
                                  >
                                    Acompanhar / Enviar
                                  </Link>

                                  <Link
                                    href={`/cotacoes/pedidos/${quotation.id}`}
                                    onClick={() => setOpenDropdownId(null)}
                                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium hover:bg-slate-500/10 transition-colors"
                                  >
                                    Ver Pedidos
                                  </Link>

                                  <Link
                                    href={`/cotacoes/editar/${quotation.id}`}
                                    onClick={() => setOpenDropdownId(null)}
                                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
                                  >
                                    Editar Cotação
                                  </Link>

                                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      if (quotation.status === 'CANCELLED') return;
                                      handleCancel(quotation);
                                    }}
                                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                                  >
                                    {quotation.status === 'CANCELLED' ? 'Cotação Cancelada' : 'Cancelar Cotação'}
                                  </button>

                                  {quotation.status !== 'CANCELLED' && (!quotation.suppliers || quotation.suppliers.every((supplier) => !['ENVIADO', 'RESPONDIDO'].includes(supplier.status))) && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenDropdownId(null);
                                        handleDelete(quotation);
                                      }}
                                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-500 hover:bg-slate-500/10 transition-colors text-left cursor-pointer"
                                    >
                                      Excluir Cotação
                                    </button>
                                  )}
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