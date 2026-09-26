'use client';

import { useState } from 'react';
import { products as productsSchema } from '@/db/schema';
import { ImportHeader } from './import/ImportHeader';
import { ImportResultsList } from './import/ImportResultsList';

export type Product = typeof productsSchema.$inferSelect & {
  ean?: string | null;
};

export interface ItemPendente {
  codigoExterno?: string;
  ean?: string | null;
  descricao: string;
  descricaoPadronizada: string;
  precoVenda?: string | '';
  estoqueAtual?: number | '';
}

interface ItemReconhecido {
  codigoExterno?: string;
  ean?: string | null;
  descricao: string;
  product: Product;
  matchType: 'EAN' | 'Exato' | 'Similar';
}

interface QuotationItemPayload {
  id: string;
  productId: string;
  description: string;
  brand: string | null;
  ean: string | null;
  imageUrl?: string | null;
  stockCurrent: number;
  stockIdeal: number;
  requestedQuantity: number;
}

interface ProductImportModalProps {
  products: Product[];
  onQuickRegister?: (itemPendente: ItemPendente) => Promise<void>;
  onImportComplete?: (itens: QuotationItemPayload[]) => void;
}

function formatarMoedaInput(valorStr: string): string {
  const apenasDigitos = valorStr.replace(/\D/g, '');
  if (!apenasDigitos) return '';
  const numero = Number(apenasDigitos) / 100;
  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

export function ProductImportModal({ products, onImportComplete }: ProductImportModalProps) {
  const [rawImportText, setRawImportText] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('melo_raw_import') || '';
    }
    return '';
  });

  const [itensReconhecidos, setItensReconhecidos] = useState<ItemReconhecido[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('melo_reconhecidos');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [itensPendentes, setItensPendentes] = useState<ItemPendente[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('melo_pendentes');
      let pendentesSalvos: ItemPendente[] = saved ? JSON.parse(saved) : [];
      
      pendentesSalvos = pendentesSalvos.map(p => ({
        ...p,
        estoqueAtual: (p.estoqueAtual === 10 || p.estoqueAtual === undefined) ? '' : p.estoqueAtual
      }));

      if (pendentesSalvos.length > 0 && products.length > 0) {
        pendentesSalvos = pendentesSalvos.filter((pendente) => {
          const jaExistePorEan = pendente.ean ? products.some(p => p.ean && p.ean.trim() === pendente.ean?.trim()) : false;
          const jaExistePorDesc = products.some(p => normalizarTexto(p.description) === pendente.descricaoPadronizada);
          return !jaExistePorEan && !jaExistePorDesc;
        });
      }
      return pendentesSalvos;
    }
    return [];
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleTextChange = (text: string) => {
    setRawImportText(text);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('melo_raw_import', text);
    }
  };

  const atualizarPendentes = (novosPendentes: ItemPendente[]) => {
    setItensPendentes(novosPendentes);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('melo_pendentes', JSON.stringify(novosPendentes));
    }
  };

  const atualizarReconhecidos = (novosReconhecidos: ItemReconhecido[]) => {
    setItensReconhecidos(novosReconhecidos);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('melo_reconhecidos', JSON.stringify(novosReconhecidos));
    }
  };

  const handleFinalizarImportacao = () => {
    const itensParaCotacao: QuotationItemPayload[] = [
      ...itensReconhecidos.map(r => ({
        id: r.product.id,
        productId: r.product.id,
        description: r.product.description,
        brand: r.product.brand || null,
        ean: r.product.ean || r.ean || null,
        imageUrl: r.product.imageUrl || null,
        stockCurrent: r.product.stockCurrent || 0,
        stockIdeal: r.product.stockIdeal || 0, // Estoque ideal puxado do cadastro do produto
        requestedQuantity: 0, // Quantidade solicitada zerada/vazia para o comprador definir
      })),
      ...itensPendentes.map((p, idx) => ({
        id: `pendente_${idx}_${Date.now()}`,
        productId: `pendente_${idx}`,
        description: p.descricaoPadronizada,
        brand: null,
        ean: p.ean || null,
        imageUrl: null,
        stockCurrent: Number(p.estoqueAtual) || 0,
        stockIdeal: 0,
        requestedQuantity: 0, // Quantidade solicitada zerada/vazia para o comprador definir
      }))
    ];

    if (onImportComplete && itensParaCotacao.length > 0) {
      onImportComplete(itensParaCotacao);
    }

    setRawImportText('');
    setItensReconhecidos([]);
    setItensPendentes([]);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('melo_raw_import');
      sessionStorage.removeItem('melo_reconhecidos');
      sessionStorage.removeItem('melo_pendentes');
    }
  };

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
            precoVenda: '',
            estoqueAtual: '',
          });
        }
      }

      indexAtual = limite;
      const progressoAtual = Math.round((indexAtual / totalItens) * 100);
      setProgress(progressoAtual);

      if (indexAtual < totalItens) {
        setTimeout(processarLote, 10);
      } else {
        atualizarReconhecidos(reconhecidos);
        atualizarPendentes(pendentes);
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
      alert('Erro ao ler o ficheiro Excel/CSV.');
      setIsProcessing(false);
    }
  };

  const handleUpdatePendingItem = (index: number, field: 'descricaoPadronizada' | 'precoVenda' | 'estoqueAtual', value: string | number) => {
    const updated = [...itensPendentes];
    if (field === 'precoVenda') {
      updated[index] = { ...updated[index], [field]: formatarMoedaInput(String(value)) };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    atualizarPendentes(updated);
  };

  return (
    <div className="bg-white border border-indigo-100 rounded-xl p-6 mb-8 space-y-6 shadow-sm">
      <ImportHeader
        rawImportText={rawImportText}
        onTextChange={handleTextChange}
        isProcessing={isProcessing}
        progress={progress}
        onProcessImport={handleProcessImport}
        onFileUpload={handleFileUpload}
      />

      {(itensReconhecidos.length > 0 || itensPendentes.length > 0) && !isProcessing && (
        <ImportResultsList
          itensReconhecidos={itensReconhecidos}
          itensPendentes={itensPendentes}
          onUpdatePendingItem={handleUpdatePendingItem}
          onFinalizarImportacao={handleFinalizarImportacao}
        />
      )}
    </div>
  );
}