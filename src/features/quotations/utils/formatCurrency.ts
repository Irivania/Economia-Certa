export function formatCurrency(value: number): string {
  if (!value || value <= 0) return '-';
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}