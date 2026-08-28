import { Link } from 'react-router';

import { Card, Skeleton } from '@/components/ui';

import { useDonationSummary } from '../hooks';
import { formatMoney } from '../utils';

export function EntityDonationSupportCard({ title, organizationId }: { title: string; organizationId?: string; reportId?: string }) {
  const query = useDonationSummary(
    organizationId
      ? { organizationId }
      : undefined,
  );

  // Show donation totals only for the selected organization when an ID is provided.
  const totalAmount =
    query.data?.total
      .map((item) => formatMoney(item.amountMinor, item.currency))
      .join(' + ') || '0 ل.س';

  return (
    <Card className="rounded-xl border-border/45 bg-white p-4 shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-semibold">{title}</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground/75">
            أرشيف حملات التبرع العامة المرتبطة بالجمعية.
          </p>
        </div>

        {organizationId && (
          <Link
            className="text-[12px] font-medium text-primary"
            to={`/donations?organizationId=${organizationId}`}
          >
            عرض الأرشيف
          </Link>
        )}
      </div>

      {query.isLoading ? (
        <Skeleton className="mt-3 h-10" />
      ) : (
        <div className="mt-3 flex items-end justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2.5">
          <div>
            <p className="text-[11px] text-muted-foreground">إجمالي الأرشيف</p>
            <p className="mt-0.5 text-[15px] font-semibold">{totalAmount}</p>
          </div>

          <span className="text-[11px] text-muted-foreground">
            {query.data?.publishedCampaigns ?? 0} حملات منشورة
          </span>
        </div>
      )}
    </Card>
  );
}