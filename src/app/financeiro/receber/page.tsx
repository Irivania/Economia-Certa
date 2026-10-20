'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { getCompanyId } from '@/lib/companySession';
import { apiFetch } from '@/lib/apiClient';
import { DollarSign, CheckCircle2, Plus } from 'lucide-react';

interface ReceivableItem {
  id: string;
  customerName: string;
  invoiceNumber: string | null;
  amount: string;
  dueDate: string;
  status: string;
  receivedAt: string | null;
}

export default function AccountsReceivablePage() {
  const { isDarkMode } = useTheme();
  const companyId = getCompanyId();

  const [receivables, setReceivables] = useState<ReceivableItem[]>([]);
  const [summary, setSummary] = useState({ totalReceivablePending: 0, totalPayablePending: 0, netCashFlow: 0 });
  const [loading, setLoading] = useState(true);

  // Estados do Modal de Novo Recebível
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchReceivables() {
      if (!companyId) return;
      try {
        setLoading(true);
        const res = await apiFetch(`/api/financeiro/receber?companyId=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            setReceivables(data.receivables);
            setSummary(data.summary);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar contas a receber:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchReceivables();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const handleCreateReceivable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !amount || !dueDate) return;

    try {
      const res = await apiFetch('/api/financeiro/receber', {
        method: 'POST',
        body: JSON.stringify({ companyId, customerName, invoiceNumber, amount, dueDate }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Conta a receber registada com sucesso!');
        setIsModalOpen(false);
        setCustomerName('');
        setInvoiceNumber('');
        setAmount('');
        setDueDate('');
        
        // Recarregar dados após inclusão
        const reloadRes = await apiFetch(`/api/financeiro/receber?companyId=${companyId}`);
        if (reloadRes.ok) {
          const reloadData = await reloadRes.json();
          if (reloadData.success) {
            setReceivables(reloadData.receivables);
            setSummary(reloadData.summary);
          }
        }
      } else {
        alert(data.error || 'Erro ao criar registo.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão.');
    }
  };

  const handleReceive = async (id: string) => {
    if (!confirm('Deseja confirmar o recebimento deste valor e dar baixa?')) return;
    try {
      const res = await apiFetch('/api/financeiro/receber', {
        method: 'PUT',
        body: JSON.stringify({ id, action: 'RECEIVE' }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        const reloadRes = await apiFetch(`/api/financeiro/receber?companyId=${companyId}`);
        if (reloadRes.ok) {
          const reloadData = await reloadRes.json();
          if (reloadData.success) {
            setReceivables(reloadData.receivables);
            setSummary(reloadData.summary);
          }
        }
      } else {
        alert(data.error || 'Erro ao dar baixa.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão.');
    }
  };

  const formatMoney = (val: number) => Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Contas a Receber & Visão de Tesouraria"
        subtitle="Controle dual de entradas (recebíveis e convênios) e saídas (fornecedores)."
        onOpenCmd={() => {}}
      />

      <main className="max-w-6xl mx-auto px-6 -mt-8 pb-20 relative z-20 space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="font-bold text-xs bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 inline-flex items-center gap-2">
            &larr; Voltar ao Início
          </Link>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> + Nova Conta a Receber
          </button>
        </div>

        {/* Painel Financeiro Dual (Cards de Resumo) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-6 rounded-3xl border shadow-xl space-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-black uppercase tracking-wider opacity-60 block">Total a Receber (Pendente)</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatMoney(summary.totalReceivablePending)}
            </div>
            <p className="text-[11px] opacity-50 font-mono">Faturas e convênios em aberto</p>
          </div>

          <div className={`p-6 rounded-3xl border shadow-xl space-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-black uppercase tracking-wider opacity-60 block">Total a Pagar (Fornecedores)</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {formatMoney(summary.totalPayablePending)}
            </div>
            <p className="text-[11px] opacity-50 font-mono">Boletos e contas pendentes</p>
          </div>

          <div className={`p-6 rounded-3xl border shadow-xl space-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-black uppercase tracking-wider opacity-60 block">Saldo Projetado de Tesouraria</span>
            <div className={`text-2xl font-black font-mono ${summary.netCashFlow >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600'}`}>
              {formatMoney(summary.netCashFlow)}
            </div>
            <p className="text-[11px] opacity-50 font-mono">Balanço líquido projetado</p>
          </div>
        </div>

        {/* Tabela de Contas a Receber */}
        <div className={`p-8 rounded-3xl border shadow-xl space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 border-b pb-4 border-slate-500/10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">Extrato de Contas a Receber</h3>
              <p className="text-xs opacity-60">Gestão de títulos, clientes e faturas de convênios a receber.</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs opacity-50 font-mono">A carregar recebíveis...</div>
          ) : receivables.length === 0 ? (
            <div className="py-12 text-center text-xs opacity-40 font-mono">Nenhuma conta a receber registada.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b uppercase tracking-wider text-[10px] font-extrabold opacity-60 border-slate-500/10">
                    <th className="p-3">Cliente / Empresa</th>
                    <th className="p-3">Documento / Fatura</th>
                    <th className="p-3">Vencimento</th>
                    <th className="p-3">Valor (R$)</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-500/10 text-xs">
                  {receivables.map((rec) => {
                    const isPending = rec.status === 'PENDING';
                    return (
                      <tr key={rec.id} className="hover:bg-slate-500/5 transition">
                        <td className="p-3 font-sans font-bold">{rec.customerName}</td>
                        <td className="p-3 opacity-80">{rec.invoiceNumber || 'N/A'}</td>
                        <td className="p-3">{new Date(rec.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                        <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">R$ {Number(rec.amount).toFixed(2)}</td>
                        <td className="p-3">
                          {isPending ? (
                            <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-extrabold text-[10px] uppercase">Pendente</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-extrabold text-[10px] uppercase">Recebido</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleReceive(rec.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] transition cursor-pointer inline-flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Dar Baixa
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal para Adicionar Conta a Receber */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-sm font-black uppercase tracking-wider">Registar Nova Conta a Receber</h3>
            
            <form onSubmit={handleCreateReceivable} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">Cliente / Empresa Conveniada</label>
                <input
                  type="text"
                  placeholder="Nome do cliente ou empresa"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-950 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">Número do Documento / Fatura</label>
                <input
                  type="text"
                  placeholder="Ex: FAT-2026-001"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-950 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-950 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">Data de Vencimento</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-950 font-mono outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-500/30 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md cursor-pointer"
                >
                  Salvar Registo ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}