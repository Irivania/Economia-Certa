'use client';

import { use, useEffect, useState } from 'react';
import { OrdersClientView } from '@/features/quotations/components/OrdersClientView';
import { OrdersLoadingState } from '@/features/quotations/components/OrdersLoadingState';
import { getQuotationById } from '@/features/quotations/services/quotations.service';
import { Quotation } from '@/features/quotations/types/quotation.types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function QuotationDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const quotationId = resolvedParams.id;

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getQuotationById(quotationId);
        if (data) setQuotation(data);
      } catch {
        // Tratamento de erro silencioso
      } finally {
        setLoading(false);
      }
    }
    if (quotationId) loadData();
  }, [quotationId]);

  if (loading) {
    return <OrdersLoadingState />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Gestão de Pedidos da Cotação
        </h1>
        <p className="text-xs text-slate-500">
          {quotation?.title || `Cotação #${quotationId}`}
        </p>
      </div>

      <OrdersClientView 
        quotationId={quotationId} 
        quotationTitle={quotation?.title || 'Cotação'} 
      />
    </div>
  );
}