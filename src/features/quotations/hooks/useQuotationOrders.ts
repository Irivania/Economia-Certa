'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Quotation as QuotationData, SupplierTracking } from '../types/quotation.types';
import { UnrequestedItem, OrderStatus, OrderItem, QuotationSupplier } from '../types/order.types';
import { getQuotationById, getPersistedOrders, getUnrequestedItems, finalizeOrder, updateOrderStatusApi, PersistedOrderResponse } from '../services/quotations.service';
import { useQuotationOrdersStorage } from './useQuotationOrdersStorage';
import { buildProcessedOrders } from '../mappers/quotation-order.mapper';
import { QuotationOrdersStorageService } from '../services/quotation-orders-storage.service';

export function useQuotationOrders(quotationId: string) {
  const [quotation, setQuotation] = useState<QuotationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { payload, updateStorage } = useQuotationOrdersStorage(quotationId);
  const [unrequestedItems, setUnrequestedItems] = useState<UnrequestedItem[]>(payload.unrequestedItems || []);
  const [orderStatuses, setOrderStatuses] = useState<Record<string, OrderStatus>>({});
  const [sendingOrders, setSendingOrders] = useState<Record<string, boolean>>({});
  const [sentOrderIds, setSentOrderIds] = useState<Record<string, string | null>>({});

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const quotData = await getQuotationById(quotationId);
        if (quotData) {
          setQuotation(quotData);

          if (quotData.companyId) {
            const persistedOrders = await getPersistedOrders(quotData.companyId);
            setOrderStatuses(
              Object.fromEntries(
                persistedOrders.map((o: PersistedOrderResponse) => [
                  o.quotationSupplierId || o.supplierId, 
                  o.status
                ])
              )
            );
          }

          const unreq = await getUnrequestedItems(quotationId);
          if (unreq.length) setUnrequestedItems(unreq);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    }
    if (quotationId) init();
  }, [quotationId]);

  const sendOrder = useCallback(async (orderKey: string) => {
    const rawOrdersMap = payload.orders || {};
    const record = rawOrdersMap[orderKey];
    const items = Array.isArray(record) ? record : record?.items;

    if (!items?.length || sentOrderIds[orderKey] || sendingOrders[orderKey]) return;

    setSendingOrders(prev => ({ ...prev, [orderKey]: true }));
    try {
      const result = await finalizeOrder(quotationId, {
        orders: { [orderKey]: items as OrderItem[] },
        paymentTerms: payload.paymentTerms || quotation?.paymentTerms || '',
        unrequestedItems,
      });

      const ordersList = Array.isArray(result.orders) ? result.orders : [];
      const order = ordersList.find((item: Record<string, unknown>) => {
        const itemSupId = String(item.quotationSupplierId || item.supplierId || '');
        return itemSupId === orderKey;
      });

      if (!order || typeof order.id !== 'string') {
        throw new Error('A API não retornou o ID do pedido enviado.');
      }

      const orderId = order.id;
      setSentOrderIds(prev => ({ ...prev, [orderKey]: orderId }));
      const newPayload = QuotationOrdersStorageService.updateOrderInStorage(quotationId, orderKey, orderId, items as OrderItem[]);
      updateStorage(newPayload);

      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Pedido enviado ao representante.', type: 'success' } }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: err instanceof Error ? err.message : 'Erro ao enviar pedido.', type: 'error' } }));
    } finally {
      setSendingOrders(prev => ({ ...prev, [orderKey]: false }));
    }
  }, [quotationId, payload, sentOrderIds, sendingOrders, quotation, unrequestedItems, updateStorage]);

  const updateStatus = useCallback(async (orderKey: string, status: OrderStatus) => {
    const orderId = sentOrderIds[orderKey];
    if (!orderId) return;
    try {
      await updateOrderStatusApi(quotationId, { orderId, status, actorRole: 'STORE' });
      setOrderStatuses(prev => ({ ...prev, [orderKey]: status }));
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Status atualizado com sucesso.', type: 'success' } }));
    } catch {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Não foi possível atualizar o status.', type: 'error' } }));
    }
  }, [quotationId, sentOrderIds]);

  const processedOrders = useMemo(() => {
    const rawSuppliers = quotation?.suppliers || [];
    const formattedSuppliers: QuotationSupplier[] = rawSuppliers.map((s: SupplierTracking) => ({
      supplierId: s.supplierId || s.id,
      quotationSupplierId: s.quotationSupplierId || s.id,
      name: s.name,
      observation: s.observation,
    }));

    return buildProcessedOrders(payload.orders, formattedSuppliers, payload.paymentTerms || quotation?.paymentTerms || '', orderStatuses, sentOrderIds, sendingOrders);
  }, [payload.orders, payload.paymentTerms, quotation?.suppliers, quotation?.paymentTerms, orderStatuses, sentOrderIds, sendingOrders]);

  return {
    quotation,
    loading,
    error,
    orders: processedOrders,
    unrequestedItems,
    paymentTerms: payload.paymentTerms || quotation?.paymentTerms || '',
    sendOrder,
    updateStatus,
  };
}