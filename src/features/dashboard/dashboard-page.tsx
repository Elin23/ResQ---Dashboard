import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import {
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ErrorState,
} from '@/components/ui';

import {
  useSession,
} from '@/features/auth/session';

import {
  DashboardMetrics,
  DashboardSectionSkeleton,
  DashboardWorkOverview,
  OperationalOverview,
} from './components/dashboard-sections';

import {
  useAttentionQueue,
  useDashboardSummary,
} from './hooks';

import type {
  DashboardRange,
} from './types';

const rangeOptions: Array<{
  value: DashboardRange;
  label: string;
}> = [
  {
    value: 'TODAY',
    label: 'اليوم',
  },
  {
    value: '7D',
    label: 'آخر 7 أيام',
  },
  {
    value: '30D',
    label: 'آخر 30 يومًا',
  },
];

function greeting(
  name: string,
): string {
  const hour =
    new Date().getHours();

  const firstName =
    name
      .trim()
      .split(/\s+/)[0] ||
    name;

  if (hour < 12) {
    return `صباح الخير، ${firstName}`;
  }

  return `مساء الخير، ${firstName}`;
}

function queryErrorMessage(
  error: Error | null,
): string | undefined {
  return error?.message;
}

function RangeFilter({
  value,
  onChange,
}: {
  value: DashboardRange;
  onChange: (
    value: DashboardRange,
  ) => void;
}) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const containerRef =
    useRef<HTMLDivElement>(
      null,
    );

  const selectedOption =
    rangeOptions.find(
      (option) =>
        option.value === value,
    ) ?? rangeOptions[0];

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (
      event: MouseEvent,
    ) => {
      const target =
        event.target as Node;

      if (
        !containerRef.current?.contains(
          target,
        )
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === 'Escape'
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handlePointerDown,
    );

    document.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handlePointerDown,
      );

      document.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="
        relative
        shrink-0
      "
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() =>
          setOpen(
            (current) =>
              !current,
          )
        }
        className="
          flex
          h-9
          min-w-[118px]
          items-center
          justify-between
          gap-3
          rounded-xl
          border
          border-border/50
          bg-white
          px-3
          text-[12px]
          font-medium
          text-foreground
          shadow-none
          transition-colors
          duration-150
          hover:border-primary/20
          hover:bg-primary/[0.025]
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-primary/20
        "
      >
        <span>
          {
            selectedOption.label
          }
        </span>

        <ChevronDown
          className={`
            size-3.5
            shrink-0
            text-muted-foreground
            transition-transform
            duration-150
            ${
              open
                ? 'rotate-180'
                : ''
            }
          `}
          strokeWidth={1.7}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="الفترة الزمنية"
          className="
            absolute
            end-0
            top-full
            z-40
            mt-1.5
            w-[150px]
            overflow-hidden
            rounded-xl
            border
            border-border/50
            bg-white
            p-1
            shadow-[0_8px_24px_-16px_rgba(0,0,0,0.22)]
          "
        >
          {rangeOptions.map(
            (option) => {
              const selected =
                option.value ===
                value;

              return (
                <button
                  key={
                    option.value
                  }
                  type="button"
                  role="option"
                  aria-selected={
                    selected
                  }
                  onClick={() => {
                    onChange(
                      option.value,
                    );

                    setOpen(
                      false,
                    );
                  }}
                  className={`
                    flex
                    h-9
                    w-full
                    items-center
                    justify-between
                    gap-3
                    rounded-lg
                    px-2.5
                    text-start
                    text-[12px]
                    transition-colors
                    duration-150

                    ${
                      selected
                        ? `
                            bg-primary/[0.07]
                            font-medium
                            text-primary
                          `
                        : `
                            font-normal
                            text-muted-foreground
                            hover:bg-primary/[0.05]
                            hover:text-primary
                          `
                    }
                  `}
                >
                  <span>
                    {
                      option.label
                    }
                  </span>

                  {selected && (
                    <Check
                      className="
                        size-3.5
                        shrink-0
                      "
                      strokeWidth={
                        1.8
                      }
                    />
                  )}
                </button>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}

export function DashboardPage() {
  const {
    session,
  } = useSession();

  const [
    range,
    setRange,
  ] =
    useState<DashboardRange>(
      'TODAY',
    );

  const summary =
    useDashboardSummary(
      range,
    );

  const attention =
    useAttentionQueue();

  const updatedAt =
    summary.data?.generatedAt
      ? format(
          new Date(
            summary.data.generatedAt,
          ),
          'h:mm a',
          {
            locale: arSA,
          },
        )
      : '—';

  return (
    <div
      className="
        flex
        min-h-0
        flex-col
        gap-3.5
      "
    >
      <div
        className="
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="min-w-0">
          <h1
            className="
              truncate
              text-[18px]
              font-semibold
              leading-6
              tracking-tight
              text-foreground
              sm:text-[19px]
            "
          >
            {greeting(
              session?.name ??
                'أحمد',
            )}
          </h1>

          <p
            className="
              mt-0.5
              text-[11px]
              font-normal
              text-muted-foreground/70
            "
          >
            آخر تحديث {updatedAt}
          </p>
        </div>

        <RangeFilter
          value={range}
          onChange={
            setRange
          }
        />
      </div>

      {summary.isLoading ? (
        <DashboardSectionSkeleton />
      ) : summary.isError ? (
        <ErrorState
          description={
            summary.error.message
          }
          onRetry={() =>
            void summary.refetch()
          }
        />
      ) : summary.data ? (
        <>
          <DashboardMetrics
            metrics={
              summary.data
                .metrics
            }
          />

          <OperationalOverview
            attentionItems={
              attention.data
            }
            attentionLoading={
              attention.isLoading
            }
            attentionError={queryErrorMessage(
              attention.error,
            )}
            onAttentionRetry={() =>
              void attention.refetch()
            }
            weeklyReports={
              summary.data
                .weeklyReports
            }
          />

          <DashboardWorkOverview
            missions={
              summary.data
                .activeMissions
            }
            reports={
              summary.data
                .criticalReports
            }
          />
        </>
      ) : null}
    </div>
  );
}