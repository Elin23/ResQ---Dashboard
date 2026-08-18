export function formatAdvertisementDate(value?: string): string {
  if (!value) return 'غير محدد';
  return new Intl.DateTimeFormat('ar-SY-u-nu-latn', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export function formatAdvertisementMoney(amountMinor: number): string {
  return `${new Intl.NumberFormat('ar-SY-u-nu-latn', { maximumFractionDigits: 0 }).format(amountMinor / 100)} ل.س`;
}
