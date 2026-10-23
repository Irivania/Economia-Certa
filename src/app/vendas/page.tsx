'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SaleItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  subtotal: string;
}

interface Sale {
  id: string;
  companyId: string;
  cashRegisterId: string | null;
  registerName: string | null;
  customerName: string | null;
  operatorName: string;
  mode: string;
  paymentMethod: string;
  subtotal: string;
  discount: string;
  total: string;
  status: string;
  createdAt: string;
  items: SaleItem[];
}

export default function VendasPage() {
  const [salesList, setSalesList] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [filterType, setFilterType] = useState<'all' | 'today' | 'biweekly' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('all');
  const [selectedRegister, setSelectedRegister] = useState('all');

  // Modal de Detalhes
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    fetch('/api/vendas')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSalesList(data.sales);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Listas únicas para os filtros dinâmicos
  const operators = Array.from(new Set(salesList.map((s) => s.operatorName)));
  const registers = Array.from(new Set(salesList.map((s) => s.registerName || 'Caixa Padrão')));

  // Lógica de Filtragem Completa
  const filteredSales = salesList.filter((sale) => {
    if (selectedOperator !== 'all' && sale.operatorName !== selectedOperator) return false;
    const regName = sale.registerName || 'Caixa Padrão';
    if (selectedRegister !== 'all' && regName !== selectedRegister) return false;

    if (!sale.createdAt) return true;
    const saleDate = new Date(sale.createdAt);
    const today = new Date();

    if (filterType === 'today') {
      return saleDate.toDateString() === today.toDateString();
    }
    if (filterType === 'biweekly') {
      const diffTime = Math.abs(today.getTime() - saleDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 15;
    }
    if (filterType === 'month') {
      return (
        saleDate.getMonth() === today.getMonth() &&
        saleDate.getFullYear() === today.getFullYear()
      );
    }
    if (filterType === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return saleDate >= start && saleDate <= end;
    }

    return true;
  });

  const totalFaturado = filteredSales.reduce((acc, s) => acc + Number(s.total || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Cabeçalho Padronizado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Histórico de Vendas & PDV
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Consulte transações, horários, operadores, turnos e itens comprados em tempo real.
            </p>
          </div>
          <Link
            href="/pdv"
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs uppercase tracking-wider text-white transition shadow-sm"
          >
            ← Voltar ao PDV
          </Link>
        </div>

        {/* Barra de Filtros (Período, Caixa, Operadora) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Períodos */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">Período:</span>
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition ${filterType === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:opacity-80'}`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterType('today')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition ${filterType === 'today' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:opacity-80'}`}
              >
                Hoje
              </button>
              <button
                onClick={() => setFilterType('biweekly')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition ${filterType === 'biweekly' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:opacity-80'}`}
              >
                Quinzenal
              </button>
              <button
                onClick={() => setFilterType('month')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition ${filterType === 'month' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:opacity-80'}`}
              >
                Este Mês
              </button>
              <button
                onClick={() => setFilterType('custom')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition ${filterType === 'custom' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:opacity-80'}`}
              >
                📅 Calendário
              </button>
            </div>

            {/* Filtros por Caixa e Operador */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold opacity-70">Caixa:</span>
                <select
                  value={selectedRegister}
                  onChange={(e) => setSelectedRegister(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold"
                >
                  <option value="all">Todos os Caixas</option>
                  {registers.map((r, i) => (
                    <option key={i} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold opacity-70">Operador(a):</span>
                <select
                  value={selectedOperator}
                  onChange={(e) => setSelectedOperator(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold"
                >
                  <option value="all">Todos os Operadores</option>
                  {operators.map((op, i) => (
                    <option key={i} value={op}>{op}</option>
                  ))}
                </select>
              </div>

              <div className="text-right pl-3 border-l border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 block font-mono">Faturamento</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  R$ {totalFaturado.toFixed(2)}
                </span>
              </div>
            </div>

          </div>

          {/* Seletor de Datas Personalizado */}
          {filterType === 'custom' && (
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold">De:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold">Até:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
                />
              </div>
              <span className="text-[11px] text-slate-400">
                (Filtro por calendário ativo)
              </span>
            </div>
          )}
        </div>

        {/* Tabela de Vendas */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-wider">Transações Registadas</h3>
            <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
              {filteredSales.length} venda(s) • Clique em qualquer linha para ver os itens
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono uppercase text-slate-500 bg-slate-50 dark:bg-slate-950/50">
                  <th className="p-4">Data e Hora</th>
                  <th className="p-4">Caixa / Turno</th>
                  <th className="p-4">Operador(a)</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Pagamento</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-mono">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      A carregar transações...
                    </td>
                  </tr>
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Nenhuma venda encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      onClick={() => setSelectedSale(sale)}
                      className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition cursor-pointer"
                    >
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                        {sale.createdAt ? new Date(sale.createdAt).toLocaleString('pt-BR') : 'N/A'}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                          {sale.registerName || 'Caixa Padrão'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {sale.operatorName}
                      </td>
                      <td className="p-4 text-slate-800 dark:text-slate-200 font-sans font-medium">
                        {sale.customerName || 'Consumidor Final'}
                      </td>
                      <td className="p-4 font-bold text-indigo-600 dark:text-indigo-400">
                        {sale.paymentMethod}
                      </td>
                      <td className="p-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        R$ {Number(sale.total).toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            sale.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal Padronizado de Detalhes da Venda */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Detalhes da Venda & Turno
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  ID: {selectedSale.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs hover:bg-red-500 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Informações do Caixa e Operador */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="opacity-60 block">Caixa / Turno:</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedSale.registerName || 'Caixa Padrão'}</strong>
              </div>
              <div>
                <span className="opacity-60 block">Operador(a) Responsável:</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedSale.operatorName}</strong>
              </div>
              <div>
                <span className="opacity-60 block">Cliente:</span>
                <strong className="font-sans text-slate-800 dark:text-slate-200">{selectedSale.customerName || 'Consumidor Final'}</strong>
              </div>
              <div>
                <span className="opacity-60 block">Data e Hora:</span>
                <strong>{selectedSale.createdAt ? new Date(selectedSale.createdAt).toLocaleString('pt-BR') : 'N/A'}</strong>
              </div>
            </div>

            {/* Lista de Produtos Comprados */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider opacity-70">
                Produtos Comprados ({selectedSale.items.length})
              </h4>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800 border rounded-2xl p-2 bg-slate-50 dark:bg-slate-950">
                {selectedSale.items.map((item) => (
                  <div key={item.id} className="py-3 px-2 flex justify-between items-center text-xs font-mono">
                    <div>
                      <div className="font-bold font-sans text-slate-800 dark:text-slate-200">{item.description}</div>
                      <div className="opacity-60 text-[10px]">Qtd: {item.quantity} un x R$ {Number(item.unitPrice).toFixed(2)}</div>
                    </div>
                    <div className="font-black text-emerald-600 dark:text-emerald-400">
                      R$ {Number(item.subtotal).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totais */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="text-xs text-slate-500 font-mono">
                Pagamento: <strong>{selectedSale.paymentMethod}</strong> | Desconto: R$ {Number(selectedSale.discount || 0).toFixed(2)}
              </div>
              <div className="text-right">
                <span className="text-xs opacity-60 block font-mono">TOTAL PAGO</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  R$ {Number(selectedSale.total).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSale(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider transition"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}