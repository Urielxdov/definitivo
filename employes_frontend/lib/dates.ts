export function toInputDate(rfc3339: string): string {
  if (!rfc3339) return '';
  return rfc3339.substring(0, 10);
}

export function toRFC3339(date: string): string {
  if (!date) return '';
  return `${date}T00:00:00Z`;
}
