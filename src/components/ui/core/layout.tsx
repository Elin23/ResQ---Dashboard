import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router';

import { cn } from '@/lib/cn';

import { Button, IconButton, Input } from './controls';

export function Pagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav
      aria-label="التنقل بين الصفحات"
      className="flex items-center gap-1.5"
    >
      <IconButton
        label="الصفحة السابقة"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronRight className="size-4" />
      </IconButton>

      <span className="min-w-20 rounded-lg bg-muted/35 px-3 py-2 text-center text-[12px] font-medium text-muted-foreground">
        {page} من {Math.max(pageCount, 1)}
      </span>

      <IconButton
        label="الصفحة التالية"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronLeft className="size-4" />
      </IconButton>
    </nav>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: Array<{
    label: string;
    href?: string;
  }>;
}) {
  return (
    <nav aria-label="مسار الصفحة">
      <ol className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground/70">
        {items.map((item, index) => (
          <li
            key={`${item.label}-${index}`}
            className="flex items-center gap-2"
          >
            {index > 0 && (
              <ChevronLeft
                className="size-3.5"
                aria-hidden="true"
              />
            )}

            {item.href ? (
              <Link
                className="transition-colors duration-150 hover:text-foreground"
                to={item.href}
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current="page"
                className="text-foreground"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Skeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'resq-skeleton overflow-hidden rounded-md bg-muted',
        className,
      )}
    />
  );
}

export function EmptyState({
  title = 'لا توجد بيانات',
  description = 'لا توجد عناصر لعرضها حاليًا.',
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
      <p className="font-semibold">
        {title}
      </p>

      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {description}
      </p>

      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'تعذر تحميل البيانات',
  description = 'حدث خطأ غير متوقع. حاول مرة أخرى.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-critical/20 bg-critical/5 p-6 text-center"
    >
      <p className="font-semibold text-critical">
        {title}
      </p>

      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {description}
      </p>

      {onRetry && (
        <Button
          className="mt-4"
          variant="secondary"
          onClick={onRetry}
        >
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}

export function SearchInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div
      className={cn(
        'relative',
        className,
      )}
    >
      <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

      <Input
        type="search"
        className="ps-10"
        {...props}
      />
    </div>
  );
}

export function DebouncedSearchInput({
  value = '',
  onValueChange,
  debounceMs = 300,
  ...props
}: Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> & {
  value?: string;
  onValueChange: (value: string) => void;
  debounceMs?: number;
}) {
  const [draft, setDraft] = useState(String(value));
  const latestOnValueChange = useRef(onValueChange);

  useEffect(() => {
    latestOnValueChange.current = onValueChange;
  }, [onValueChange]);

  useEffect(() => {
    const next = String(value);

    setDraft((current) =>
      current === next
        ? current
        : next,
    );
  }, [value]);

  useEffect(() => {
    const next = String(value);

    if (draft === next) {
      return;
    }

    const timer = window.setTimeout(
      () => latestOnValueChange.current(draft),
      debounceMs,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    debounceMs,
    draft,
    value,
  ]);

  return (
    <SearchInput
      {...props}
      value={draft}
      onChange={(event) =>
        setDraft(event.target.value)
      }
    />
  );
}

export function FilterBar({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="resq-filter-bar flex flex-col gap-2 rounded-xl border border-border/45 bg-white p-2.5 shadow-none sm:flex-row sm:flex-wrap sm:items-center sm:gap-2.5">
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}) {
  return (
    <header className="space-y-1">
      {breadcrumbs && (
        <Breadcrumbs items={breadcrumbs} />
      )}

      <div className="flex flex-col justify-between gap-2.5 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <h1 className="text-[19px] font-semibold leading-6 tracking-tight text-foreground">
            {title}
          </h1>

          {description && (
            <p className="mt-0.5 max-w-4xl text-[12px] leading-5 text-muted-foreground/75">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0 sm:justify-end">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

export function SectionHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-[14px] font-semibold text-foreground">
          {title}
        </h2>

        {description && (
          <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground/75">
            {description}
          </p>
        )}
      </div>

      {actions}
    </div>
  );

}
