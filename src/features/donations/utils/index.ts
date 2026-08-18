import type { DonationCurrency } from '../types';

export function formatMoney(amountMinor: number, currency: DonationCurrency): string {
  const amount = amountMinor / 100;
  return `${new Intl.NumberFormat('ar-SY-u-nu-latn', { maximumFractionDigits: 0 }).format(amount)} ${currency === 'SYP' ? 'ل.س' : currency}`;
}

export function formatDonationDate(value: string): string {
  return new Intl.DateTimeFormat('ar-SY-u-nu-latn', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
