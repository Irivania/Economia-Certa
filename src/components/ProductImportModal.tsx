'use client';

import { useState } from 'react';
import { products as productsSchema } from '@/db/schema';

export type Product = typeof productsSchema.$inferSelect & {
  ean?: string | null;
};

export interface ItemPendente {
  codigoExterno?: string;
  ean?: string | null;
  descricao: string;
  descricaoPadronizada: string;
  precoVenda?: number;
  estoqueIdeal?: number;
}

interface ItemReconhecido {
  codigoExterno?: string;
  ean?: string | null;
  descricao: string;
  product: Product;
  matchType: 'EAN' | 'Exato' | 'Similar';
}

interface ProductImportModalProps {
  products: Product[];
  onQuickRegister: (itemPendente: ItemPendente) => Promise<void>;
}

function calcularSimilaridade(s1: string, s2: string): number {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  return (longerLength - editarDistancia(longer, shorter)) / longerLength;
}

function editarDistancia(s1: string, s2: string): number {
  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function normalizarTexto(texto: string): string {
  if (!texto) return '';
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function ProductImportModal({ products, onQuickRegister }: ProductImportModalProps) {
  const [rawImportText, setRawImportText] = useState('');
  const [itensReconhecidos, setItensReconhecidos] = useState<ItemReconhecido[]>([]);
  const [itensPendentes, setItensPendentes] = useState<ItemPendente[]>([]);
  const [loadingRegister, setLoadingRegister] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processarLinhasExtraidas = (linhas: Array<{ ean: string | null; descricao: string }>) => {
    const reconhecidos: ItemReconhecido[] = [];
    const pendentes: ItemPendente[] = [];
    const chavesProcessadas = new Set<string>();

    const totalItens = linhas.length;
    const tamanhoLote = 50;
    let indexAtual = 0;

    const processarLote = () => {
      const limite = Math.min(indexAtual + tamanhoLote, totalItens);

      for (let i = indexAtual; i < limite; i++) {
        const item = linhas[i];
        if (!item.descricao || item.descricao.length < 2) continue;

        const descNormalizada = normalizarTexto(item.descricao);
        const chaveUnica = item.ean ? `ean_${item.ean}` : `desc_${descNormalizada}`;

        if (chavesProcessadas.has(chaveUnica)) continue;
        chavesProcessadas.add(chaveUnica);

        let matchLocal: Product | undefined = undefined;
        let matchType: 'EAN' | 'Exato' | 'Similar' = 'Exato';

        if (item.ean) {
          matchLocal = products.find((p) => p.ean && p.ean.trim() === item.ean?.trim());
          if (matchLocal) matchType = 'EAN';
        }

        if (!matchLocal) {
          matchLocal = products.find((p) => normalizarTexto(p.description) === descNormalizada);
          if (matchLocal) matchType = 'Exato';
        }

        if (!matchLocal) {
          let melhorScore = 0;
          let melhorProduto: Product | null = null;

          for (const p of products) {
            const score = calcularSimilaridade(descNormalizada, normalizarTexto(p.description));
            if (score > melhorScore) {
              melhorScore = score;
              melhorProduto = p;
            }
          }

          if (melhorScore >= 0.75) {
            matchLocal = melhorProduto!;
            matchType = 'Similar';
          }
        }

        if (matchLocal) {
          reconhecidos.push({ ean: item.ean, descricao: item.descricao, product: matchLocal, matchType });
        } else {
          pendentes.push({
            ean: item.ean,
            descricao: item.descricao,
            descricaoPadronizada: descNormalizada,
            precoVenda: 34.99,
            estoqueIdeal: 10,
          });
        }
      }

      indexAtual = limite;
      const progressoAtual = Math.round((indexAtual / totalItens) * 100);
      setProgress(progressoAtual);

      if (indexAtual < totalItens) {
        setTimeout(processarLote, 10);
      } else {
        setItensReconhecidos(reconhecidos);
        setItensPendentes(pendentes);
        setIsProcessing(false);
      }
    };

    setTimeout(processarLote, 10);
  };

  const handleProcessImport = () => {
    if (!rawImportText.trim()) {
      alert('Cole os dados da lista externa para analisar.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const linhasTexto = rawImportText.split('\n').filter((l) => l.trim() !== '');
    const itensExtraidos: Array<{ ean: string | null; descricao: string }> = linhasTexto.map((linha) => {
      const partes = linha.split(/[\t;]/).map(p => p.trim()).filter(Boolean);
      let ean: string | null = null;
      let descricao = '';

      if (partes.length >= 2) {
        if (/^\d{8,14}$/.test(partes[0])) {
          ean = partes[0];
          descricao = partes.slice(1).join(' ');
        } else {
          descricao = partes.join(' ');
        }
      } else {
        descricao = partes[0] || linha;
        if (/^\d{8,14}$/.test(descricao)) {
          ean = descricao;
          descricao = '';
        }
      }

      return { ean, descricao: descricao.replace(/<[^>]*>?/gm, '') };
    }).filter((item): item is { ean: string | null; descricao: string } => item.descricao !== '');

    processarLinhasExtraidas(itensExtraidos);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProgress(20);

    try {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      setProgress(50);

      const itensExtraidos: Array<{ ean: string | null; descricao: string }> = rows
        .map((row) => {
          const cols = row.map(cell => (cell !== undefined && cell !== null ? String(cell).trim() : '')).filter(Boolean);
          if (cols.length === 0) return null;

          let ean: string | null = null;
          let descricao = '';

          const eanIndex = cols.findIndex(c => /^\d{8,14}$/.test(c));
          if (eanIndex !== -1) {
            ean = cols[eanIndex];
            cols.splice(eanIndex, 1);
          }
          descricao = cols.join(' ');

          if (!descricao && ean) return null;

          return { ean, descricao };
        })
        .filter((item): item is { ean: string | null; descricao: string } => item !== null && item.descricao !== '');

      setProgress(80);
      processarLinhasExtraidas(itensExtraidos);
    } catch (err) {
      console.error(err);
      alert('Erro ao ler o arquivo Excel/CSV.');
      setIsProcessing(false);
    }
  };

  const handleUpdatePendingItem = (index: number, field: 'descricaoPadronizada' | 'precoVenda' | 'estoqueIdeal', value: string | number) => {
    setItensPendentes(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAction = async (item: ItemPendente) => {
    try {
      setLoadingRegister(item.descricaoPadronizada);
      await onQuickRegister(item);
      
      setItensPendentes((prev) => prev.filter((p) => p.descricaoPadronizada !== item.descricaoPadronizada));
      setItensReconhecidos((prev) => [
        ...prev,
        {
          ean: item.ean || null,
          descricao: item.descricao,
          product: { 
            id: '', 
            description: item.descricaoPadronizada,
            ean: item.ean || null,
            sellingPrice: item.precoVenda || 34.99,
            stockIdeal: item.estoqueIdeal || 10,
          } as unknown as Product,
          matchType: 'Exato',
        },
      ]);
    } catch (error) {
      console.error('Erro ao realizar cadastro rápido:', error);
      alert('Não foi possível concluir o cadastro rápido.');
    } finally {
      setLoadingRegister(null);
    }
  };

  const handleRegisterAllPendentes = async () => {
    if (itensPendentes.length === 0) return;
    for (const item of [...itensPendentes]) {
      await handleAction(item);
    }
  };

  return (
    <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-5 mb-8 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-indigo-900 mb-1">🔄 Central de Importação Inteligente</h2>
        <p className="text-xs text-indigo-700">
          Importe ficheiros (.xlsx, .xls, .csv) ou cole os dados. O sistema valida os produtos já cadastrados e separa os novos para cadastro rápido.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <label className="bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-semibold px-4 py-2 rounded-lg text-xs cursor-pointer transition shadow-xs flex items-center gap-2">
          📁 Carregar Ficheiro (Excel / CSV)
          <input type="file" accept=".xlsx, .xls, .csv, .txt" onChange={handleFileUpload} className="hidden" />
        </label>
        <span className="text-xs text-slate-400 font-medium">ou cole os dados abaixo:</span>
      </div>

      <textarea
        rows={3}
        placeholder="Cole aqui os dados (Ex: 7891001234567	Shampoo Anticaspa...)"
        value={rawImportText}
        onChange={(e) => setRawImportText(e.target.value)}
        disabled={isProcessing}
        className="w-full p-3 text-xs border border-indigo-200 rounded-lg bg-white text-slate-800 font-mono disabled:opacity-50"
      />
      
      <div className="flex items-center gap-3">
        <button
          onClick={handleProcessImport}
          disabled={isProcessing}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isProcessing ? `Analisando... (${progress}%)` : 'Analisar e Cruzar Dados'}
        </button>

        {itensPendentes.length > 0 && !isProcessing && (
          <button
            onClick={handleRegisterAllPendentes}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer"
          >
            🚀 Cadastrar Todos os Pendentes ({itensPendentes.length})
          </button>
        )}
      </div>

      {isProcessing && (
        <div className="w-full bg-indigo-200 rounded-full h-2 overflow-hidden">
          <div className="bg-indigo-600 h-2 transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {(itensReconhecidos.length > 0 || itensPendentes.length > 0) && !isProcessing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          {/* Já Cadastrados */}
          <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-xs">
            <h3 className="text-xs font-bold text-emerald-800 mb-2">✅ Já Cadastrados no ERP ({itensReconhecidos.length})</h3>
            <ul className="space-y-1.5 max-h-56 overflow-y-auto text-[11px] text-slate-700 pr-1">
              {itensReconhecidos.map((item, idx) => (
                <li key={idx} className="border-b border-slate-100 py-1.5 flex justify-between items-center">
                  <span className="truncate pr-2">
                    {item.ean && <span className="text-indigo-600 font-mono mr-1">[{item.ean}]</span>}
                    <b>{item.descricao}</b> &rarr; <span className="uppercase text-slate-500">{item.product.description}</span>
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap ${
                    item.matchType === 'EAN' ? 'bg-indigo-100 text-indigo-800' :
                    item.matchType === 'Exato' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.matchType}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Novos / Pendentes */}
          <div className="bg-white p-4 rounded-lg border border-amber-200 shadow-xs">
            <h3 className="text-xs font-bold text-amber-800 mb-2">⚠️ Novos / Não Cadastrados ({itensPendentes.length})</h3>
            {itensPendentes.length === 0 ? (
              <p className="text-[11px] text-slate-500 py-4 text-center">Nenhum item pendente de cadastro!</p>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {itensPendentes.map((item, idx) => (
                  <div key={idx} className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 space-y-2">
                    <div className="flex items-center gap-2">
                      {item.ean && <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono font-bold">{item.ean}</span>}
                      <input
                        type="text"
                        value={item.descricaoPadronizada}
                        onChange={(e) => handleUpdatePendingItem(idx, 'descricaoPadronizada', e.target.value)}
                        className="w-full bg-white border border-amber-200 rounded px-2 py-1 text-xs font-bold uppercase text-slate-800 focus:outline-none focus:border-indigo-500"
                        placeholder="Nome do produto"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-600">Venda: R$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={item.precoVenda ?? 34.99}
                          onChange={(e) => handleUpdatePendingItem(idx, 'precoVenda', Number(e.target.value))}
                          className="w-20 bg-white border border-amber-200 rounded px-1.5 py-0.5 text-xs text-center font-bold text-slate-800"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-600">Estq. Ideal:</span>
                        <input
                          type="number"
                          value={item.estoqueIdeal ?? 10}
                          onChange={(e) => handleUpdatePendingItem(idx, 'estoqueIdeal', Number(e.target.value))}
                          className="w-16 bg-white border border-amber-200 rounded px-1.5 py-0.5 text-xs text-center font-bold text-slate-800"
                        />
                      </div>

                      <button
                        onClick={() => handleAction(item)}
                        disabled={loadingRegister === item.descricaoPadronizada}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded transition disabled:opacity-50 whitespace-nowrap cursor-pointer"
                      >
                        {loadingRegister === item.descricaoPadronizada ? 'Cadastrando...' : 'Cadastrar Rápido'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}