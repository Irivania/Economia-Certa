'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { apiFetch } from '@/lib/apiClient';

interface ProductData {
  id: string;
  description: string;
  brand: string | null;
  ean: string | null;
  imageUrl: string | null;
  costPrice: string | null;
  salePrice: string | null;
  stockCurrent: number;
}

interface HistoryItem {
  id: string;
  supplierName: string;
  invoiceNumber: string | null;
  unitCost: string;
  quantity: string;
  purchasedBy: string;
  createdAt: string;
}

export default function ProductCostHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      try {
        setLoading(true);
        const res = await apiFetch(`/api/products/${id}/history`);
        if (!res.ok) throw new Error('Erro ao carregar histórico.');
        const data = await res.json();
        
        if (isMounted && data.success) {
          setProduct(data.product);
          setHistory(data.history);
        }
      } catch (err) {
        console.error('Erro ao buscar histórico de custos:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Auditoria & Histórico de Custos"
        subtitle="Rastreabilidade da evolução de preços de custo por produto ao longo do tempo."
        onOpenCmd={() => {}}
      />

      <main className="max-w-6xl mx-auto px-6 -mt-8 pb-20 relative z-20 space-y-6">
        <div>
          <Link href="/produtos" className="font-bold text-xs bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 inline-flex items-center gap-2">
            &larr; Voltar ao Catálogo
          </Link>
        </div>

        {loading ? (
          <div className={`p-12 text-center rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <p className="text-xs opacity-50">Carregando linha do tempo de custos...</p>
          </div>
        ) : !product ? (
          <div className={`p-12 text-center rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <p className="text-xs text-rose-500 font-bold">Produto não encontrado.</p>
          </div>
        ) : (
          <>
            {/* Cabeçalho do Produto */}
            <div className={`p-6 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-center gap-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="w-20 h-20 rounded-2xl border border-slate-500/20 bg-slate-500/5 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                {product.imageUrl && product.imageUrl.startsWith('http') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl opacity-40">📦</span>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="text-[10px] uppercase font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider">
                  {product.brand || 'Marca Geral'} • EAN: {product.ean || 'N/A'}
                </div>
                <h1 className="text-base sm:text-lg font-black">{product.description}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs font-mono">
                  <span className="bg-slate-500/10 px-3 py-1 rounded-lg">Custo Atual: <b>R$ {Number(product.costPrice || 0).toFixed(2)}</b></span>
                  <span className="bg-slate-500/10 px-3 py-1 rounded-lg">Preço Venda: <b>R$ {Number(product.salePrice || 0).toFixed(2)}</b></span>
                  <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg">Estoque: <b>{product.stockCurrent} UN</b></span>
                </div>
              </div>
            </div>

            {/* Timeline / Linha do Tempo de Compras */}
            <div className={`p-8 rounded-3xl border shadow-xl space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="border-b pb-4 border-slate-500/10 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">Linha do Tempo de Entradas (XML / Manual)</h3>
                  <p className="text-xs opacity-60">Registo histórico de cada compra efetuada e usuário responsável.</p>
                </div>
                <span className="text-xs font-mono font-bold bg-slate-500/10 px-3 py-1 rounded-xl">
                  {history.length} compras registadas
                </span>
              </div>

              {history.length === 0 ? (
                <p className="text-center py-12 text-xs opacity-50 font-mono">
                  Nenhum registo de histórico de custo encontrado para este produto. O histórico será preenchido automaticamente ao dar entrada em notas fiscais.
                </p>
              ) : (
                <div className="relative border-l-2 border-indigo-500/30 ml-4 pl-6 space-y-8 py-2">
                  {history.map((h, idx) => (
                    <div key={h.id} className="relative group">
                      {/* Marcador da Timeline */}
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white dark:border-slate-900 shadow-md"></div>

                      <div className={`p-5 rounded-2xl border transition shadow-sm space-y-3 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-2 border-slate-500/10">
                          <div>
                            <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400">{h.supplierName}</span>
                            <div className="text-[11px] opacity-60 font-mono">
                              {h.invoiceNumber ? `NF-e Nº ${h.invoiceNumber}` : 'Entrada Manual'} {idx === 0 ? '• (Mais Recente)' : ''}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                              R$ {Number(h.unitCost).toFixed(2)} <span className="text-[10px] font-normal opacity-70">/ un</span>
                            </div>
                            <div className="text-[10px] opacity-50 font-mono">
                              {new Date(h.createdAt).toLocaleDateString('pt-BR')} às {new Date(h.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-between items-center text-xs font-mono opacity-80 pt-1">
                          <span>Qtd Adquirida: <b>{h.quantity} UN</b></span>
                          <span className="bg-slate-500/10 px-3 py-1 rounded-lg text-[11px]">
                            👤 Comprado por: <b>{h.purchasedBy}</b>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}