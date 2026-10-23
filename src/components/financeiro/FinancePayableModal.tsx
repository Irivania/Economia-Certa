'use client';

interface FinancePayableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newSupplier: string;
  setNewSupplier: (val: string) => void;
  newInvoice: string;
  setNewInvoice: (val: string) => void;
  newAmount: string;
  setNewAmount: (val: string) => void;
  newDueDate: string;
  setNewDueDate: (val: string) => void;
  isDarkMode: boolean;
}

export function FinancePayableModal({
  isOpen,
  onClose,
  onSubmit,
  newSupplier,
  setNewSupplier,
  newInvoice,
  setNewInvoice,
  newAmount,
  setNewAmount,
  newDueDate,
  setNewDueDate,
  isDarkMode,
}: FinancePayableModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className={`w-full max-w-lg p-8 rounded-3xl border shadow-2xl space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center border-b pb-3 border-slate-500/10">
          <h3 className="text-sm font-black uppercase tracking-wider">Registar Novo Boleto / Título</h3>
          <button onClick={onClose} className="text-xs opacity-50 hover:opacity-100 font-bold cursor-pointer">✕ Fechar</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Fornecedor / Distribuidora *</label>
            <input
              type="text"
              placeholder="Ex: Armazéns Martins"
              value={newSupplier}
              onChange={(e) => setNewSupplier(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl bg-white dark:bg-slate-950 uppercase"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Nº da Nota / Documento</label>
              <input
                type="text"
                placeholder="Ex: 98765"
                value={newInvoice}
                onChange={(e) => setNewInvoice(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl bg-white dark:bg-slate-950 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Valor da Parcela (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl bg-white dark:bg-slate-950 font-mono font-bold text-emerald-600"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Data de Vencimento *</label>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl bg-white dark:bg-slate-950 font-mono"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-500/10">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-500/10 cursor-pointer">Cancelar</button>
            <button type="submit" className="px-6 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer">Guardar Título</button>
          </div>
        </form>
      </div>
    </div>
  );
}