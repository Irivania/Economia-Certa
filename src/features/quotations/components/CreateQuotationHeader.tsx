'use client';

import { memo } from 'react';
import QuotationFormHeader from '@/components/QuotationFormHeader';

interface CreateQuotationHeaderProps {
  onOpenModal: () => void;
}

export const CreateQuotationHeader = memo(function CreateQuotationHeader({ onOpenModal }: CreateQuotationHeaderProps) {
  return <QuotationFormHeader onOpenModal={onOpenModal} />;
});