export function toDateInputValue(value?: string | Date | null): string {
  if (value === null || value === undefined || value === '') return '';

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10);
  }

  const normalizedValue = String(value).trim();
  if (!normalizedValue) return '';

  const dateOnlyMatch = normalizedValue.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateOnlyMatch) return dateOnlyMatch[1];

  const parsedDate = new Date(normalizedValue);
  return Number.isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString().slice(0, 10);
}