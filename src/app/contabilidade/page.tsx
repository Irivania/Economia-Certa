'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { getCompanyId } from '@/lib/companySession';
import { apiFetch } from '@/lib/apiClient';
import { FileSpreadsheet, Download, Calendar, ShieldCheck, Share2 } from 'lucide-react';

interface SaleItem {
  id: string;
  createdAt: string;
  paymentMethod: string | null;
  subtotal: string | number;
  discount: string | number;
  total: string | number;
}

interface AccountingData {
  summary: {
    totalSalesCount: number;
    totalRevenuePeriod: number;
    totalPayablesCount: number;
    totalReceivablesCount: number;
  };
  sales: SaleItem[];
  payables: unknown[];
  receivables: unknown[];
}

export default function AccountingPortalPage() {
  const { isDarkMode } = useTheme();
  const companyId = getCompanyId();

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  const [data, setData] = useState<AccountingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [secureLink, setSecureLink] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchAccountingData() {
      if (!companyId) return;
      try {
        setLoading(true);
        const res = await apiFetch(`/api/contabilidade/export?companyId=${companyId}&month=${selectedMonth}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success) {
            setData(json);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados contábeis:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchAccountingData();

    return () => {
      isMounted = false;
    };
  }, [companyId, selectedMonth]);

  const handleGenerateSecureLink = async () => {
    if (!companyId) return;
    try {
      const res = await apiFetch('/api/contabilidade/token', {
        method: 'POST',
        body: JSON.stringify({ companyId }),
      });
      const json = await res.json();
      if (json.success) {
        setSecureLink(json.secureUrl);
        navigator.clipboard.writeText(json.secureUrl);
        alert('Link seguro gerado e copiado para a área de transferência! Podes enviá-lo para o teu contador.');
      } else {
        alert(json.error || 'Erro ao gerar link.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão.');
    }
  };

  const formatMoney = (val: number) => Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleExportJSON = () => {
    if (!data) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `contabilidade_${selectedMonth}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Portal do Contador & Canal Fiscal"
        subtitle="Central dedicada para auditoria, apuração e exportação mensal de dados para a contabilidade."
        onOpenCmd={() => {}}
      />

      <main className="max-w-6xl mx-auto px-6 -mt-8 pb-20 relative z-20 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link href="/" className="font-bold text-xs bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 inline-flex items-center gap-2">
            &larr; Voltar ao Início
          </Link>

          <div className="flex items-center gap-3">
            {/* Botão Gerar Link Seguro */}
            <button
              type="button"
              onClick={handleGenerateSecureLink}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition cursor-pointer inline-flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Gerar Link para o Contador
            </button>

            {/* Seletor de Competência Mensal */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <Calendar className="w-4 h-4 opacity-60 ml-2" />
              <span className="text-xs font-bold opacity-75">Competência:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl text-xs font-mono font-bold outline-none border border-slate-500/20"
              />
            </div>
          </div>
        </div>

        {secureLink && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-mono">
            <div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">🔗 Link Seguro Ativo (Copiado):</span>
              <span className="opacity-75 break-all">{secureLink}</span>
            </div>
            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText(secureLink); alert('Link copiado novamente!'); }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold shrink-0 cursor-pointer"
            >
              Copiar Link
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className={`p-6 rounded-3xl border shadow-xl space-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">Faturamento Bruto do Mês</span>
            <div className="text-xl font-black font-mono">
              {formatMoney(data?.summary.totalRevenuePeriod || 0)}
            </div>
            <p className="text-[11px] opacity-50 font-mono">{data?.summary.totalSalesCount || 0} vendas concluídas</p>
          </div>

          <div className={`p-6 rounded-3xl border shadow-xl space-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">Contas a Pagar Registadas</span>
            <div className="text-xl font-black font-mono">
              {data?.summary.totalPayablesCount || 0} <span className="text-xs font-sans opacity-60">títulos</span>
            </div>
            <p className="text-[11px] opacity-50 font-mono">Despesas e fornecedores</p>
          </div>

          <div className={`p-6 rounded-3xl border shadow-xl space-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Contas a Receber</span>
            <div className="text-xl font-black font-mono">
              {data?.summary.totalReceivablesCount || 0} <span className="text-xs font-sans opacity-60">títulos</span>
            </div>
            <p className="text-[11px] opacity-50 font-mono">Convênios e recebíveis</p>
          </div>

          <div className={`p-6 rounded-3xl border shadow-xl space-y-2 flex flex-col justify-between ${isDarkMode ? 'bg-indigo-950/40 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">Exportação Oficial</span>
              <p className="text-[11px] opacity-70 mt-1">Pacote completo para auditoria e escrita fiscal.</p>
            </div>
            <button
              type="button"
              onClick={handleExportJSON}
              className="mt-3 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Descarregar Pack Mensal
            </button>
          </div>
        </div>

        <div className={`p-8 rounded-3xl border shadow-xl space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between border-b pb-4 border-slate-500/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider">Extrato Consolidado de Vendas (Competência {selectedMonth})</h3>
                <p className="text-xs opacity-60">Registo detalhado para apuração de receitas e impostos.</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" /> Dados Auditados
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs opacity-50 font-mono">A apurar dados contábeis do mês...</div>
          ) : !data || data.sales.length === 0 ? (
            <div className="py-12 text-center text-xs opacity-40 font-mono">Nenhuma venda registada para o mês de competência selecionado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b uppercase tracking-wider text-[10px] font-extrabold opacity-60 border-slate-500/10">
                    <th className="p-3">ID da Venda</th>
                    <th className="p-3">Data / Hora</th>
                    <th className="p-3 text-center">Forma de Pagamento</th>
                    <th className="p-3 text-right">Subtotal (R$)</th>
                    <th className="p-3 text-right">Desconto (R$)</th>
                    <th className="p-3 text-right">Total Líquido (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-500/10 text-xs">
                  {data.sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-500/5 transition">
                      <td className="p-3 font-bold opacity-75">#{sale.id.slice(0, 8)}</td>
                      <td className="p-3">{new Date(sale.createdAt).toLocaleString('pt-BR')}</td>
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] uppercase">
                          {sale.paymentMethod || 'DINHEIRO'}
                        </span>
                      </td>
                      <td className="p-3 text-right">R$ {Number(sale.subtotal || 0).toFixed(2)}</td>
                      <td className="p-3 text-right text-rose-500">R$ {Number(sale.discount || 0).toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">R$ {Number(sale.total || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}