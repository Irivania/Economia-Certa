'use client';

import { memo } from 'react';

interface QuotationErrorAlertProps {
  error: string | null;
}

export const QuotationErrorAlert = memo(function QuotationErrorAlert({ error }: QuotationErrorAlertProps) {
  if (!error) return null;
  return (
    <p role="alert" className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-xs font-semibold text-rose-500">
      {error}
    </p>
  );
});