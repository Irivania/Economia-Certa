export function parseQuotationDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const datePart = value.trim().split('T')[0];
  const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return datePart;
}

export function formatQuotationDate(value: Date | string | null | undefined) {
  if (!value) return '';

  if (typeof value === 'string') {
    const datePart = value.trim().split('T')[0];
    return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : '';
  }

  if (Number.isNaN(value.getTime())) return '';

  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, '0');
  const day = String(value.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseOptionalQuotationDate(body: Record<string, unknown>, field: string) {
  if (body[field] === undefined || body[field] === null || body[field] === '') {
    return null;
  }
  return parseQuotationDate(body[field]);
}