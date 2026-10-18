'use client';

import { Printer, X, FileText } from 'lucide-react';

interface SaleItem {
  id: string;
  total: string | number;
  paymentMethod: string;
  customerName: string | null;
  createdAt: string;
}

interface PartnerInfo {
  id: string;
  name: string;
  document: string | null;
  phone: string | null;
  currentBalance: string | number;
  creditLimit: string | number;
}

interface ConvenioInvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: PartnerInfo | null;
  sales: SaleItem[];
  isDarkMode: boolean;
}

export function ConvenioInvoicePrintModal({
  isOpen,
  onClose,
  partner,
  sales,
  isDarkMode,
}: ConvenioInvoicePrintModalProps) {
  if (!isOpen || !partner) return null;

  const totalAmount = Number(partner.currentBalance || 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className={`w-full max-w-3xl p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 relative print:shadow-none print:border-none print:p-0 ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Botão Fechar (Oculto na Impressão) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-500/10 hover:bg-slate-500/20 transition cursor-pointer print:hidden"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabeçalho da Fatura Corporativa */}
        <div className="text-center space-y-2 border-b pb-6 border-slate-500/10">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black uppercase tracking-wider">Fatura de Convênio Corporativo (B2B)</h2>
          <p className="text-xs opacity-60 font-mono">Economia Certa ERP • Relatório de Faturamento Mensal</p>
        </div>

        {/* Dados da Empresa Parceira */}
        <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-500/5 p-4 rounded-2xl border border-slate-500/10">
          <div>
            <span className="opacity-60 block font-sans">Empresa Parceira (Razão Social):</span>
            <span className="font-bold text-sm">{partner.name}</span>
          </div>
          <div>
            <span className="opacity-60 block font-sans">CNPJ:</span>
            <span className="font-bold">{partner.document || 'Não informado'}</span>
          </div>
          <div>
            <span className="opacity-60 block font-sans">Telefone / Contato:</span>
            <span className="font-bold">{partner.phone || 'N/A'}</span>
          </div>
          <div>
            <span className="opacity-60 block font-sans">Data de Emissão:</span>
            <span className="font-bold">{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {/* Tabela de Consumo dos Funcionários */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider opacity-70">Extrato Consolidado de Compras ({sales.length} lançamentos)</h4>
          
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b uppercase tracking-wider text-[10px] font-extrabold opacity-60 border-slate-500/10">
                  <th className="p-2.5">Data / Hora</th>
                  <th className="p-2.5">Funcionário / Consumidor</th>
                  <th className="p-2.5">ID da Venda</th>
                  <th className="p-2.5 text-right">Valor (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-500/10 text-xs">
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="p-2.5 opacity-75">{new Date(sale.createdAt).toLocaleString('pt-BR')}</td>
                    <td className="p-2.5 font-sans font-bold">{sale.customerName || 'Convênio Corporativo'}</td>
                    <td className="p-2.5 opacity-60">{sale.id.substring(0, 8)}...</td>
                    <td className="p-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      R$ {Number(sale.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totalizador da Fatura */}
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex justify-between items-center font-mono">
          <div>
            <span className="text-xs font-bold font-sans uppercase tracking-wider block opacity-70">Valor Total a Pagar pela Empresa:</span>
            <span className="text-[10px] opacity-60">Limite de Crédito Atribuído: R$ {Number(partner.creditLimit || 0).toFixed(2)}</span>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            R$ {totalAmount.toFixed(2)}
          </div>
        </div>

        {/* Rodapé de Assinaturas (Impressão) */}
        <div className="pt-8 border-t border-slate-500/15 grid grid-cols-2 gap-8 text-center text-[10px] font-mono opacity-70">
          <div className="space-y-6">
            <div className="border-b border-slate-500/40 pb-1"></div>
            <span>Responsável Financeiro (Lojista)</span>
          </div>
          <div className="space-y-6">
            <div className="border-b border-slate-500/40 pb-1"></div>
            <span>Aprovação / RH (Empresa Parceira)</span>
          </div>
        </div>

        {/* Botões de Ação (Ocultos na Impressão) */}
        <div className="flex gap-3 pt-2 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3 rounded-2xl border border-slate-500/30 hover:bg-slate-500/10 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Imprimir Fatura / Boleto B2B
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition cursor-pointer"
          >
            Fechar Janela ✓
          </button>
        </div>
      </div>
    </div>
  );
}