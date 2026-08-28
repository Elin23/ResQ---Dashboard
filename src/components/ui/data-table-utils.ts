import type { SortingState } from '@tanstack/react-table';

// Keep row activation from stealing clicks from controls rendered inside a row.
export function isInteractiveTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        'button, a, input, select, textarea, [role="menuitem"], [role="checkbox"]',
      ),
    )
  );
}

export function sameSorting(left: SortingState, right: SortingState): boolean {
  return (
    left.length === right.length &&
    left.every(
      (item, index) =>
        item.id === right[index]?.id && item.desc === right[index]?.desc,
    )
  );
}

export function formatArabicCount(count: number): string {
  return count.toLocaleString('ar-SA-u-nu-latn');
}
