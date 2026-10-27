'use client';

import { useQuotationOrders } from '../hooks/useQuotationOrders';
import { EmptyOrdersState } from './EmptyOrdersState';
import { OrderCard } from './OrderCard';
import { UnrequestedItemsCard } from './UnrequestedItemsCard';

interface OrdersClientViewProps {
  quotationId: string;
  quotationTitle: string;
}

export function OrdersClientView({ quotationId, quotationTitle }: OrdersClientViewProps) {
  const { orders, unrequestedItems, sendOrder, updateStatus } = useQuotationOrders(quotationId);

  if (orders.length === 0 && unrequestedItems.length === 0) {
    return <EmptyOrdersState />;
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <OrderCard
          key={order.orderKey}
          order={order}
          quotationTitle={quotationTitle}
          onSendOrder={sendOrder}
          onUpdateStatus={updateStatus}
        />
      ))}
      <UnrequestedItemsCard unrequestedItems={unrequestedItems} />
    </div>
  );
}