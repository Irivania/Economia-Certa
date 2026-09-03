'use client';

import { useState } from 'react';
import { products as productsSchema } from '@/db/schema'; // Importa a tabela do schema

// Define o tipo Product com base nas colunas do Drizzle para garantir compatibilidade total
export type Product = typeof productsSchema.$inferSelect;

export interface ItemPendente {
  codigoExterno?: string;
  descricao: string;
  descricaoPadronizada: string;
}

interface ItemReconhecido {
  codigoExterno?: string;
  descricao: string;
  product: Product;
  matchType: 'Exato' | 'Similar';
}

interface ProductImportModalProps {
  products: Product[];
  onQuickRegister: (itemPendente: ItemPendente) => Promise<void>;
}

// Função auxiliar para calcular a distância de Levenshtein (Similaridade de texto)
function calcularSimilaridade(s1: string, s2: string): number {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  const longerLength = longer.length;
  if (longerLength === 0) {
    return 1.0;
  }
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
    if (i > 0) {
      costs[s2.length] = lastValue;
    }
  }
  return costs[s2.length];
}

export function ProductImportModal({ products, onQuickRegister }: ProductImportModalProps) {
  const [rawImportText, setRawImportText] = useState('');
  const [itensReconhecidos, setItensReconhecidos] = useState<ItemReconhecido[]>([]);
  const [itensPendentes, setItensPendentes] = useState<ItemPendente[]>([]);
  const [loadingRegister, setLoadingRegister] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleProcessImport = () => {
    if (!rawImportText.trim()) {
      alert('Cole os dados da lista externa para analisar.');
      return;
    }

    const linhas = rawImportText.split('\n').filter((l) => l.trim() !== '');
    if (linhas.length > 2000) {
      alert('O limite máximo para importação em lote é de 2.000 linhas por vez.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const itensExtraidos = linhas.map((linha) => {
      const linhaLimpa = linha.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      const partes = linhaLimpa.split(/[\t;]/);
      return {
        codigoExterno: partes.length > 1 ? partes[0].trim() : undefined,
        descricao: partes.length > 1 ? partes[1].trim() : partes[0].trim(),
      };
    });

    const reconhecidos: ItemReconhecido[] = [];
    const pendentes: ItemPendente[] = [];
    const totalItens = itensExtraidos.length;
    const tamanhoLote = 50; 
    let indexAtual = 0;

    const processarLote = () => {
      const limite = Math.min(indexAtual + tamanhoLote, totalItens);

      for (let i = indexAtual; i < limite; i++) {
        const item = itensExtraidos[i];
        if (!item.descricao) continue;
        
        const descUpper = item.descricao.toUpperCase();

        let matchLocal = products.find((p) => p.description.trim().toUpperCase() === descUpper);
        let matchType: 'Exato' | 'Similar' = 'Exato';

        if (!matchLocal) {
          let melhorScore = 0;
          let melhorProduto: Product | null = null;

          for (const p of products) {
            const score = calcularSimilaridade(descUpper, p.description.trim().toUpperCase());
            if (score > melhorScore) {
              melhorScore = score;
              melhorProduto = p;
            }
          }

          if (melhorScore >= 0.8) {
            matchLocal = melhorProduto!;
            matchType = 'Similar';
          }
        }

        if (matchLocal) {
          reconhecidos.push({ ...item, product: matchLocal, matchType });
        } else {
          pendentes.push({ ...item, descricaoPadronizada: descUpper });
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

  const handleAction = async (item: ItemPendente) => {
    try {
      setLoadingRegister(item.descricaoPadronizada);
      await onQuickRegister(item);
      
      setItensPendentes((prev) => prev.filter((p) => p.descricaoPadronizada !== item.descricaoPadronizada));
      setItensReconhecidos((prev) => [
        ...prev,
        {
          codigoExterno: item.codigoExterno,
          descricao: item.descricao,
          product: { id: '', description: item.descricaoPadronizada } as Product,
          matchType: 'Exato',
        },
      ]);
    } catch (error) {
      console.error('Erro ao realizar cadastro rápido:', error);
      alert('Não foi possível concluir o cadastro rápido. Tente novamente.');
    } finally {
      setLoadingRegister(null);
    }
  };

  return (
    <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-5 mb-8">
      <h2 className="text-sm font-bold text-indigo-900 mb-2">🔄 Conciliação Inteligente de Lista Externa</h2>
      <p className="text-xs text-indigo-700 mb-3">
        Cole os dados externos. O sistema analisa por correspondência exata e similaridade (tolerância a pequenos erros de digitação).
      </p>
      <textarea
        rows={4}
        placeholder="Cole aqui os dados (Ex: 001  Shampoo Anticaspa...)"
        value={rawImportText}
        onChange={(e) => setRawImportText(e.target.value)}
        disabled={isProcessing}
        className="w-full p-3 text-xs border border-indigo-200 rounded-lg bg-white text-slate-800 font-mono mb-3 disabled:opacity-50"
      />
      
      <button
        onClick={handleProcessImport}
        disabled={isProcessing}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors disabled:opacity-50"
      >
        {isProcessing ? `Analisando... (${progress}%)` : 'Analisar e Cruzar Dados'}
      </button>

      {isProcessing && (
        <div className="w-full bg-indigo-200 rounded-full h-2 mt-3 overflow-hidden">
          <div className="bg-indigo-600 h-2 transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {(itensReconhecidos.length > 0 || itensPendentes.length > 0) && !isProcessing && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-emerald-200">
            <h3 className="text-xs font-bold text-emerald-800 mb-2">✅ Já Cadastrados / Vinculados ({itensReconhecidos.length})</h3>
            <ul className="space-y-1 max-h-40 overflow-y-auto text-[11px] text-slate-700">
              {itensReconhecidos.map((item, idx) => (
                <li key={idx} className="border-b border-slate-100 py-1 flex justify-between items-center">
                  <span><b>{item.descricao}</b> &rarr; <span className="uppercase text-slate-500">{item.product.description}</span></span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${item.matchType === 'Exato' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                    {item.matchType}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded-lg border border-amber-200">
            <h3 className="text-xs font-bold text-amber-800 mb-2">⚠️ Novos / Não Encontrados ({itensPendentes.length})</h3>
            {itensPendentes.length === 0 ? (
              <p className="text-[11px] text-slate-500">Nenhum item pendente de cadastro!</p>
            ) : (
              <ul className="space-y-2 max-h-40 overflow-y-auto text-[11px] text-slate-700">
                {itensPendentes.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-amber-50/50 p-2 rounded border border-amber-100">
                    <span className="font-medium uppercase">{item.descricaoPadronizada}</span>
                    <button
                      onClick={() => handleAction(item)}
                      disabled={loadingRegister === item.descricaoPadronizada}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold px-2 py-1 rounded disabled:opacity-50"
                    >
                      {loadingRegister === item.descricaoPadronizada ? 'Cadastrando...' : 'Cadastrar Rápido'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}