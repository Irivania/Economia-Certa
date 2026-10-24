'use client';

import { useState, useEffect } from 'react';
import { DashboardMetricsState, Product, QuotationRaw } from '@/features/dashboard/types/dashboard.types';
import { dashboardService } from '@/features/dashboard/services/dashboard.service';

export function useDashboardMetrics(companyId: string | null) {
  const [state, setState] = useState<DashboardMetricsState>({
    productCount: 0,
    quotationCount: 0,
    completedQuotationCount: 0,
    latestQuotationId: '',
    lowStockProducts: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!companyId) return;

    const controller = new AbortController();

    async function loadMetrics() {
      try {
        setState((prev: DashboardMetricsState) => ({ ...prev, loading: true, error: null }));

        const [products, quotations] = await Promise.all([
          dashboardService.fetchProducts(controller.signal),
          dashboardService.fetchQuotations(controller.signal),
        ]);

        const productCount = products.length;
        const lowStockProducts = products.filter(
          (p: Product) => (p.stockCurrent ?? 0) <= (p.stockMin ?? 0) && (p.stockMin ?? 0) > 0
        );

        const activeQuotations = quotations.filter((q: QuotationRaw) =>
          ['OPEN', 'PENDING'].includes(String(q.status || '').toUpperCase())
        );
        const completedQuotations = quotations.filter((q: QuotationRaw) =>
          ['COMPLETED', 'RESPONDED', 'CLOSED', 'ORDERED', 'PARTIALLY_CLOSED'].includes(
            String(q.status || '').toUpperCase()
          )
        );

        setState({
          productCount,
          quotationCount: activeQuotations.length,
          completedQuotationCount: completedQuotations.length,
          latestQuotationId: quotations[0]?.id || '',
          lowStockProducts,
          loading: false,
          error: null,
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Erro ao carregar métricas do dashboard:', err);
        setState((prev: DashboardMetricsState) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Erro desconhecido ao carregar métricas.',
        }));
      }
    }

    void loadMetrics();

    return () => {
      controller.abort();
    };
  }, [companyId]);

  return state;
}