'use client';

import { useState, useEffect, use } from 'react';
import { uppercaseText } from '@/lib/text';

interface QuotationResponseItem {
  id: string;
  productId: string;
  description: string;
  ean?: string | null;
  imageUrl?: string | null;
  brand?: string | null;
  requestedQuantity: number;
}

interface QuotationData {
  id: string;
  title: string;
  storeName: string;
  endDate?: string | null;
  closingTime?: string | null;
  items: QuotationResponseItem[];
}

export default function ResponderCotacaoPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [quotation, setQuotation] = useState<QuotationData | null>(null);

  const [responses, setResponses] = useState<Record<string, { price: string; outOfStock: boolean }>>({});
  const [observation, setObservation] = useState('');
  const [timeLeft, setTimeLeft] = useState<string>('Calculando...');

  useEffect(() => {
    async function loadQuotation() {
      if (!token) return;
      try {
        const res = await fetch(`/api/quotations/responder?token=${token}`);
        if (res.ok) {
          const data = await res.json();
          setQuotation(data);

          const initialResp: Record<string, { price: string; outOfStock: boolean }> = {};
          data.items.forEach((item: QuotationResponseItem) => {
            initialResp[item.id] = { price: '', outOfStock: false };
          });
          setResponses(initialResp);
        }
      } catch (err) {
        console.error('Erro ao carregar cotação para resposta:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQuotation();
  }, [token]);

  useEffect(() => {
    if (!quotation?.endDate) return;

    const targetDateStr = `${quotation.endDate}T${quotation.closingTime || '18:00'}:00`;
    const targetTime = new Date(targetDateStr).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft('Encerrado');
        clearInterval(timer);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft(`${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [quotation]);

  const handlePriceChange = (itemId: string, price: string) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], price }
    }));
  };

  const handleToggleOutOfStock = (itemId: string) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        outOfStock: !prev[itemId].outOfStock,
        price: !prev[itemId].outOfStock ? '' : prev[itemId].price
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/quotations/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          responses,
          observation,
        }),
      });

      if (!res.ok) throw new Error('Erro ao enviar resposta.');
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar sua resposta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Carregando cotação...</div>;
  }

  if (!quotation) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-red-500">Cotação não encontrada ou link expirado.</div>;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md space-y-3">
          <h1 className="text-xl font-bold text-green-600">✅ Cotação Enviada com Sucesso!</h1>
          <p className="text-xs text-slate-600">Obrigado por responder. Seus preços e observações foram registrados para a loja <strong>{quotation.storeName}</strong>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Painel do Fornecedor
            </span>
            <h1 className="text-xl font-bold text-slate-800 mt-2">{quotation.title}</h1>
            <p className="text-xs text-slate-500 mt-0.5">Solicitante: <strong className="text-slate-700">{quotation.storeName}</strong></p>
          </div>

          <div className="bg-amber-50 border border-amber-200 px-4 py-3 rounded-lg text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Tempo Restante para Envio</p>
            <p className="text-lg font-mono font-bold text-amber-900">{timeLeft}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="font-bold text-slate-800 text-sm border-b pb-3">Itens Solicitados ({quotation.items.length})</h2>

            <div className="space-y-4">
              {quotation.items.map((item) => {
                const itemResp = responses[item.id] || { price: '', outOfStock: false };
                return (
                  <div key={item.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt={item.description} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-slate-400">📦</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{item.description}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          EAN: {item.ean || 'N/A'} {item.brand ? `| Marca: ${item.brand}` : ''}
                        </p>
                        <p className="text-xs text-indigo-600 font-medium mt-1">
                          Qtd. Solicitada: <span className="font-bold">{item.requestedQuantity} un</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full md:w-auto">
                      <div className="w-full sm:w-auto">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Preço de Custo (Unit.)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-xs text-slate-400">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            disabled={itemResp.outOfStock}
                            value={itemResp.price}
                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                            className="w-full sm:w-32 pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4">
                        <input
                          type="checkbox"
                          id={`out-${item.id}`}
                          checked={itemResp.outOfStock}
                          onChange={() => handleToggleOutOfStock(item.id)}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500 h-4 w-4"
                        />
                        <label htmlFor={`out-${item.id}`} className="text-xs font-medium text-red-600 cursor-pointer">
                          Não tenho
                        </label>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Observações Finais da Cotação (Opcional)</label>
              <textarea
                rows={3}
                placeholder="Insira condições de pagamento, prazo de entrega ou descontos..."
                value={observation}
                onChange={(e) => setObservation(uppercaseText(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-3 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-8 py-3 rounded-lg transition shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : '🚀 Enviar Resposta da Cotação'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}