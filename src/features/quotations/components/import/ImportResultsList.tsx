'use client';

import { ItemPendente, ItemReconhecido } from './types';

interface ImportResultsListProps {
  itensReconhecidos: ItemReconhecido[];
  itensPendentes: ItemPendente[];
  onUpdatePendingItem: (index: number, field: 'descricaoPadronizada' | 'precoVenda' | 'estoqueAtual', value: string | number) => void;
  onFinalizarImportacao: () => void;
}

export function ImportResultsList({
  itensReconhecidos,
  itensPendentes,
  onUpdatePendingItem,
  onFinalizarImportacao,
}: ImportResultsListProps) {
  return (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Já Cadastrados */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-emerald-300 dark:border-emerald-900/50 shadow-sm">
          <h3 className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
            ✅ Já Cadastrados no ERP ({itensReconhecidos.length})
          </h3>
          <ul className="space-y-2.5 max-h-[350px] overflow-y-auto text-[11px] text-slate-600 dark:text-slate-300 pr-2">
            {itensReconhecidos.map((item, idx) => (
              <li key={idx} className="border-b border-slate-100 dark:border-slate-800 pb-2 flex justify-between items-center">
                <span className="truncate pr-3 leading-relaxed">
                  {item.ean && <span className="text-indigo-500 font-mono mr-1.5 font-bold">[{item.ean}]</span>}
                  <b className="text-slate-800 dark:text-slate-100">{item.descricao}</b> &rarr; <span className="uppercase text-slate-500 dark:text-slate-400">{item.product.description}</span>
                </span>
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold whitespace-nowrap ${
                  item.matchType === 'EAN' ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300' :
                  item.matchType === 'Exato' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                }`}>
                  {item.matchType}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Novos / Pendentes */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-amber-300 dark:border-amber-900/50 shadow-sm">
          <h3 className="text-[13px] font-bold text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2">
            ⚠️ Novos / Não Cadastrados ({itensPendentes.length})
          </h3>
          {itensPendentes.length === 0 ? (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 py-6 text-center">Nenhum item pendente de cadastro!</p>
          ) : (
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              {itensPendentes.map((item, idx) => {
                const queryParams = new URLSearchParams({
                  description: item.descricaoPadronizada,
                  ean: item.ean || '',
                  salePrice: item.precoVenda !== '' ? String(item.precoVenda) : '',
                  stockCurrent: item.estoqueAtual !== '' ? String(item.estoqueAtual) : '',
                  returnTo: '/cotacoes/nova',
                });

                return (
                  <div key={idx} className="bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-900/40 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      {item.ean && <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 px-1.5 py-0.5 rounded font-mono font-bold">{item.ean}</span>}
                      <input
                        type="text"
                        value={item.descricaoPadronizada}
                        onChange={(e) => onUpdatePendingItem(idx, 'descricaoPadronizada', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs font-bold uppercase text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-400 transition-colors"
                        placeholder="Nome do produto"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Venda: R$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={item.precoVenda}
                          onChange={(e) => onUpdatePendingItem(idx, 'precoVenda', e.target.value)}
                          placeholder="0,00"
                          className="w-20 bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 rounded px-2 py-1 text-xs text-center font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Estq. Atual:</span>
                        <input
                          type="number"
                          min="0"
                          value={item.estoqueAtual}
                          onChange={(e) => onUpdatePendingItem(idx, 'estoqueAtual', e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder=""
                          className="w-16 bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 rounded px-2 py-1 text-xs text-center font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-amber-400 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                      </div>

                      <a
                        href={`/produtos?${queryParams.toString()}`}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3.5 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer text-center"
                      >
                        Cadastrar Rápido
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onFinalizarImportacao}
          className="bg-slate-900 dark:bg-emerald-600 hover:bg-black dark:hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition-colors shadow-md cursor-pointer flex items-center gap-2"
        >
          ✓ Finalizar e Incluir na Cotação &rarr;
        </button>
      </div>
    </div>
  );
}