'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCatalogProducts } from './useCatalogProducts';
import { useQuotationSuppliers } from './useQuotationSuppliers';
import { useQuotationItems } from './useQuotationItems';
import { useCreateQuotation } from './useCreateQuotation';
import { getCompanyId } from '@/lib/companySession';
import { validateQuotationPayload } from '../utils/quotationValidation';
import { createQuotation } from '../services/quotations.service';

export function useQuotationCreation() {
  const router = useRouter();
  const companyId = getCompanyId();

  const catalog = useCatalogProducts();
  const quotationSuppliers = useQuotationSuppliers();
  const quotationItems = useQuotationItems();
  const quotationForm = useCreateQuotation();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleQuickRegisterProduct = useCallback(async (itemPendente: { descricaoPadronizada: string; ean?: string | null; precoVenda?: number | string }) => {
    if (!companyId) return;
    await catalog.quickRegisterProduct({
      companyId,
      description: itemPendente.descricaoPadronizada,
      code: itemPendente.ean || null,
      salePrice: Number(itemPendente.precoVenda) || 34.99,
      stockIdeal: 10,
      stockCurrent: 0,
    });
  }, [catalog, companyId]);

  const submit = useCallback(async () => {
    if (!companyId) {
      setError('Sessão da empresa não encontrada.');
      return;
    }

    setError(null);
    setSuccessMessage(null);

    const formData = {
      title: quotationForm.title,
      paymentTerms: quotationForm.paymentTerms,
      startDate: quotationForm.startDate,
      endDate: quotationForm.endDate,
      closingTime: quotationForm.closingTime,
      showQuantities: quotationForm.showQuantities,
    };

    const validation = validateQuotationPayload(formData, quotationSuppliers.selectedSupplierIds, quotationItems.quotationItems);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    try {
      setSubmitting(true);
      await createQuotation({
        companyId,
        title: quotationForm.title.trim(),
        paymentTerms: quotationForm.paymentTerms.trim(),
        supplierIds: quotationSuppliers.selectedSupplierIds,
        startDate: quotationForm.startDate || null,
        endDate: quotationForm.endDate || null,
        closingTime: quotationForm.closingTime || null,
        showQuantities: quotationForm.showQuantities,
        items: quotationItems.quotationItems,
      });

      setSuccessMessage('Cotação criada e enviada com sucesso!');
      
      // Pequeno delay para o utilizador ler o aviso visual antes do redirecionamento
      setTimeout(() => {
        router.push('/cotacoes');
      }, 1200);
      
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar cotação.');
      setSubmitting(false);
    }
  }, [companyId, quotationForm, quotationSuppliers.selectedSupplierIds, quotationItems.quotationItems, router]);

  return {
    catalog,
    quotationSuppliers,
    quotationItems,
    quotationForm,
    submitting: submitting || quotationForm.submitting,
    error: error || quotationForm.error,
    successMessage,
    handleQuickRegisterProduct,
    submit,
  };
}

export type QuotationCreationDomain = ReturnType<typeof useQuotationCreation>;