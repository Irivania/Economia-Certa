'use client';

import { useState, useCallback } from 'react';
import { CreateQuotationFormData, QuotationItem } from '../types/quotation.types';
import { validateQuotationPayload } from '../utils/quotationValidation';
import { createQuotation } from '../services/quotations.service';

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useCreateQuotation() {
  const [title, setTitle] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Boleto 28 Dias');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [showQuantities, setShowQuantities] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitQuotation = useCallback(
    async (
      companyId: string,
      selectedSupplierIds: string[],
      quotationItems: QuotationItem[],
      onSuccess: () => void
    ) => {
      setError(null);
      const formData: CreateQuotationFormData = {
        title,
        paymentTerms,
        startDate,
        endDate,
        closingTime,
        showQuantities,
      };

      const validation = validateQuotationPayload(formData, selectedSupplierIds, quotationItems);
      if (!validation.isValid) {
        setError(validation.error);
        return;
      }

      try {
        setSubmitting(true);
        await createQuotation({
          companyId,
          title: title.trim(),
          paymentTerms: paymentTerms.trim(),
          supplierIds: selectedSupplierIds,
          startDate: startDate || null,
          endDate: endDate || null,
          closingTime: closingTime || null,
          showQuantities,
          items: quotationItems,
        });

        onSuccess();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Erro ao criar cotação.');
      } finally {
        setSubmitting(false);
      }
    },
    [title, paymentTerms, startDate, endDate, closingTime, showQuantities]
  );

  return {
    title,
    setTitle,
    paymentTerms,
    setPaymentTerms,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    closingTime,
    setClosingTime,
    showQuantities,
    setShowQuantities,
    submitting,
    error,
    submitQuotation,
  };
}