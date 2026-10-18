'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { getCompanyId } from '@/lib/companySession';
import { apiFetch } from '@/lib/apiClient';
import { Printer } from 'lucide-react';
import { ConvenioInvoicePrintModal } from '@/components/financeiro/ConvenioInvoicePrintModal';

interface PartnerItem {
  id: string;
  type: 'EMPLOYEE' | 'COMPANY_PARTNER';
  name: string;
  document: string | null;
  phone: string | null;
  currentBalance: string;
  creditLimit: string;
}

interface SaleRecord {
  id: string;
  operatorName: string;
  customerName: string | null;
  total: string;
  paymentMethod: string;
  createdAt: string;
}

export default function ConvenioBillingPage() {
  const { isDarkMode } = useTheme();
  const companyId = getCompanyId();

  const [companiesList, setCompaniesList] = useState<PartnerItem[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [billingData, setBillingData] = useState<{ partner: PartnerItem; employees: PartnerItem[]; sales: SaleRecord[] } | null>(null);
  const [loading, setLoading] = useState(false);

  // Estado para abrir o Modal de Impressão B2B
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchCompanies() {
      if (!companyId) return;
      try {
        const res = await apiFetch(`/api/partners?companyId=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data)) {
            setCompaniesList(data.filter((p: PartnerItem) => p.type === 'COMPANY_PARTNER'));
          }
        }
      } catch (err) {
        console.error('Erro ao carregar empresas parceiras:', err);
      }
    }

    fetchCompanies();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const handleFetchBilling = async (partnerId: string) => {
    if (!partnerId) {
      setBillingData(null);
      return;
    }
    setSelectedCompanyId(partnerId);
    try {
      setLoading(true);
      const res = await apiFetch(`/api/partners/billing?companyId=${companyId}&partnerId=${partnerId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBillingData({ partner: data.partner, employees: data.employees, sales: data.sales });
        }
      }
    } catch (err) {
      console.error('Erro ao buscar faturamento:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettleInvoice = async () => {
    if (!selectedCompanyId) return;
    if (!confirm('Deseja confirmar o recebimento desta fatura e zerar o saldo devedor do convênio?')) return;

    try {
      const res = await apiFetch('/api/partners/billing', {
        method: 'POST',
        body: JSON.stringify({ companyId, partnerId: selectedCompanyId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        handleFetchBilling(selectedCompanyId);
      } else {
        alert(data.error || 'Erro ao processar baixa.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao baixar fatura.');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Fechamento Mensal de Convênios B2B"
        subtitle="Consolidação de faturas corporativas, extrato de funcionários e baixa de pagamentos."
        onOpenCmd={() => {}}
      />

      <main className="max-w-6xl mx-auto px-6 -mt-8 pb-20 relative z-20 space-y-6">
        <div>
          <Link href="/financeiro/convenios" className="font-bold text-xs bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 inline-flex items-center gap-2">
            &larr; Voltar à Gestão de Convênios
          </Link>
        </div>

        {/* Seleção da Empresa Parceira */}
        <div className={`p-6 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className="text-sm font-black uppercase tracking-wider mb-3">Selecione a Empresa Parceira para Faturamento</h3>
          <select
            value={selectedCompanyId}
            onChange={(e) => handleFetchBilling(e.target.value)}
            className="w-full px-4 py-3 text-xs border rounded-2xl bg-slate-50 dark:bg-slate-950 font-bold font-mono outline-none"
          >
            <option value="">-- Escolher Empresa Parceira --</option>
            {companiesList.map((comp) => (
              <option key={comp.id} value={comp.id}>
                🏢 {comp.name} (Saldo Devedor: R$ {Number(comp.currentBalance || 0).toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        {/* Extrato e Detalhes da Fatura */}
        {loading ? (
          <div className={`p-12 text-center rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <p className="text-xs opacity-50">Carregando extrato do convênio...</p>
          </div>
        ) : billingData && (
          <div className={`p-8 rounded-3xl border shadow-xl space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-slate-500/10">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Fatura Corporativa</span>
                <h2 className="text-lg font-black">{billingData.partner.name}</h2>
                <p className="text-xs opacity-60 font-mono">CNPJ: {billingData.partner.document || 'N/A'}</p>
              </div>

              <div className="text-right font-mono">
                <span className="text-xs opacity-60 uppercase font-bold block">Total da Fatura Atual</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  R$ {Number(billingData.partner.currentBalance || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Listagem de Compras Realizadas */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider opacity-70">Extrato de Vendas do Período ({billingData.sales.length} transações)</h4>
              
              {billingData.sales.length === 0 ? (
                <p className="text-center py-8 text-xs opacity-40 font-mono">Nenhuma compra pendente registada para este convênio no momento.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="border-b uppercase tracking-wider text-[11px] font-extrabold opacity-60 border-slate-500/10">
                        <th className="p-3">ID da Venda</th>
                        <th className="p-3">Data e Hora</th>
                        <th className="p-3">Funcionário / Cliente</th>
                        <th className="p-3 text-right">Valor (R$)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-500/10">
                      {billingData.sales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-500/5 transition">
                          <td className="p-3 font-bold">{sale.id.substring(0, 8)}...</td>
                          <td className="p-3 opacity-75">{new Date(sale.createdAt).toLocaleString('pt-BR')}</td>
                          <td className="p-3 font-sans font-bold">{sale.customerName || 'Convênio Corporativo'}</td>
                          <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                            R$ {Number(sale.total).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Botões de Ação (Imprimir Fatura & Quitar Saldo) */}
            <div className="pt-4 border-t border-slate-500/10 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                disabled={billingData.sales.length === 0}
                className="px-6 py-3 rounded-2xl border border-slate-500/30 hover:bg-slate-500/10 disabled:opacity-40 text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Imprimir Fatura / Relatório B2B
              </button>
              <button
                type="button"
                onClick={handleSettleInvoice}
                disabled={Number(billingData.partner.currentBalance || 0) <= 0}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                Quitar Fatura & Baixar Saldo Devedor ✓
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Impressão / Fatura B2B */}
      <ConvenioInvoicePrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        partner={billingData?.partner || null}
        sales={billingData?.sales || []}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}