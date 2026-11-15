"use client";

export interface SaleItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  subtotal: string;
}

export interface Sale {
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

interface SalesTableProps {
  sales: Sale[];
  loading: boolean;
  onSelectSale: (sale: Sale) => void;
}

export function SalesTable({ sales, loading, onSelectSale }: SalesTableProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h3 className="font-bold text-xs uppercase tracking-wider">
          Transações Registadas
        </h3>
        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
          {sales.length} venda(s) • Clique em qualquer linha para ver os itens
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
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  Nenhuma venda encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr
                  key={sale.id}
                  onClick={() => onSelectSale(sale)}
                  className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition cursor-pointer"
                >
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                    {sale.createdAt
                      ? new Date(sale.createdAt).toLocaleString("pt-BR")
                      : "N/A"}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                      {sale.registerName || "Caixa Padrão"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {sale.operatorName}
                  </td>
                  <td className="p-4 text-slate-800 dark:text-slate-200 font-sans font-medium">
                    {sale.customerName || "Consumidor Final"}
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
                        sale.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
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
  );
}
