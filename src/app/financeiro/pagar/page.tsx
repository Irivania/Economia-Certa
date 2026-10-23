'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { getCompanyId } from '@/lib/companySession';
import { apiFetch } from '@/lib/apiClient';
import { FinanceStatsCards } from '@/components/financeiro/FinanceStatsCards';
import { FinancePayableFilterBar } from '@/components/financeiro/FinancePayableFilterBar';
import { FinancePayableModal } from '@/components/financeiro/FinancePayableModal';

interface TitlePayable {
  id: string;
  supplierName: string;
  invoiceNumber: string | null;
  installmentNumber: number;
  amount: string;
  dueDate: string;
  status: 'PENDING' | 'PAID';
  paidAt: string | null;
}

export default function FinancePayablePage() {
  const { isDarkMode } = useTheme();
  const companyId = getCompanyId();

  const [titles, setTitles] = useState<TitlePayable[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Configurar por defeito o mês atual (do dia 1º até ao último dia do mês)
  const todayObj = new Date();
  const year = todayObj.getFullYear();
  const month = todayObj.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonth);
  const [activePreset, setActivePreset] = useState<'all' | 'today' | 'week' | 'month' | 'overdue'>('month');
  
  // Modal de Adicionar Título Manual
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState('');
  const [newInvoice, setNewInvoice] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const loadTitles = useCallback(async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const res = await apiFetch(`/api/finance/payable?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setTitles(data);
      }
    } catch (err) {
      console.error('Erro ao carregar contas a pagar:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    let isMounted = true;

    async function fetchPayables() {
      if (!companyId) return;
      try {
        setLoading(true);
        const res = await apiFetch(`/api/finance/payable?companyId=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data)) setTitles(data);
        }
      } catch (err) {
        console.error('Erro ao carregar contas a pagar:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPayables();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const handleTogglePay = async (id: string, currentStatus: string) => {
    const action = currentStatus === 'PAID' ? 'unpay' : 'pay';
    const msg = action === 'pay' ? 'Deseja confirmar a baixa deste boleto como PAGO?' : 'Deseja reabrir este título?';
    if (!confirm(msg)) return;

    try {
      const res = await apiFetch('/api/finance/payable', {
        method: 'PUT',
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar status.');
      await loadTitles();
    } catch (err) {
      console.error(err);
      alert('Não foi possível atualizar o título.');
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier || !newAmount || !newDueDate) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const res = await apiFetch('/api/finance/payable', {
        method: 'POST',
        body: JSON.stringify({
          companyId,
          supplierName: newSupplier,
          invoiceNumber: newInvoice,
          amount: newAmount,
          dueDate: newDueDate,
          installmentNumber: 1,
        }),
      });

      if (!res.ok) throw new Error('Erro ao criar título.');

      setNewSupplier('');
      setNewInvoice('');
      setNewAmount('');
      setNewDueDate('');
      setIsModalOpen(false);
      await loadTitles();
    } catch (err) {
      console.error(err);
      alert('Erro ao registar título.');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSendWhatsAppAlert = () => {
    const criticalTitles = titles.filter((t) => {
      const due = t.dueDate.split('T')[0];
      return t.status === 'PENDING' && due <= todayStr;
    });

    if (criticalTitles.length === 0) {
      alert('Parabéns! Não existem boletos vencidos ou vencendo hoje.');
      return;
    }

    let text = `🚨 *ALERTA FINANCEIRO - ECONOMIA CERTA* 🚨\n`;
    text += `Olá Gestor(a), existem *${criticalTitles.length} títulos* que exigem atenção imediata (vencidos ou vencendo hoje):\n\n`;

    criticalTitles.forEach((t, i) => {
      const due = t.dueDate.split('T')[0];
      const statusLabel = due < todayStr ? '⚠️ VENCIDO' : '⚠️ VENCE HOJE';
      text += `${i + 1}. *${t.supplierName}* | ${statusLabel}\n`;
      text += `   Valor: R$ ${Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      text += `   Vencimento: ${new Date(t.dueDate).toLocaleDateString('pt-BR')}\n\n`;
    });

    text += `Aceda ao ERP para efetuar as baixas e evitar multas.`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const setPresetFilter = (preset: 'all' | 'today' | 'week' | 'month' | 'overdue') => {
    setActivePreset(preset);
    const now = new Date();
    const yr = now.getFullYear();
    const mth = now.getMonth();

    if (preset === 'today') {
      const dt = now.toISOString().split('T')[0];
      setStartDate(dt);
      setEndDate(dt);
    } else if (preset === 'week') {
      const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
      const lastDay = new Date(now.setDate(now.getDate() + 6));
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
    } else if (preset === 'month') {
      const firstDay = new Date(yr, mth, 1);
      const lastDay = new Date(yr, mth + 1, 0);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
    } else if (preset === 'all') {
      setStartDate(`${yr}-01-01`);
      setEndDate(`${yr + 1}-12-31`);
    }
  };

  const filteredTitles = titles.filter((t) => {
    const due = t.dueDate.split('T')[0];
    if (activePreset === 'overdue') {
      return t.status === 'PENDING' && due < todayStr;
    }
    return due >= startDate && due <= endDate;
  });

  const totalPendente = titles
    .filter((t) => t.status === 'PENDING')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const totalVencido = titles
    .filter((t) => t.status === 'PENDING' && t.dueDate.split('T')[0] < todayStr)
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const countAlerts = titles.filter((t) => t.status === 'PENDING' && t.dueDate.split('T')[0] <= todayStr).length;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Gestão de Contas a Pagar & Boletos"
        subtitle="Controle de títulos, vencimentos de distribuidores e baixas de pagamentos."
        onOpenCmd={() => {}}
      />

      <main className="max-w-7xl mx-auto px-6 -mt-8 pb-20 relative z-20 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link href="/" className="font-bold text-xs bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 inline-flex items-center gap-2">
            &larr; Voltar ao Início
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSendWhatsAppAlert}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center gap-2"
            >
              📲 Alerta WhatsApp ({countAlerts} Urgentes)
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/25 transition cursor-pointer"
            >
              + Registar Título / Boleto
            </button>
          </div>
        </div>

        <FinanceStatsCards
          totalPendente={totalPendente}
          totalVencido={totalVencido}
          isDarkMode={isDarkMode}
        />

        <FinancePayableFilterBar
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onApplyFilter={() => {
            setActivePreset('all');
          }}
          activePreset={activePreset}
          setPresetFilter={setPresetFilter}
          totalCount={titles.length}
          isDarkMode={isDarkMode}
        />

        {/* Tabela de Contas a Pagar */}
        <div className={`p-8 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          {loading ? (
            <p className="text-center py-12 text-xs opacity-50">Carregando títulos financeiros...</p>
          ) : filteredTitles.length === 0 ? (
            <p className="text-center py-12 text-xs opacity-50">Nenhum título encontrado para o período selecionado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b uppercase tracking-wider text-[11px] font-extrabold opacity-60 border-slate-500/10">
                    <th className="p-3">Fornecedor / Distribuidora</th>
                    <th className="p-3 text-center">Nota / Parcela</th>
                    <th className="p-3 text-center">Vencimento</th>
                    <th className="p-3 text-right">Valor (R$)</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-500/10 font-mono">
                  {filteredTitles.map((t) => {
                    const dueStr = t.dueDate.split('T')[0];
                    const isOverdue = t.status === 'PENDING' && dueStr < todayStr;
                    const isDueToday = t.status === 'PENDING' && dueStr === todayStr;

                    return (
                      <tr key={t.id} className="hover:bg-slate-500/5 transition">
                        <td className="p-3 font-sans font-bold">{t.supplierName}</td>
                        <td className="p-3 text-center">
                          {t.invoiceNumber ? (
                            t.invoiceNumber.includes('/') 
                              ? `NF ${t.invoiceNumber.split('/')[0]} / Parcela Nº ${t.invoiceNumber.split('/')[1]}`
                              : `NF ${t.invoiceNumber.replace(' - ', ' / ')}`
                          ) : 'Avulso'}
                        </td>
                        <td className={`p-3 text-center font-bold ${isOverdue ? 'text-rose-600 dark:text-rose-400' : isDueToday ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                          {new Date(t.dueDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-3 text-right font-bold text-sm">
                          R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center font-sans">
                          {t.status === 'PAID' ? (
                            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              ✓ Pago
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 border border-rose-500/20 animate-pulse">
                              🚨 Vencido
                            </span>
                          ) : isDueToday ? (
                            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              ⚠️ Vence Hoje
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                              ⏳ Em Aberto
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center font-sans">
                          <button
                            type="button"
                            onClick={() => handleTogglePay(t.id, t.status)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                              t.status === 'PAID'
                                ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 hover:bg-slate-500/20'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                            }`}
                          >
                            {t.status === 'PAID' ? '↩ Reabrir Título' : '💳 Dar Baixa (Pagar)'}
                          </button>
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

      <FinancePayableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateManual}
        newSupplier={newSupplier}
        setNewSupplier={setNewSupplier}
        newInvoice={newInvoice}
        setNewInvoice={setNewInvoice}
        newAmount={newAmount}
        setNewAmount={setNewAmount}
        newDueDate={newDueDate}
        setNewDueDate={setNewDueDate}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}