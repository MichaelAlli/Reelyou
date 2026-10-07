export function normalizeSkyAreaName(label: string): string {
  return label.trim().replace(/\s+/g, ' ').toLowerCase();
}
