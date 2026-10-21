'use client';

import { Edit3, PlusCircle, DollarSign, Calendar, AlertTriangle } from 'lucide-react';

interface ItemXML {
  ean: string | null;
  descricaoNota: string;
  unidadeNota: string;
  qtdNota: number;
  quantidadeRealEstoque: number;
  valorUnitarioNota: number;
  custoRealUnitario: number;
  cadastradoNoSistema: boolean;
  productId: string | null;
}

interface BoletoXML {
  numeroFatura: string;
  vencimento: string;
  valor: number;
}

interface NotaPreviewTableProps {
  notaData: {
    emitente: string;
    numeroNota: string;
    chaveAcess: string;
    totalNota: number;
    totalDesconto: number;
    boletos: BoletoXML[];
    itens: ItemXML[];
  };
  onItemFieldChange: (index: number, field: 'quantidadeRealEstoque' | 'custoRealUnitario', value: number) => void;
  onBoletoFieldChange: (index: number, field: 'vencimento' | 'valor', value: string | number) => void;
  onConfirm: () => void;
  loading: boolean;
  isDarkMode: boolean;
}

export function NotaPreviewTable({
  notaData,
  onItemFieldChange,
  onBoletoFieldChange,
  onConfirm,
  loading,
  isDarkMode,
}: NotaPreviewTableProps) {
  const formatMoney = (val: number) => Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className={`p-8 rounded-3xl border shadow-xl space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 border-slate-500/10 gap-4">
        <div>
          <span className="inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-extrabold uppercase text-indigo-500 border border-indigo-500/20 mb-1 flex items-center gap-1">
            <Edit3 className="w-3 h-3" /> Conferência e Ajustes Financeiros e de Estoque
          </span>
          <h3 className="text-base font-black">Fornecedor: {notaData.emitente}</h3>
          <p className="text-xs opacity-60">NF-e Nº: <strong>{notaData.numeroNota}</strong> | Chave: <span className="font-mono">{notaData.chaveAcess}</span></p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right font-mono text-xs">
            <span className="opacity-60 block">Valor Total da Nota:</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{formatMoney(notaData.totalNota)}</span>
            {notaData.totalDesconto > 0 && <span className="block text-[10px] text-rose-500">Desconto: -{formatMoney(notaData.totalDesconto)}</span>}
          </div>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Confirmar Entrada & Gerar Boletos ✓
          </button>
        </div>
      </div>

      {/* SECÇÃO DE CONFERÊNCIA DOS BOLETOS */}
      <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
          <DollarSign className="w-4 h-4" /> Conferência de Títulos / Boletos (Lançamento Automático no Contas a Pagar)
        </div>
        <p className="text-xs opacity-70">Se a data ou valor do boleto divergir da nota, ajuste abaixo antes de confirmar a entrada.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {notaData.boletos.map((bol, bIdx) => (
            <div key={bIdx} className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-500/20 space-y-2">
              <div className="flex justify-between text-[11px] font-bold opacity-75">
                <span>Fatura: {bol.numeroFatura}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 opacity-50" />
                <input
                  type="date"
                  value={bol.vencimento}
                  onChange={(e) => onBoletoFieldChange(bIdx, 'vencimento', e.target.value)}
                  className="w-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-500/20 outline-none"
                />
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-xs opacity-60">R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={Number(bol.valor || 0).toFixed(2)}
                  onChange={(e) => onBoletoFieldChange(bIdx, 'valor', Number(e.target.value))}
                  className="w-full text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-500/20 outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TABELA DE ITENS DA NOTA */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b uppercase tracking-wider text-[11px] font-extrabold opacity-60 border-slate-500/10">
              <th className="p-3">Produto / Descrição na Nota</th>
              <th className="p-3 text-center">EAN</th>
              <th className="p-3 text-center">Qtd. Nota</th>
              <th className="p-3 text-center text-indigo-500">Qtd. Real p/ Estoque (Editável)</th>
              <th className="p-3 text-right">Custo Unit. Real (R$)</th>
              <th className="p-3 text-center">Status Sistema</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-500/10 font-mono">
            {notaData.itens.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-500/5 transition">
                <td className="p-3 font-sans font-bold">{item.descricaoNota}</td>
                <td className="p-3 text-center opacity-75">{item.ean || 'N/A'}</td>
                <td className="p-3 text-center">
                  <span className="font-bold">{item.qtdNota}</span> <span className="text-[10px] opacity-60">{item.unidadeNota}</span>
                </td>
                <td className="p-3 text-center">
                  <input
                    type="number"
                    step="any"
                    value={item.quantidadeRealEstoque}
                    onChange={(e) => onItemFieldChange(idx, 'quantidadeRealEstoque', Number(e.target.value))}
                    className="w-24 px-2 py-1 text-center font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 rounded-lg outline-none"
                  />
                </td>
                <td className="p-3 text-right">
                  <input
                    type="number"
                    step="0.01"
                    value={item.custoRealUnitario}
                    onChange={(e) => onItemFieldChange(idx, 'custoRealUnitario', Number(e.target.value))}
                    className="w-32 px-2 py-1 text-right font-bold bg-slate-500/10 border border-slate-500/30 rounded-lg outline-none font-mono text-emerald-600 dark:text-emerald-400"
                  />
                </td>
                <td className="p-3 text-center font-sans">
                  {item.cadastradoNoSistema ? (
                    <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      ✓ Vinculado
                    </span>
                  ) : (
                    <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center gap-1 mx-auto">
                      <AlertTriangle className="w-3 h-3 text-amber-500" /> Novo (Cadastro Auto)
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}