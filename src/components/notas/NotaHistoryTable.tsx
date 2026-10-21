'use client';

import { History, FileText, X } from 'lucide-react';

interface ImportedInvoiceRecord {
  id: string;
  accessKey: string;
  invoiceNumber: string;
  issuerName: string;
  totalAmount: string;
  importedAt: string;
}

interface InvoiceDetailData {
  invoice: ImportedInvoiceRecord;
  items: Array<{ id: string; unitCost: string; quantity: string; productDescription: string; productEan: string | null }>;
  payables: Array<{ id: string; invoiceNumber: string; amount: string; dueDate: string; status: string }>;
}

interface NotaHistoryTableProps {
  importedList: ImportedInvoiceRecord[];
  onOpenDetail: (invoiceNumber: string) => void;
  selectedDetail: InvoiceDetailData | null;
  isDetailModalOpen: boolean;
  onCloseDetailModal: () => void;
  isDarkMode: boolean;
}

export function NotaHistoryTable({
  importedList,
  onOpenDetail,
  selectedDetail,
  isDetailModalOpen,
  onCloseDetailModal,
  isDarkMode,
}: NotaHistoryTableProps) {
  const formatMoney = (val: number) => Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <>
      <div className={`p-8 rounded-3xl border shadow-xl space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3 border-b pb-4 border-slate-500/10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider">Histórico de Notas Fiscais Importadas (XML)</h3>
            <p className="text-xs opacity-60">Clique no número da NF-e para inspecionar os itens e boletos gravados no sistema.</p>
          </div>
        </div>

        {importedList.length === 0 ? (
          <div className="py-8 text-center text-xs opacity-40 font-mono">Nenhuma nota fiscal importada até o momento.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b uppercase tracking-wider text-[10px] font-extrabold opacity-60 border-slate-500/10">
                  <th className="p-3">NF-e Nº</th>
                  <th className="p-3">Fornecedor / Emitente</th>
                  <th className="p-3 text-right">Valor Total (R$)</th>
                  <th className="p-3 text-center">Data de Importação</th>
                  <th className="p-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-500/10 text-xs">
                {importedList.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-500/5 transition">
                    <td className="p-3 font-bold">
                      <button
                        type="button"
                        onClick={() => onOpenDetail(inv.invoiceNumber)}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-bold inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> #{inv.invoiceNumber}
                      </button>
                    </td>
                    <td className="p-3 font-sans font-bold">{inv.issuerName}</td>
                    <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(Number(inv.totalAmount))}</td>
                    <td className="p-3 text-center opacity-75">{new Date(inv.importedAt).toLocaleString('pt-BR')}</td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => onOpenDetail(inv.invoiceNumber)}
                        className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] uppercase hover:bg-indigo-500/20 transition cursor-pointer"
                      >
                        Inspecionar Nota 🔍
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE DETALHE DA NOTA */}
      {isDetailModalOpen && selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className={`w-full max-w-3xl p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 relative ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              type="button"
              onClick={onCloseDetailModal}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-500/10 hover:bg-slate-500/20 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b pb-4 border-slate-500/10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-wider">Detalhes da Nota Fiscal #{selectedDetail.invoice.invoiceNumber}</h3>
                <p className="text-xs opacity-60">Fornecedor: <strong>{selectedDetail.invoice.issuerName}</strong> | Total: {formatMoney(Number(selectedDetail.invoice.totalAmount))}</p>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider opacity-70 mb-2">Itens e Custos Registados no Armazém</h4>
                <div className="border rounded-2xl overflow-hidden divide-y divide-slate-500/10 text-xs font-mono">
                  {selectedDetail.items.map((it, i) => (
                    <div key={i} className="p-3 flex justify-between items-center bg-slate-500/5">
                      <div>
                        <span className="font-sans font-bold block">{it.productDescription}</span>
                        <span className="text-[10px] opacity-60">EAN: {it.productEan || 'N/A'} | Qtd: {it.quantity} un</span>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Custo Unit: {formatMoney(Number(it.unitCost))}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-wider opacity-70 mb-2">Títulos / Boletos Gerados no Contas a Pagar</h4>
                <div className="border rounded-2xl overflow-hidden divide-y divide-slate-500/10 text-xs font-mono">
                  {selectedDetail.payables.length === 0 ? (
                    <p className="p-4 text-xs opacity-40 text-center">Nenhum boleto associado a esta nota.</p>
                  ) : (
                    selectedDetail.payables.map((pay, pIdx) => (
                      <div key={pIdx} className="p-3 flex justify-between items-center bg-slate-500/5">
                        <div>
                          <span className="font-bold block">Fatura: {pay.invoiceNumber}</span>
                          <span className="text-[10px] opacity-60">Vencimento: {new Date(pay.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-rose-600">{formatMoney(Number(pay.amount))}</span>
                          <span className={`block text-[10px] uppercase font-bold ${pay.status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {pay.status === 'PAID' ? 'Pago' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-500/15 flex justify-end">
              <button
                type="button"
                onClick={onCloseDetailModal}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}