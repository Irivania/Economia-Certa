export function calculateProductMargin(costPrice: number, salePrice: number): number {
  if (costPrice <= 0 || salePrice <= 0) return 0;
  const margin = ((salePrice - costPrice) / salePrice) * 100;
  return Number(margin.toFixed(2));
}

export function formatCentsToCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}