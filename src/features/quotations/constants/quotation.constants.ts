import { QuotationStatus, SupplierStatus } from '../types/quotation.types';

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus | string, string> = {
  OPEN: 'Aberta',
  ORDERED: 'Pedidos enviados',
  PARTIALLY_CLOSED: 'Parcialmente encerrada',
  CLOSED: 'Encerrada',
  CANCELLED: 'Cancelada',
};

export const SUPPLIER_STATUS_CLASSES: Record<SupplierStatus | string, string> = {
  RESPONDIDO: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  ENVIADO: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
  CANCELLED: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
};

// --- CONSTANTES ADICIONADAS PARA O MÓDULO DE CRIAÇÃO DE COTAÇÕES ---

export const DEFAULT_PAYMENT_TERMS = 'Boleto 28 Dias';

export const PAYMENT_TERMS_OPTIONS = [
  { value: 'Boleto 15 Dias', label: 'Boleto 15 Dias' },
  { value: 'Boleto 28 Dias', label: 'Boleto 28 Dias' },
  { value: 'Boleto 30 Dias', label: 'Boleto 30 Dias' },
  { value: 'PIX à Vista', label: 'PIX à Vista' },
  { value: 'Cartão Corporativo', label: 'Cartão Corporativo' },
] as const;