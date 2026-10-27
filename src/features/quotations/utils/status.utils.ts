import { OrderStatus } from '../types/order.types';

export function getStatusLabel(status?: OrderStatus): string {
  switch (status) {
    case 'SENT':
      return 'Enviado';
    case 'DISPATCHED':
      return 'Despachado';
    case 'RECEIVED':
      return 'Recebido';
    case 'CLOSED':
      return 'Baixado';
    default:
      return 'Pendente';
  }
}