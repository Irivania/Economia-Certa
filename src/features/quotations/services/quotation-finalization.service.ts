interface FinalizePayload {
  choices: Record<string, string>;
  orders: Record<string, Array<{
    productId: string;
    description: string;
    imageUrl?: string | null;
    quantity: number;
    price: number;
  }>>;
  unrequestedItems: Array<{
    productId: string;
    description?: string;
    imageUrl?: string | null;
    quantity: number;
    reason: string;
  }>;
  paymentTerms: string;
}

export async function postFinalizeQuotation(quotationId: string, payload: FinalizePayload): Promise<void> {
  const finalizeResponse = await fetch(`/api/quotations/${quotationId}/finalize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!finalizeResponse.ok) {
    const failure = await finalizeResponse.json().catch(() => ({}));
    const errorMessage = typeof failure === 'object' && failure !== null && 'error' in failure
      ? String((failure as { error?: unknown }).error)
      : 'Não foi possível registrar os pedidos.';
    throw new Error(errorMessage);
  }
}