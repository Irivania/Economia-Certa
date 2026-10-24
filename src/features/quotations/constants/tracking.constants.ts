import { TrackingStatus } from '../types/tracking.types';

export const TRACKING_STATUS_LABELS: Record<TrackingStatus | string, string> = {
  PENDING: 'Pendente de envio',
  SENT: 'Enviado',
  RESPONDED: 'Respondido',
};

export const TRACKING_STATUS_CLASSES: Record<TrackingStatus | string, string> = {
  RESPONDED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  SENT: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  PENDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
};