'use client';

import { useEffect, useState, useCallback, useSyncExternalStore, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { SupplierHeader } from '@/components/portal/SupplierHeader';
import { SupplierQuotationHeader } from '@/components/portal/SupplierQuotationHeader';
import { SupplierQuotationTable } from '@/components/portal/SupplierQuotationTable';

interface QuotationItem {
  id: string;
  productName: string;
  barcode: string;
  description: string;
  imageUrl?: string | null;
  quantity: number;
  unit: string;
  price?: number;
  outOfStock?: boolean;
}

interface QuotationDetail {
  quotationId: string;
  title: string;
  companyName: string;
  supplierName?: string | null; // Nome da distribuidora/marca correspondente a esta cotação
  status?: string;
  isLocked?: boolean;
  observation?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  closingTime?: string | null;
  paymentTerms?: string | null;
  items: QuotationItem[];
}

interface SupplierSession {
  name?: string;
  email?: string;
  companyName?: string;
}

const subscribeToHydration = () => () => {};

const formatCurrency = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  const amount = Number(numbers) / 100;
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export default function SupplierQuotationResponsePage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;
  const { isDarkMode, mounted: themeMounted } = useTheme();

  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const sessionData = useSyncExternalStore(
    subscribeToHydration,
    () => sessionStorage.getItem('melo_supplier_session') ?? '',
    () => ''
  );

  const parsedSupplierSession: SupplierSession = (() => {
    try {
      return sessionData ? JSON.parse(sessionData) : {};
    } catch {
      return {};
    }
  })();

  const [quotation, setQuotation] = useState<QuotationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successSubmitted, setSuccessSubmitted] = useState(false);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [outOfStock, setOutOfStock] = useState<Record<string, boolean>>({});
  const [observation, setObservation] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const loadQuotationDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/portal/cotacoes/detalhes?token=${token}`);
      if (res.ok) {
        const data = (await res.json()) as QuotationDetail;
        setQuotation(data);

        if (data.observation) {
          setObservation(data.observation);
        }

        if (data.items && data.items.length > 0) {
          const initialPrices: Record<string, string> = {};
          const initialOutOfStock: Record<string, boolean> = {};

          data.items.forEach((item) => {
            if (item.price && item.price > 0) {
              const cents = Math.round(item.price * 100);
              initialPrices[item.id] = (cents / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              });
            }
            if (item.outOfStock) {
              initialOutOfStock[item.id] = true;
            }
          });

          setPrices(initialPrices);
          setOutOfStock(initialOutOfStock);

          if (!data.isLocked) {
            setTimeout(() => {
              const firstId = data.items[0].id;
              inputRefs.current[firstId]?.focus();
            }, 300);
          }
        }
      } else {
        showToast('Erro ao carregar itens da cotação.');
      }
    } catch (err) {
      console.error('Erro:', err);
      showToast('Erro de conexão ao carregar cotação.');
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    if (!sessionData) {
      router.push('/portal/login');
      return;
    }
    if (token) {
      queueMicrotask(() => {
        void loadQuotationDetails();
      });
    }
  }, [sessionData, token, router, loadQuotationDetails]);

  const handlePriceChange = (itemId: string, value: string) => {
    if (quotation?.isLocked) return;
    const formatted = formatCurrency(value);
    setPrices((prev) => ({ ...prev, [itemId]: formatted }));
    
    if (outOfStock[itemId] && formatted) {
      setOutOfStock((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const toggleOutOfStock = (itemId: string) => {
    if (quotation?.isLocked) return;
    setOutOfStock((prev) => {
      const nextState = !prev[itemId];
      if (nextState) {
        setPrices((p) => {
          const copy = { ...p };
          delete copy[itemId];
          return copy;
        });
      }
      return { ...prev, [itemId]: nextState };
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    if (quotation?.isLocked) return;
    if (e.key === 'Enter') {
      e.preventDefault();

      const currentItem = quotation?.items[currentIndex];
      if (currentItem) {
        const currentPrice = prices[currentItem.id];
        if (!currentPrice || currentPrice === 'R$ 0,00') {
          setOutOfStock((prev) => ({ ...prev, [currentItem.id]: true }));
        }
      }

      const nextItem = quotation?.items[currentIndex + 1];
      if (nextItem && inputRefs.current[nextItem.id]) {
        inputRefs.current[nextItem.id]?.focus();
      }
    }
  };

  const filledCount = Object.keys(prices).filter((id) => prices[id] && prices[id] !== 'R$ 0,00').length;
  const outOfStockCount = Object.values(outOfStock).filter(Boolean).length;
  const totalCompleted = filledCount + outOfStockCount;
  const totalItems = quotation?.items.length || 0;

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quotation?.isLocked) return;

    if (quotation) {
      for (const item of quotation.items) {
        const hasPrice = prices[item.id] && prices[item.id] !== 'R$ 0,00';
        const isMissing = outOfStock[item.id];
        if (!hasPrice && !isMissing) {
          showToast(`⚠ O produto "${item.productName}" está sem preço e não foi marcado como indisponível.`);
          inputRefs.current[item.id]?.focus();
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const cleanPrices: Record<string, number> = {};
      for (const [id, val] of Object.entries(prices)) {
        const numericStr = val.replace(/\D/g, '');
        if (numericStr) {
          cleanPrices[id] = Number(numericStr) / 100;
        }
      }

      const payload = { token, prices: cleanPrices, outOfStock, observation };
      const res = await fetch(`/api/portal/cotacoes/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar resposta');
      }

      setSuccessSubmitted(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao submeter os preços.';
      showToast(`❌ ${errorMessage}`);
      setSubmitting(false);
    }
  };

  if (!mounted || !themeMounted) return null;

  if (successSubmitted) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`max-w-md w-full p-8 rounded-3xl shadow-2xl border text-center space-y-6 backdrop-blur-md ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner border border-emerald-500/25 animate-bounce">
            ✓
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight">Proposta Enviada com Sucesso!</h2>
            <p className="text-xs opacity-60 leading-relaxed">
              A sua cotação foi registada e enviada com segurança para o lojista. Obrigado pela parceria!
            </p>
          </div>
          <button
            onClick={() => router.push('/portal/painel')}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3.5 rounded-2xl text-xs transition shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            Voltar ao Painel Principal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50/80 text-slate-900'}`}>
      <SupplierHeader
        title="Portal do Fornecedor"
        representativeName={parsedSupplierSession.name || 'Representante'}
        representativeEmail={parsedSupplierSession.email || ''}
        // Exibe estritamente a distribuidora da cotação no contexto, nunca o nome da pessoa
        activeBrand={quotation?.supplierName || 'DISTRIBUIDORA PARCEIRA'}
        onLogout={() => router.push('/portal/login')}
      />

      <main className="max-w-[96%] xl:max-w-[1550px] mx-auto px-4 sm:px-6 mt-10 pb-24 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs opacity-60 font-medium">A sincronizar itens da cotação...</p>
          </div>
        ) : !quotation ? (
          <div className="text-center py-24 border border-dashed rounded-3xl opacity-60">
            <p className="text-sm font-semibold">Cotação não encontrada ou expirada.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitResponse} className="space-y-6">
            
            {quotation.isLocked && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm">
                <span>🔒</span>
                <span>Esta proposta já foi enviada por este fornecedor e encontra-se bloqueada para edições.</span>
              </div>
            )}

            <SupplierQuotationHeader
              quotation={{
                title: quotation.title,
                companyName: quotation.companyName,
                startDate: quotation.startDate,
                endDate: quotation.endDate,
                closingTime: quotation.closingTime,
                paymentTerms: quotation.paymentTerms,
              }}
              isDarkMode={isDarkMode}
              totalCompleted={totalCompleted}
              totalItems={totalItems}
            />

            <div className={quotation.isLocked ? 'pointer-events-none opacity-85 select-none' : ''}>
              <SupplierQuotationTable
                items={quotation.items}
                isDarkMode={isDarkMode}
                prices={prices}
                outOfStock={outOfStock}
                submitting={submitting || Boolean(quotation.isLocked)}
                inputRefs={inputRefs}
                onPriceChange={handlePriceChange}
                onKeyDown={handleKeyDown}
                onToggleOutOfStock={toggleOutOfStock}
              />
            </div>

            <div className={`p-8 rounded-3xl shadow-xl border backdrop-blur-md space-y-3 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'}`}>
              <label className="block text-xs font-black uppercase tracking-wider opacity-80">
                Observações Gerais da Proposta <span className="text-[10px] font-normal opacity-60">(Opcional)</span>
              </label>
              <textarea
                rows={3}
                disabled={submitting || Boolean(quotation.isLocked)}
                placeholder="Ex: Condições de pagamento, prazo de entrega estimado, marcas alternativas disponíveis..."
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className={`w-full p-4 text-xs rounded-2xl border outline-none transition-all resize-none shadow-sm ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'
                }`}
              />
            </div>

            <div className={`p-6 rounded-3xl shadow-xl border flex justify-between items-center backdrop-blur-md ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'}`}>
              <button
                type="button"
                onClick={() => router.push('/portal/painel')}
                className={`px-6 py-3 font-bold rounded-2xl text-xs border transition cursor-pointer ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'}`}
              >
                ← Voltar ao Painel
              </button>

              {!quotation.isLocked && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-extrabold px-9 py-3.5 rounded-2xl text-xs transition-all cursor-pointer shadow-xl shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
                >
                  <span>{submitting ? 'A enviar proposta...' : 'Enviar Proposta Completa'}</span>
                  <span className="text-sm">→</span>
                </button>
              )}
            </div>
          </form>
        )}
      </main>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 px-6 py-4 bg-emerald-600 text-white rounded-2xl shadow-2xl text-xs font-extrabold transition-all z-50 animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
}