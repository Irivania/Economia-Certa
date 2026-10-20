'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { getCompanyId } from '@/lib/companySession';
import { apiFetch } from '@/lib/apiClient';
import { TrendingUp, Filter, Calendar } from 'lucide-react';

interface ReportMetrics {
  grossRevenue: number;
  totalCostOfGoods: number;
  grossProfit: number;
  cardFees: number;
  estimatedTaxes: number;
  netProfit: number;
  profitMargin: number;
  salesCount: number;
  paymentBreakdown: Record<string, number>;
}

export default function ProfitabilityReportPage() {
  const { isDarkMode } = useTheme();
  const companyId = getCompanyId();

  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRangeLabel, setDateRangeLabel] = useState('');

  // Função auxiliar para formatar rótulos de datas de forma amigável
  const updateDateLabel = (selectedPeriod: string, start?: string, end?: string) => {
    const now = new Date();
    const formatDateBr = (d: Date) => d.toLocaleDateString('pt-BR');

    if (selectedPeriod === 'today') {
      setDateRangeLabel(`Hoje (${formatDateBr(now)})`);
    } else if (selectedPeriod === 'week') {
      const firstDay = new Date(now);
      firstDay.setDate(now.getDate() - now.getDay());
      setDateRangeLabel(`Esta Semana (${formatDateBr(firstDay)} até ${formatDateBr(now)})`);
    } else if (selectedPeriod === 'month') {
      const firstMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setDateRangeLabel(`Mês Inteiro (${formatDateBr(firstMonth)} até ${formatDateBr(lastMonth)})`);
    } else if (selectedPeriod === 'year') {
      setDateRangeLabel(`Ano Todo de ${now.getFullYear()}`);
    } else if (selectedPeriod === 'custom' && start && end) {
      const sFormatted = new Date(start + 'T00:00:00').toLocaleDateString('pt-BR');
      const eFormatted = new Date(end + 'T00:00:00').toLocaleDateString('pt-BR');
      setDateRangeLabel(`Personalizado (${sFormatted} até ${eFormatted})`);
    } else {
      setDateRangeLabel('Período Atual');
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchReport(selectedPeriod: string, start?: string, end?: string) {
      if (!companyId) return;
      try {
        setLoading(true);
        let url = `/api/reports/profitability?companyId=${companyId}&period=${selectedPeriod}`;
        if (selectedPeriod === 'custom' && start && end) {
          url += `&start=${start}&end=${end}`;
        }
        const res = await apiFetch(url);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            setMetrics(data.metrics);
            updateDateLabel(selectedPeriod, start, end);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar relatório:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (period !== 'custom') {
      fetchReport(period);
    }

    return () => {
      isMounted = false;
    };
  }, [companyId, period]);

  const handleCustomSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert('Selecione a data inicial e a data final.');
      return;
    }

    if (!companyId) return;
    try {
      setLoading(true);
      const url = `/api/reports/profitability?companyId=${companyId}&period=custom&start=${startDate}&end=${endDate}`;
      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMetrics(data.metrics);
          updateDateLabel('custom', startDate, endDate);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar relatório personalizado:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (val: number) => Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Relatório de Fechamento & Lucratividade"
        subtitle="DRE Gerencial flexível: análise por período automático, mês ou ano."
        onOpenCmd={() => {}}
      />

      <main className="max-w-6xl mx-auto px-6 -mt-8 pb-20 relative z-20 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <Link href="/" className="font-bold text-xs bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 inline-flex items-center gap-2">
            &larr; Voltar ao Início
          </Link>

          {/* Filtros Rápidos de Período */}
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              type="button"
              onClick={() => setPeriod('today')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                period === 'today' ? 'bg-indigo-600 text-white shadow-md' : 'opacity-60 hover:opacity-100'
              }`}
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => setPeriod('week')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                period === 'week' ? 'bg-indigo-600 text-white shadow-md' : 'opacity-60 hover:opacity-100'
              }`}
            >
              Esta Semana
            </button>
            <button
              type="button"
              onClick={() => setPeriod('month')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                period === 'month' ? 'bg-indigo-600 text-white shadow-md' : 'opacity-60 hover:opacity-100'
              }`}
            >
              Mês Inteiro
            </button>
            <button
              type="button"
              onClick={() => setPeriod('year')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                period === 'year' ? 'bg-indigo-600 text-white shadow-md' : 'opacity-60 hover:opacity-100'
              }`}
            >
              Ano Todo
            </button>
            <button
              type="button"
              onClick={() => setPeriod('custom')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                period === 'custom' ? 'bg-indigo-600 text-white shadow-md' : 'opacity-60 hover:opacity-100'
              }`}
            >
              Personalizado 📅
            </button>
          </div>
        </div>

        {/* Indicador Visual Intuitivo do Período Ativo */}
        <div className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-2.5 text-xs font-bold font-mono">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Período de Análise: <strong className="text-indigo-600 dark:text-indigo-400">{dateRangeLabel}</strong></span>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Atualização Automática ✓
          </span>
        </div>

        {/* Formulário de Intervalo Personalizado (De / Até) */}
        {period === 'custom' && (
          <form onSubmit={handleCustomSearch} className={`p-5 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-end gap-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold mb-1 opacity-80">Data Inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-950 font-mono outline-none"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold mb-1 opacity-80">Data Final</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-950 font-mono outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Filter className="w-3.5 h-3.5" /> Filtrar Período
            </button>
          </form>
        )}

        {loading ? (
          <div className={`p-16 text-center rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <p className="text-xs font-bold animate-pulse">A calcular indicadores financeiros do período...</p>
          </div>
        ) : metrics && (
          <div className="space-y-6">
            {/* Cards Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-6 rounded-3xl border shadow-xl space-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="text-[10px] font-black uppercase tracking-wider opacity-60 block">Faturamento Bruto</span>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {formatMoney(metrics.grossRevenue)}
                </div>
                <p className="text-[11px] opacity-50 font-mono">{metrics.salesCount} vendas no intervalo</p>
              </div>

              <div className={`p-6 rounded-3xl border shadow-xl space-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="text-[10px] font-black uppercase tracking-wider opacity-60 block">Lucro Líquido Real</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatMoney(metrics.netProfit)}
                </div>
                <p className="text-[11px] opacity-50 font-mono">Margem líquida: {metrics.profitMargin.toFixed(2)}%</p>
              </div>

              <div className={`p-6 rounded-3xl border shadow-xl space-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="text-[10px] font-black uppercase tracking-wider opacity-60 block">Custo de Produtos (CPV)</span>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                  {formatMoney(metrics.totalCostOfGoods)}
                </div>
                <p className="text-[11px] opacity-50 font-mono">Mercadoria vendida a preço de custo</p>
              </div>
            </div>

            {/* DRE Gerencial Detalhada */}
            <div className={`p-8 rounded-3xl border shadow-xl space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-3 border-b pb-4 border-slate-500/10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">Demonstrativo de Resultado (DRE)</h3>
                  <p className="text-xs opacity-60">Detalhamento gerencial do período selecionado.</p>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-2 border-b border-slate-500/10 font-bold">
                  <span>(+) Faturamento Bruto de Vendas</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{formatMoney(metrics.grossRevenue)}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-500/10 opacity-80">
                  <span>(-) CPV (Custo dos Produtos Vendidos)</span>
                  <span className="text-rose-600 dark:text-rose-400">- {formatMoney(metrics.totalCostOfGoods)}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-500/10 font-bold">
                  <span>(=) Lucro Bruto Operacional</span>
                  <span>{formatMoney(metrics.grossProfit)}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-500/10 opacity-80">
                  <span>(-) Taxas de Cartão/Maquininha (Est. Crédito/Débito)</span>
                  <span className="text-amber-600">- {formatMoney(metrics.cardFees)}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-500/10 opacity-80">
                  <span>(-) Impostos Estimados (Simples Nacional ~4%)</span>
                  <span className="text-amber-600">- {formatMoney(metrics.estimatedTaxes)}</span>
                </div>

                <div className="flex justify-between py-3 border-t-2 border-slate-500/20 text-sm font-black">
                  <span>(=) LUCRO LÍQUIDO FINAL</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatMoney(metrics.netProfit)}</span>
                </div>
              </div>

              {/* Faturamento por Forma de Pagamento */}
              <div className="pt-4 border-t border-slate-500/10 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider opacity-70">Faturamento por Forma de Pagamento</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-2xl bg-slate-500/5 border border-slate-500/10">
                    <span className="opacity-60 block font-sans">💵 Dinheiro</span>
                    <span className="font-bold">{formatMoney(metrics.paymentBreakdown['CASH'] || 0)}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-500/5 border border-slate-500/10">
                    <span className="opacity-60 block font-sans">⚡ PIX</span>
                    <span className="font-bold">{formatMoney(metrics.paymentBreakdown['PIX'] || 0)}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-500/5 border border-slate-500/10">
                    <span className="opacity-60 block font-sans">💳 Crédito</span>
                    <span className="font-bold">{formatMoney(metrics.paymentBreakdown['CREDIT_CARD'] || 0)}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-500/5 border border-slate-500/10">
                    <span className="opacity-60 block font-sans">💳 Débito</span>
                    <span className="font-bold">{formatMoney(metrics.paymentBreakdown['DEBIT_CARD'] || 0)}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-500/5 border border-slate-500/10">
                    <span className="opacity-60 block font-sans">🤝 Convênio</span>
                    <span className="font-bold">{formatMoney(metrics.paymentBreakdown['CONVENIO'] || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}