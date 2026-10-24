'use client';

import { TRACKING_STATUS_CLASSES, TRACKING_STATUS_LABELS } from '../constants/tracking.constants';

interface QuotationTrackingStatusProps {
  status: string;
}

export function QuotationTrackingStatus({ status }: QuotationTrackingStatusProps) {
  const label = TRACKING_STATUS_LABELS[status] || status;
  const badgeClass = TRACKING_STATUS_CLASSES[status] || TRACKING_STATUS_CLASSES.PENDING;

  return (
    <span
      className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
      role="status"
    >
      {label}
    </span>
  );
}