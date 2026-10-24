export function formatDate(value?: string | null): string {
  if (!value) return '-';
  const cleanStr = String(value).split('T')[0];
  const parts = cleanStr.split('-');
  if (parts.length !== 3) return '-';
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}