export function validateFinalizationPayload(
  ordersMap: Record<string, unknown[]>,
  unrequestedItems: unknown[]
): boolean {
  if (Object.keys(ordersMap).length === 0 && unrequestedItems.length === 0) {
    return false;
  }
  return true;
}