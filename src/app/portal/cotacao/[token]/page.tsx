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
  startDate?: string | null;
  endDate?: string | null;
  closingTime?: string | null;
  items: QuotationResponseItem[];
}

interface PageProps {
  params: Promise<{ token: string }>;
}

function parseDateValue(value?: string | Date | null) {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoDateMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoDateMatch) {
    return new Date(`${isoDateMatch[1]}T00:00:00`);
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('/');
    return new Date(`${year}-${month}-${day}T00:00:00`);
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getDateKey(value?: string | Date | null) {
  if (typeof value === 'string') {
    const isoDateMatch = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoDateMatch) return isoDateMatch[1];
  }

  const parsed = parseDateValue(value);
  return parsed ? toLocalDateString(parsed) : null;
}

function formatDateValue(value?: string | Date | null) {
  const parsed = parseDateValue(value);
  if (!parsed) return 'Não definido';
  return parsed.toLocaleDateString('pt-BR');
}

function toLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDeadlineTimestamp(dateKey: string, closingTime?: string | null) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const [hours = 23, minutes = 59] = (closingTime || '23:59').split(':').map(Number);
  const deadline = new Date(year, month - 1, day, hours, minutes, 0, 0);

  return Number.isNaN(deadline.getTime()) ? null : deadline.getTime();
}

export default function ResponderCotacaoPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [quotation, setQuotation] = useState<QuotationData | null>(null);

  const [responses, setResponses] = useState<Record<string, { price: string; outOfStock: boolean }>>({});
  const [observation, setObservation] = useState('');
  const [timeLeft, setTimeLeft] = useState<string>('Prazo não definido');

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
    if (!quotation) {
      return;
    }

    const targetDateKey = getDateKey(quotation.endDate ?? quotation.startDate) ?? toLocalDateString(new Date());
    const targetTime = getDeadlineTimestamp(targetDateKey, quotation.closingTime);

    if (targetTime === null) {
      return;
    }

    let timer: ReturnType<typeof setInterval> | null = null;

    const updateTimer = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft('Encerrado');
        if (timer) clearInterval(timer);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(
        days > 0
          ? `${days}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
          : `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateTimer();
    timer = setInterval(updateTimer, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quotation]);

  const handlePriceChange = (itemId: string, rawValue: string) => {
    const numbersOnly = rawValue.replace(/\D/g, '');
    if (!numbersOnly) {
      setResponses(prev => ({ ...prev, [itemId]: { ...prev[itemId], price: '' } }));
      return;
    }

    const amount = Number(numbersOnly) / 100;
    const formatted = amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    setResponses(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], price: formatted, outOfStock: false }
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

  // 🚀 Lógica de navegação rápida por Enter (Avança ou marca "Não tenho" se vazio)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const currentItem = quotation?.items[index];
      if (currentItem) {
        const resp = responses[currentItem.id];
        const hasPrice = resp && resp.price.trim() !== '';

        if (!hasPrice) {
          handleToggleOutOfStock(currentItem.id);
        }
      }

      const nextInput = document.getElementById(`price-input-${index + 1}`);
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotation) return;

    const missingItems = quotation.items.filter(item => {
      const resp = responses[item.id];
      const hasPrice = resp && resp.price.trim() !== '';
      const isOut = resp && resp.outOfStock;
      return !hasPrice && !isOut;
    });

    if (missingItems.length > 0) {
      const names = missingItems.map(i => `• ${i.description}`).join('\n');
      alert(`Atenção! Você deixou ${missingItems.length} item(ns) sem preço e sem marcar "Não tenho":\n\n${names}\n\nPor favor, preencha todos os itens antes de enviar.`);
      return;
    }

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
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Painel do Fornecedor
            </span>
            <h1 className="text-xl font-bold text-slate-800 mt-2">{quotation.title}</h1>
            <p className="text-xs text-slate-500">Solicitante: <strong className="text-slate-700">{quotation.storeName}</strong></p>
            
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600 font-medium">
              <span>📅 Início: <strong className="text-slate-800">{quotation.startDate ? formatDateValue(quotation.startDate) : 'Imediato'}</strong></span>
              <span>•</span>
              <span>⏰ Término: <strong className="text-slate-800">{quotation.endDate ? formatDateValue(quotation.endDate) : quotation.startDate ? formatDateValue(quotation.startDate) : 'Hoje'} {quotation.closingTime ? `às ${quotation.closingTime}` : ''}</strong></span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 px-4 py-3 rounded-lg text-right shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Tempo Restante</p>
            <p className="text-lg font-mono font-bold text-amber-900">{timeLeft}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="font-bold text-slate-800 text-sm border-b pb-3">Itens Solicitados ({quotation.items.length})</h2>

            <div className="space-y-4">
              {quotation.items.map((item, index) => {
                const itemResp = responses[item.id] || { price: '', outOfStock: false };
                return (
                  <div key={item.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    
                    <div className="flex items-center gap-4 w-full md:w-3/5">
                      <div className="w-14 h-14 min-w-[3.5rem] rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt={item.description} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-slate-400">📦</span>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-800 text-sm truncate">{item.description}</p>
                        <p className="text-[11px] text-slate-500 font-mono truncate">
                          EAN: {item.ean || 'N/A'} {item.brand ? `| Marca: ${item.brand}` : ''}
                        </p>
                        <p className="text-xs text-indigo-600 font-medium mt-1">
                          Qtd. Solicitada: <span className="font-bold">{item.requestedQuantity} un</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full md:w-auto justify-end">
                      <div className="w-full sm:w-auto">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Preço de Custo (Unit.)</label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-xs text-slate-400 font-medium">R$</span>
                          <input
                            id={`price-input-${index}`}
                            type="text"
                            inputMode="numeric"
                            placeholder="0,00"
                            disabled={itemResp.outOfStock}
                            value={itemResp.price}
                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="w-full sm:w-36 pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 font-medium"
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