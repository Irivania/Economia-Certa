'use client';

import { useEffect, useState, use } from 'react';
import { apiFetch } from '@/lib/apiClient';
import { FileSpreadsheet, Download, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';

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
}

export default function ExternalAccountingPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  const [data, setData] = useState<AccountingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchExternalData() {
      try {
        setLoading(true);
        setErrorMessage('');
        const res = await apiFetch(`/api/contabilidade/token?token=${token}&month=${selectedMonth}`);
        const json = await res.json();
        if (isMounted) {
          if (res.ok && json.success) {
            setData(json);
          } else {
            setErrorMessage(json.error || 'Acesso negado ou link expirado.');
          }
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setErrorMessage('Erro de conexão ao carregar dados contábeis.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchExternalData();

    return () => {
      isMounted = false;
    };
  }, [token, selectedMonth]);

  const formatMoney = (val: number) => Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleExportJSON = () => {
    if (!data) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pack_contabil_${selectedMonth}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Cabeçalho do Portal Externo */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-400 font-extrabold text-[10px] uppercase mb-2 border border-indigo-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> Portal Seguro do Contador
            </div>
            <h1 className="text-lg font-black tracking-tight">Economia Certa ERP — Escrituração Fiscal</h1>
            <p className="text-xs text-slate-400 mt-0.5">Consulta e apuração de dados comerciais para auditoria contábil.</p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
            <Calendar className="w-4 h-4 opacity-60 ml-2" />
            <span className="text-xs font-bold opacity-75">Competência:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-900 px-3 py-1.5 rounded-xl text-xs font-mono font-bold outline-none border border-slate-700 text-slate-100"
            />
          </div>
        </div>

        {errorMessage ? (
          <div className="bg-rose-950/40 border border-rose-500/30 p-8 rounded-3xl text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-sm font-black text-rose-400 uppercase">Acesso Indisponível</h3>
            <p className="text-xs text-rose-300/80">{errorMessage}</p>
          </div>
        ) : loading ? (
          <div className="py-20 text-center text-xs text-slate-500 font-mono">A carregar apuração fiscal do mês...</div>
        ) : (
          <>
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">Faturamento Bruto</span>
                <div className="text-xl font-black font-mono">
                  {formatMoney(data?.summary.totalRevenuePeriod || 0)}
                </div>
                <p className="text-[11px] text-slate-500 font-mono">{data?.summary.totalSalesCount || 0} vendas apuradas</p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">Contas a Pagar</span>
                <div className="text-xl font-black font-mono">
                  {data?.summary.totalPayablesCount || 0} <span className="text-xs font-sans text-slate-500">títulos</span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">Despesas e fornecedores</p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">Contas a Receber</span>
                <div className="text-xl font-black font-mono">
                  {data?.summary.totalReceivablesCount || 0} <span className="text-xs font-sans text-slate-500">títulos</span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">Convênios e recebíveis</p>
              </div>

              <div className="p-6 rounded-3xl bg-indigo-950/40 border border-indigo-500/30 shadow-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">Pacote Mensal</span>
                  <p className="text-[11px] text-slate-400 mt-1">Exportação completa.</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="mt-3 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Descarregar Pack
                </button>
              </div>
            </div>

            {/* Tabela de Vendas */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center gap-3 border-b pb-4 border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">Registo de Vendas — Competência {selectedMonth}</h3>
                  <p className="text-xs text-slate-400">Listagem detalhada das operações comerciais efetuadas.</p>
                </div>
              </div>

              {!data || data.sales.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 font-mono">Nenhum registo encontrado para este mês.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="border-b uppercase tracking-wider text-[10px] font-extrabold text-slate-500 border-slate-800">
                        <th className="p-3">ID Operação</th>
                        <th className="p-3">Data / Hora</th>
                        <th className="p-3 text-center">Pagamento</th>
                        <th className="p-3 text-right">Subtotal</th>
                        <th className="p-3 text-right">Desconto</th>
                        <th className="p-3 text-right">Total Líquido</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-xs">
                      {data.sales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-800/50 transition">
                          <td className="p-3 font-bold text-slate-400">#{sale.id.slice(0, 8)}</td>
                          <td className="p-3">{new Date(sale.createdAt).toLocaleString('pt-BR')}</td>
                          <td className="p-3 text-center">
                            <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 font-extrabold text-[10px] uppercase border border-indigo-500/20">
                              {sale.paymentMethod || 'DINHEIRO'}
                            </span>
                          </td>
                          <td className="p-3 text-right">R$ {Number(sale.subtotal || 0).toFixed(2)}</td>
                          <td className="p-3 text-right text-rose-400">R$ {Number(sale.discount || 0).toFixed(2)}</td>
                          <td className="p-3 text-right font-bold text-emerald-400">R$ {Number(sale.total || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}