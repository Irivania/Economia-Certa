import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MappedProduct, Quotation } from '../types/quotation-response.types';
import { postFinalizeQuotation } from '../services/quotation-finalization.service';
import { validateFinalizationPayload } from '../validators/quotation-finalization.validator';

interface UseQuotationFinalizationProps {
  quotationId: string;
  quotation: Quotation | null;
  productsList: MappedProduct[];
  selectedChoices: Record<string, string>;
  ignoredProducts: Set<string>;
}

interface OrderItemPayload {
  productId: string;
  description: string;
  imageUrl?: string | null;
  quantity: number;
  price: number;
}

interface UnrequestedItemPayload {
  productId: string;
  description?: string;
  imageUrl?: string | null;
  quantity: number;
  reason: string;
}

export function useQuotationFinalization({
  quotationId,
  quotation,
  productsList,
  selectedChoices,
  ignoredProducts,
}: UseQuotationFinalizationProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleFinalizeQuotation = useCallback(async () => {
    if (!quotation) return;
    try {
      setSaving(true);
      const ordersMap: Record<string, OrderItemPayload[]> = {};

      Object.entries(selectedChoices).forEach(([productId, supplierId]) => {
        if (ignoredProducts.has(productId)) return;
        const product = productsList.find((p) => p.productId === productId);
        if (product && product.responses[supplierId]) {
          if (!ordersMap[supplierId]) ordersMap[supplierId] = [];
          ordersMap[supplierId].push({
            productId,
            description: product.description,
            imageUrl: product.imageUrl,
            quantity: product.requestedQuantity,
            price: product.responses[supplierId].price,
          });
        }
      });

      const unrequestedItems: UnrequestedItemPayload[] = productsList
        .filter((product) => ignoredProducts.has(product.productId) || !selectedChoices[product.productId])
        .map((product) => ({
          productId: product.productId,
          description: product.description,
          imageUrl: product.imageUrl,
          quantity: product.requestedQuantity,
          reason: ignoredProducts.has(product.productId)
            ? 'Não desejado pelo lojista'
            : 'Sem fornecedor disponível ou não selecionado',
        }));

      if (!validateFinalizationPayload(ordersMap, unrequestedItems)) {
        alert('Selecione um fornecedor ou marque os produtos que não serão comprados.');
        setSaving(false);
        return;
      }

      await postFinalizeQuotation(quotationId, {
        choices: selectedChoices,
        orders: ordersMap,
        unrequestedItems,
        paymentTerms: quotation.paymentTerms || '',
      });

      alert('Cotação finalizada com sucesso! Os pedidos de compra foram gerados.');
      router.push(`/cotacoes/pedidos/${quotationId}`);
    } catch (err: unknown) {
      console.error(err);
      alert('Erro ao finalizar a cotação.');
    } finally {
      setSaving(false);
    }
  }, [quotationId, quotation, productsList, selectedChoices, ignoredProducts, router]);

  return {
    saving,
    handleFinalizeQuotation,
  };
}