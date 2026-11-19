export function parseQuantityQuery(value: string): {
  qty: number;
  query: string;
} {
  const trimmedValue = value.trim();
  if (!trimmedValue.includes("*")) {
    return { qty: 1, query: trimmedValue };
  }

  const [rawQuantity, queryPart] = trimmedValue.split("*");
  const parsedQuantity = parseInt(rawQuantity, 10);

  return {
    qty:
      !Number.isNaN(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1,
    query: (queryPart || "").trim(),
  };
}
