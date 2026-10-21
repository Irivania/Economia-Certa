'use client';

interface ManualSupplierFormProps {
  cnpj: string;
  onCnpjChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCnpjBlur: () => void;
  loadingCnpj: boolean;
  supplierName: string;
  setSupplierName: (name: string) => void;
  invoiceNumber: string;
  setInvoiceNumber: (num: string) => void;
  paymentTerms: string;
  setPaymentTerms: (terms: string) => void;
  isDarkMode: boolean;
}

export function ManualSupplierForm({
  cnpj,
  onCnpjChange,
  onCnpjBlur,
  loadingCnpj,
  supplierName,
  setSupplierName,
  invoiceNumber,
  setInvoiceNumber,
  paymentTerms,
  setPaymentTerms,
  isDarkMode,
}: ManualSupplierFormProps) {
  return (
    <div className={`p-8 rounded-3xl border shadow-xl space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">1. Dados do Fornecedor & Documento</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1 opacity-80">CNPJ do Fornecedor</label>
          <div className="relative">
            <input
              type="text"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={onCnpjChange}
              onBlur={onCnpjBlur}
              maxLength={18}
              className="w-full px-4 py-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-950 font-mono outline-none"
            />
            {loadingCnpj && <span className="absolute right-3 top-2.5 text-[10px] text-indigo-500 animate-pulse">A consultar...</span>}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold mb-1 opacity-80">Fornecedor / Distribuidora *</label>
          <input
            type="text"
            placeholder="Nome da empresa fornecedora"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            required
            className="w-full px-4 py-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-950 font-bold outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1 opacity-80">Número da Nota Fiscal *</label>
          <input
            type="text"
            placeholder="Ex: 000123"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            required
            className="w-full px-4 py-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-950 font-mono outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1 opacity-80">Condição de Pagamento</label>
          <select
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            className="w-full px-4 py-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-950 outline-none"
          >
            <option value="À Vista">À Vista</option>
            <option value="Boleto 14 Dias">Boleto 14 Dias</option>
            <option value="Boleto 28/30 Dias">Boleto 28/30 Dias</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
      </div>
    </div>
  );
}