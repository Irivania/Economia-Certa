export function formatCurrency(value: number | null | undefined): string {
  const numericValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);
}