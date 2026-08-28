export type SearchParamsSetter = (nextInit: URLSearchParams, navigateOptions?: { replace?: boolean }) => void;

function normalizedEntries(params: URLSearchParams): string {
  return Array.from(params.entries())
    .sort(([keyA, valueA], [keyB, valueB]) => keyA === keyB ? valueA.localeCompare(valueB) : keyA.localeCompare(keyB))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

export function searchParamsEqual(current: URLSearchParams, next: URLSearchParams): boolean {
  return normalizedEntries(current) === normalizedEntries(next);
}

export function commitSearchParams(
  current: URLSearchParams,
  next: URLSearchParams,
  setSearchParams: SearchParamsSetter,
  replace = true,
): boolean {
  if (searchParamsEqual(current, next)) return false;
  setSearchParams(next, { replace });
  return true;
}

// Read only values explicitly allowed by the target filter enum.
export function readEnumParam<T extends string>(value: string | null, options: readonly T[]): T | undefined {
  return value && options.includes(value as T) ? (value as T) : undefined;
}
