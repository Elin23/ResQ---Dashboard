import type { ReactNode } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Building2,
  CircleAlert,
  CircleDollarSign,
  HeartHandshake,
  Clock3,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

import { Link } from 'react-router';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Badge,
  Card,
  EmptyState,
  Skeleton,
  StatusBadge,
} from '@/components/ui';

import {
  cn,
} from '@/lib/cn';

import type {
  ActiveMission,
  AttentionItem,
  CriticalReport,
  DashboardMetric,
  WeeklyReportPoint,
} from '../types';

const chartPrimary =
  'hsl(var(--color-primary))';

const chartSuccess =
  'hsl(var(--color-success))';

const chartGrid =
  'hsl(var(--color-border))';

const chartText =
  'hsl(var(--color-muted-foreground))';

const metricIcons = {
  reports: ShieldAlert,
  critical: CircleAlert,
  waiting: Clock3,
  adoptions: UserCheck,
  organizations: Building2,
  donations: CircleDollarSign,
};

const toneClasses = {
  neutral:
    'bg-muted/60 text-muted-foreground',

  success:
    'bg-success/[0.08] text-success',

  pending:
    'bg-pending/10 text-brown',

  critical:
    'bg-critical/[0.08] text-critical',

  info:
    'bg-info/[0.08] text-info',
};

const primaryMetricKeys = [
  'reports',
  'waiting',
  'adoptions',
  'donations',
] as const;

export function DashboardMetrics({
  metrics,
}: {
  metrics: DashboardMetric[];
}) {
  if (metrics.length === 0) {
    return (
      <EmptyState
        title="لا توجد مؤشرات"
        description="لم تصل مؤشرات تشغيلية للفترة المختارة."
      />
    );
  }

  const selectedMetrics =
    primaryMetricKeys
      .map((iconKey) =>
        metrics.find(
          (metric) =>
            metric.iconKey ===
            iconKey,
        ),
      )
      .filter(
        (
          metric,
        ): metric is DashboardMetric =>
          Boolean(metric),
      );

  if (
    selectedMetrics.length < 4
  ) {
    for (const metric of metrics) {
      if (
        selectedMetrics.length >=
        4
      ) {
        break;
      }

      const alreadyExists =
        selectedMetrics.some(
          (selected) =>
            selected.id ===
            metric.id,
        );

      if (!alreadyExists) {
        selectedMetrics.push(
          metric,
        );
      }
    }
  }

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-2.5
        sm:grid-cols-2
        xl:grid-cols-4
      "
    >
      {selectedMetrics.map(
        (metric) => {
          const Icon =
            metricIcons[
              metric.iconKey
            ] ?? Activity;

          const value =
            typeof metric.value ===
            'number'
              ? metric.value.toLocaleString(
                  'ar-SA-u-nu-latn',
                )
              : metric.value;

          return (
            <Link
              key={metric.id}
              to={metric.target}
              className="
                group
                min-w-0
                rounded-xl
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary/20
              "
            >
              <Card
                className="
                  h-[94px]
                  overflow-hidden
                  rounded-xl
                  border
                  border-border/45
                  bg-white
                  p-3.5
                  shadow-none
                  transition-[border-color,background-color]
                  duration-200
                  group-hover:border-primary/25
                  group-hover:bg-primary/[0.025]
                "
              >
                <div
                  className="
                    flex
                    h-full
                    items-center
                    gap-3
                  "
                >
                  <span
                    className={cn(
                      `
                        flex
                        size-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        transition-[background-color,color]
                        duration-200

                        group-hover:bg-primary
                        group-hover:text-primary-foreground
                      `,
                      toneClasses[
                        metric.tone
                      ],
                    )}
                  >
                    <Icon
                      className="size-4"
                      strokeWidth={
                        1.65
                      }
                    />
                  </span>

                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >
                    <p
                      className="
                        truncate
                        text-[12px]
                        font-normal
                        text-muted-foreground
                        transition-colors
                        duration-200
                        group-hover:text-foreground
                      "
                    >
                      {metric.label}
                    </p>

                    <div
                      className="
                        mt-1.5
                        flex
                        min-w-0
                        items-end
                        gap-2
                      "
                    >
                      <p
                        className="
                          shrink-0
                          text-[1.55rem]
                          font-semibold
                          leading-none
                          tracking-tight
                          text-foreground
                          transition-colors
                          duration-200
                          group-hover:text-primary
                        "
                      >
                        {value}
                      </p>

                      <p
                        className="
                          min-w-0
                          truncate
                          pb-0.5
                          text-[11px]
                          leading-4
                          text-muted-foreground/65
                          transition-colors
                          duration-200
                          group-hover:text-muted-foreground
                        "
                      >
                        {
                          metric.context
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        },
      )}
    </div>
  );
}

function waitingLabel(
  minutes: number,
): string {
  if (minutes < 60) {
    return `منذ ${minutes.toLocaleString(
      'ar-SA-u-nu-latn',
    )} دقيقة`;
  }

  const hours =
    Math.floor(minutes / 60);

  if (hours < 24) {
    return `منذ ${hours.toLocaleString(
      'ar-SA-u-nu-latn',
    )} ساعة`;
  }

  return `منذ ${Math.floor(
    hours / 24,
  ).toLocaleString(
    'ar-SA-u-nu-latn',
  )} يوم`;
}

function DashboardSectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="
        flex
        min-w-0
        items-start
        justify-between
        gap-4
      "
    >
      <div className="min-w-0">
        <h2
          className="
            text-[14px]
            font-semibold
            leading-5
            text-foreground
          "
        >
          {title}
        </h2>

        {description && (
          <p
            className="
              mt-0.5
              truncate
              text-[11px]
              leading-4
              text-muted-foreground/70
            "
          >
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

export function OperationalOverview({
  attentionItems,
  attentionLoading,
  attentionError,
  onAttentionRetry,
  weeklyReports,
}: {
  attentionItems?: AttentionItem[];
  attentionLoading: boolean;
  attentionError?: string;
  onAttentionRetry: () => void;
  weeklyReports: WeeklyReportPoint[];
}) {
  const visibleItems =
    attentionItems?.slice(
      0,
      3,
    );

  return (
    <Card
      className="
        rounded-xl
        border
        border-border/45
        bg-white
        p-0
        shadow-none
      "
    >
      <div
        className="
          grid
          lg:grid-cols-12
        "
      >
        <section
          className="
            min-w-0
            p-4
            lg:col-span-5
            lg:border-e
            lg:border-border/40
          "
        >
          <DashboardSectionTitle
            title="يحتاج إلى إجراء"
            description="الأمور التي تحتاج انتباهك الآن"
          />

          <div
            className="
              mt-3
              space-y-1
            "
          >
            {attentionError ? (
              <div
                className="
                  flex
                  min-h-[150px]
                  flex-col
                  items-center
                  justify-center
                  text-center
                "
              >
                <p
                  className="
                    text-[12px]
                    text-critical
                  "
                >
                  تعذر تحميل الإجراءات.
                </p>

                <button
                  type="button"
                  className="
                    mt-2
                    text-[12px]
                    font-medium
                    text-primary
                  "
                  onClick={
                    onAttentionRetry
                  }
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : attentionLoading ? (
              Array.from(
                {
                  length: 3,
                },
                (_, index) => (
                  <Skeleton
                    key={index}
                    className="
                      h-[52px]
                      w-full
                      rounded-lg
                    "
                  />
                ),
              )
            ) : visibleItems &&
              visibleItems.length >
                0 ? (
              visibleItems.map(
                (item) => (
                  <Link
                    key={item.id}
                    to={
                      item.target
                    }
                    className="
                      flex
                      min-h-[54px]
                      items-center
                      gap-2.5
                      rounded-lg
                      px-2
                      py-1.5
                      transition-colors
                      duration-150
                      hover:bg-muted/30
                    "
                  >
                    <span
                      className={cn(
                        `
                          flex
                          size-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                        `,
                        toneClasses[
                          item
                            .severity
                        ],
                      )}
                    >
                      {item.severity ===
                      'critical' ? (
                        <AlertTriangle
                          className="size-4"
                          strokeWidth={
                            1.7
                          }
                        />
                      ) : (
                        <Clock3
                          className="size-4"
                          strokeWidth={
                            1.7
                          }
                        />
                      )}
                    </span>

                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <p
                        className="
                          truncate
                          text-[12px]
                          font-medium
                          leading-4
                          text-foreground
                        "
                      >
                        {
                          item.title
                        }
                      </p>

                      <p
                        className="
                          mt-0.5
                          truncate
                          text-[11px]
                          leading-4
                          text-muted-foreground/70
                        "
                      >
                        {waitingLabel(
                          item.waitingMinutes,
                        )}
                        {' · '}
                        {
                          item.detail
                        }
                      </p>
                    </div>

                    <ArrowLeft
                      className="
                        size-3.5
                        shrink-0
                        text-muted-foreground/50
                      "
                      strokeWidth={1.7}
                    />
                  </Link>
                ),
              )
            ) : (
              <div
                className="
                  flex
                  min-h-[150px]
                  items-center
                  justify-center
                  text-center
                "
              >
                <p
                  className="
                    text-[12px]
                    text-muted-foreground
                  "
                >
                  لا توجد إجراءات عاجلة الآن.
                </p>
              </div>
            )}
          </div>
        </section>

        <section
          className="
            min-w-0
            p-4
            lg:col-span-7
          "
        >
          <DashboardSectionTitle
            title="اتجاه البلاغات"
            description="المستلمة والمغلقة خلال الأسبوع"
          />

          <div
            className="
              mt-2
              h-[175px]
            "
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
              debounce={120}
            >
              <LineChart
                data={
                  weeklyReports
                }
                margin={{
                  top: 4,
                  right: 0,
                  left: -18,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  stroke={
                    chartGrid
                  }
                  strokeDasharray="3 3"
                  vertical={
                    false
                  }
                  opacity={0.35}
                />

                <XAxis
                  dataKey="day"
                  tick={{
                    fill: chartText,
                    fontSize: 11,
                  }}
                  axisLine={
                    false
                  }
                  tickLine={
                    false
                  }
                />

                <YAxis
                  tick={{
                    fill: chartText,
                    fontSize: 11,
                  }}
                  axisLine={
                    false
                  }
                  tickLine={
                    false
                  }
                />

                <RechartsTooltip
                  contentStyle={{
                    borderColor:
                      chartGrid,
                    borderRadius:
                      8,
                    direction:
                      'rtl',
                    fontSize: 12,
                  }}
                />

                <Line
                  name="المستلمة"
                  type="monotone"
                  dataKey="received"
                  stroke={
                    chartPrimary
                  }
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 3,
                  }}
                />

                <Line
                  name="المغلقة"
                  type="monotone"
                  dataKey="closed"
                  stroke={
                    chartSuccess
                  }
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 3,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div
            className="
              mt-1
              flex
              items-center
              gap-4
              text-[11px]
              text-muted-foreground
            "
          >
            <span
              className="
                inline-flex
                items-center
                gap-1.5
              "
            >
              <span
                className="
                  size-1.5
                  rounded-full
                  bg-primary
                "
              />

              البلاغات المستلمة
            </span>

            <span
              className="
                inline-flex
                items-center
                gap-1.5
              "
            >
              <span
                className="
                  size-1.5
                  rounded-full
                  bg-success
                "
              />

              المغلقة
            </span>
          </div>
        </section>
      </div>
    </Card>
  );
}

const priorityMeta = {
  CRITICAL: {
    label: 'حرجة',
    tone: 'critical' as const,
  },

  HIGH: {
    label: 'عالية',
    tone: 'pending' as const,
  },

  MEDIUM: {
    label: 'متوسطة',
    tone: 'info' as const,
  },

  LOW: {
    label: 'منخفضة',
    tone: 'neutral' as const,
  },
};

export function DashboardWorkOverview({
  missions,
  reports,
}: {
  missions: ActiveMission[];
  reports: CriticalReport[];
}) {
  const visibleMissions =
    missions.slice(0, 3);

  const visibleReports =
    reports.slice(0, 3);

  return (
    <Card
      className="
        rounded-xl
        border
        border-border/45
        bg-white
        p-0
        shadow-none
      "
    >
      <div
        className="
          grid
          lg:grid-cols-2
        "
      >
        <section
          className="
            min-w-0
            p-4
            lg:border-e
            lg:border-border/40
          "
        >
          <DashboardSectionTitle
            title="عمليات الإنقاذ"
            description="المهام النشطة حاليًا"
            action={
              <Link
                to="/reports"
                className="
                  shrink-0
                  text-[12px]
                  font-medium
                  text-primary
                "
              >
                عرض الكل
              </Link>
            }
          />

          <div
            className="
              mt-3
              space-y-1
            "
          >
            {visibleMissions.length ===
            0 ? (
              <p
                className="
                  py-10
                  text-center
                  text-[12px]
                  text-muted-foreground
                "
              >
                لا توجد عمليات إنقاذ نشطة.
              </p>
            ) : (
              visibleMissions.map(
                (mission) => (
                  <Link
                    key={
                      mission.id
                    }
                    to={`/reports/${mission.id.replace(/^CASE-/, '')}`}
                    className="
                      flex
                      min-h-[50px]
                      items-center
                      gap-2.5
                      rounded-lg
                      px-2
                      py-1.5
                      transition-colors
                      hover:bg-muted/30
                    "
                  >
                    <span
                      className="
                        flex
                        size-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-primary/[0.06]
                        text-primary
                      "
                    >
                      <HeartHandshake
                        className="size-4"
                        strokeWidth={
                          1.7
                        }
                      />
                    </span>

                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-1.5
                        "
                      >
                        <p
                          className="
                            truncate
                            text-[12px]
                            font-medium
                            leading-4
                          "
                        >
                          {
                            mission.animal
                          }
                        </p>

                        <Badge
                          tone={
                            priorityMeta[
                              mission
                                .priority
                            ].tone
                          }
                        >
                          {
                            priorityMeta[
                              mission
                                .priority
                            ].label
                          }
                        </Badge>
                      </div>

                      <p
                        className="
                          mt-0.5
                          truncate
                          text-[11px]
                          leading-4
                          text-muted-foreground/70
                        "
                      >
                        {
                          mission.location
                        }
                        {' · '}
                        {
                          mission.progress
                        }
                        %
                      </p>
                    </div>

                    <StatusBadge
                      status={
                        mission.stage
                      }
                    />
                  </Link>
                ),
              )
            )}
          </div>
        </section>

        <section
          className="
            min-w-0
            p-4
          "
        >
          <DashboardSectionTitle
            title="البلاغات الحرجة"
            description="الحالات ذات الأولوية الأعلى"
            action={
              <Link
                to="/reports?severity=CRITICAL"
                className="
                  shrink-0
                  text-[12px]
                  font-medium
                  text-primary
                "
              >
                عرض الكل
              </Link>
            }
          />

          <div
            className="
              mt-3
              space-y-1
            "
          >
            {visibleReports.length ===
            0 ? (
              <p
                className="
                  py-10
                  text-center
                  text-[12px]
                  text-muted-foreground
                "
              >
                لا توجد بلاغات حرجة.
              </p>
            ) : (
              visibleReports.map(
                (report) => (
                  <Link
                    key={
                      report.id
                    }
                    to={`/reports/${report.id}`}
                    className="
                      flex
                      min-h-[50px]
                      items-center
                      gap-2.5
                      rounded-lg
                      px-2
                      py-1.5
                      transition-colors
                      hover:bg-muted/30
                    "
                  >
                    <span
                      className="
                        flex
                        size-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-critical/[0.07]
                        text-critical
                      "
                    >
                      <ShieldAlert
                        className="size-4"
                        strokeWidth={
                          1.7
                        }
                      />
                    </span>

                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <p
                        className="
                          truncate
                          text-[12px]
                          font-medium
                          leading-4
                        "
                      >
                        {
                          report.animal
                        }
                      </p>

                      <p
                        className="
                          mt-0.5
                          truncate
                          text-[11px]
                          leading-4
                          text-muted-foreground/70
                        "
                      >
                        {
                          report.location
                        }
                        {' · '}
                        {waitingLabel(
                          Math.max(
                            1,
                            Math.round(
                              (Date.now() -
                                new Date(
                                  report.submittedAt,
                                ).getTime()) /
                                60_000,
                            ),
                          ),
                        )}
                      </p>
                    </div>

                    <Badge
                      tone={
                        report.severity ===
                        'CRITICAL'
                          ? 'critical'
                          : 'pending'
                      }
                    >
                      {report.severity ===
                      'CRITICAL'
                        ? 'حرجة'
                        : 'عالية'}
                    </Badge>
                  </Link>
                ),
              )
            )}
          </div>
        </section>
      </div>
    </Card>
  );
}

export function DashboardSectionSkeleton() {
  return (
    <div className="space-y-3">
      <div
        className="
          grid
          gap-2.5
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        {Array.from(
          {
            length: 4,
          },
          (_, index) => (
            <Skeleton
              key={index}
              className="
                h-[94px]
                rounded-xl
              "
            />
          ),
        )}
      </div>

      <Skeleton
        className="
          h-[245px]
          rounded-xl
        "
      />

      <Skeleton
        className="
          h-[205px]
          rounded-xl
        "
      />
    </div>
  );
}