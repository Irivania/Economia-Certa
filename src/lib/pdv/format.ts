const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(value: number): string {
  return brlFormatter
    .format(Number.isFinite(value) ? value : 0)
    .replace(/\u00a0/g, " ");
}
