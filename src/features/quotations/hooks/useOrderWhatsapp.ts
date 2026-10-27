'use client';

import { useCallback } from 'react';
import { ProcessedOrder } from '../types/order.types';
import { openWhatsAppChat } from '../utils/whatsapp.utils';

export function useOrderWhatsapp(quotationTitle: string) {
  const sendViaWhatsApp = useCallback((order: ProcessedOrder) => {
    openWhatsAppChat(quotationTitle, order);
  }, [quotationTitle]);

  return { sendViaWhatsApp };
}