export interface WeeklyHoursRow {
  day: string;
  closed: boolean;
  open24Hours?: boolean;
  opensAt?: string;
  closesAt?: string;
}

export function WeeklyOperatingHours({
  hours,
  dayLabels,
}: {
  hours: WeeklyHoursRow[];
  dayLabels: Record<string, string>;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {hours.map((hour) => (
        <div
          key={hour.day}
          className="flex justify-between rounded-md bg-muted/60 px-3 py-2 text-sm"
        >
          <span>
            {dayLabels[hour.day] ?? hour.day}
          </span>

          <span className="font-semibold">
            {hour.open24Hours
              ? '24 ساعة'
              : hour.closed
                ? 'مغلق'
                : `${hour.opensAt ?? '—'} — ${hour.closesAt ?? '—'}`}
          </span>
        </div>
      ))}
    </div>
  );
}