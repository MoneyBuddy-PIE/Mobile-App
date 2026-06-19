export function formatMoney(value: number | string): string {
    const n = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(n)) return '0';
    return n % 1 === 0 ? String(n) : n.toFixed(2);
}
