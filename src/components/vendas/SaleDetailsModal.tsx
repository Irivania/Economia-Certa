"use client";

import { Sale } from "./SalesTable";

interface SaleDetailsModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export function SaleDetailsModal({ sale, onClose }: SaleDetailsModalProps) {
  if (!sale) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Detalhes da Venda & Turno
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">
              ID: {sale.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs hover:bg-red-500 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Informações do Caixa e Operador */}
        <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div>
            <span className="opacity-60 block">Caixa / Turno:</span>
            <strong className="text-slate-800 dark:text-slate-200">
              {sale.registerName || "Caixa Padrão"}
            </strong>
          </div>
          <div>
            <span className="opacity-60 block">Operador(a) Responsável:</span>
            <strong className="text-slate-800 dark:text-slate-200">
              {sale.operatorName}
            </strong>
          </div>
          <div>
            <span className="opacity-60 block">Cliente:</span>
            <strong className="font-sans text-slate-800 dark:text-slate-200">
              {sale.customerName || "Consumidor Final"}
            </strong>
          </div>
          <div>
            <span className="opacity-60 block">Data e Hora:</span>
            <strong>
              {sale.createdAt
                ? new Date(sale.createdAt).toLocaleString("pt-BR")
                : "N/A"}
            </strong>
          </div>
        </div>

        {/* Lista de Produtos Comprados */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider opacity-70">
            Produtos Comprados ({sale.items.length})
          </h4>
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800 border rounded-2xl p-2 bg-slate-50 dark:bg-slate-950">
            {sale.items.map((item) => (
              <div
                key={item.id}
                className="py-3 px-2 flex justify-between items-center text-xs font-mono"
              >
                <div>
                  <div className="font-bold font-sans text-slate-800 dark:text-slate-200">
                    {item.description}
                  </div>
                  <div className="opacity-60 text-[10px]">
                    Qtd: {item.quantity} un x R${" "}
                    {Number(item.unitPrice).toFixed(2)}
                  </div>
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
            Pagamento: <strong>{sale.paymentMethod}</strong> | Desconto: R${" "}
            {Number(sale.discount || 0).toFixed(2)}
          </div>
          <div className="text-right">
            <span className="text-xs opacity-60 block font-mono">
              TOTAL PAGO
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              R$ {Number(sale.total).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
