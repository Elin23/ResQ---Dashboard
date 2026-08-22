import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Pause, Play, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, ErrorState, Skeleton } from '@/components/ui';
import { useActivateAdvertisement, useAdvertisement } from '../hooks';
import { AdvertisementStatusBadge } from '../components/advertisement-badges';
import { DeleteAdvertisementDialog, PauseAdvertisementDialog } from '../components/advertisement-workflow-dialogs';
import { advertisementPaymentMethodLabels, advertisementPlacementConfig } from '../constants';
import { formatAdvertisementDate, formatAdvertisementMoney } from '../utils';

export function AdvertisementDetailsPage() {
  const { advertisementId = '' } = useParams();
  const navigate = useNavigate();
  const query = useAdvertisement(advertisementId);
  const activate = useActivateAdvertisement(advertisementId);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (query.isLoading) {
    return <div className="space-y-4"><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-96 rounded-xl" /></div>;
  }

  if (query.isError) {
    return <ErrorState title="تعذر تحميل الإعلان" description={query.error.message} onRetry={() => void query.refetch()} />;
  }

  if (!query.data) {
    return <ErrorState title="الإعلان غير موجود" description="قد يكون الإعلان محذوفًا أو الرابط غير صحيح." />;
  }

  const { advertisement: ad, timeline } = query.data;
  const images = [ad.creative.imageUrl, ...(ad.creative.galleryUrls ?? [])].filter(Boolean);

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
            <Link to="/advertisements">الإعلانات</Link>
            <span>/</span>
            <span>{ad.id}</span>
          </div>
          <h1 className="mt-1 text-[19px] font-semibold leading-6">{ad.publicationTitle}</h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground/75">{ad.ownerName} · {advertisementPlacementConfig[ad.placement].label}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <AdvertisementStatusBadge status={ad.status} />
          {ad.status !== 'ACTIVE' && (
            <Button
              className="h-9 rounded-xl text-[12px]"
              disabled={!ad.paid || activate.isPending}
              onClick={() => activate.mutate(undefined, {
                onSuccess: () => toast.success('تم نشر الإعلان'),
                onError: (error) => toast.error(error.message === 'PAYMENT_NOT_CONFIRMED' ? 'يجب تأكيد التسديد قبل النشر' : 'تعذر نشر الإعلان'),
              })}
            >
              <Play className="size-4" />
              نشر الإعلان
            </Button>
          )}
          {ad.status === 'ACTIVE' && (
            <Button variant="secondary" className="h-9 rounded-xl text-[12px]" onClick={() => setPauseOpen(true)}>
              <Pause className="size-4" />
              إيقاف
            </Button>
          )}
          <Button variant="ghost" className="h-9 rounded-xl text-[12px] text-critical" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" />
            حذف
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-xl border-border/45 bg-white p-0 shadow-none">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
          <main className="p-4 lg:border-e lg:border-border/40">
            <div className="grid gap-2 sm:grid-cols-2">
              {images.map((src, index) => (
                <img
                  key={`${src}-${index}`}
                  src={src}
                  alt={`${ad.creative.altText} ${index + 1}`}
                  className={index === 0 ? 'h-56 w-full rounded-xl object-cover sm:col-span-2' : 'h-36 w-full rounded-xl object-cover'}
                />
              ))}
            </div>

            <div className="mt-4">
              <h2 className="text-[14px] font-semibold">محتوى الإعلان</h2>
              <p className="mt-1 text-[12px] leading-6 text-muted-foreground">{ad.description ?? 'لا يوجد وصف إضافي.'}</p>

              <div className="mt-4 grid gap-3 border-t border-border/35 pt-4 sm:grid-cols-2">
                <Info label="هاتف النشر" value={ad.publicationPhone ?? 'غير محدد'} ltr />
                <Info label="البريد الإلكتروني" value={ad.publicationEmail ?? 'غير محدد'} ltr />
                {ad.websiteUrl && <Info label="الموقع الإلكتروني" value={ad.websiteUrl} ltr />}
                <Info label="مدة النشر" value={`${formatAdvertisementDate(ad.startAt)} — ${formatAdvertisementDate(ad.endAt)}`} />
              </div>
            </div>
          </main>

          <aside className="space-y-4 bg-muted/[0.12] p-4">
            <div>
              <h2 className="text-[14px] font-semibold">الاتفاق المالي</h2>
              <div className="mt-3 space-y-3">
                <Info label="صاحب الإعلان" value={ad.ownerName} />
                <Info label="رقم التواصل" value={ad.ownerPhone} ltr />
                <Info label="المبلغ المتفق عليه" value={formatAdvertisementMoney(ad.agreedAmountMinor)} />
                <Info label="طريقة الدفع" value={advertisementPaymentMethodLabels[ad.paymentMethod]} />
                <Info label="حالة التسديد" value={ad.paid ? 'تم التسديد' : 'غير مسدد'} />
                {ad.paymentMethod === 'TRANSFER' && (
                  <Info label="رقم الحوالة" value={ad.transferReference ?? 'غير مسجل'} ltr />
                )}
              </div>
            </div>
          </aside>
        </div>
      </Card>

      <Card className="rounded-xl border-border/45 bg-white p-4 shadow-none">
        <h2 className="text-[14px] font-semibold">سجل الإعلان</h2>
        <div className="mt-3 divide-y divide-border/35">
          {timeline.map((event) => (
            <div key={event.id} className="py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[12px] font-medium">{event.title}</p>
                <span className="text-[11px] text-muted-foreground">{formatAdvertisementDate(event.timestamp)}</span>
              </div>
              {event.details && <p className="mt-1 text-[11px] text-muted-foreground">{event.details}</p>}
            </div>
          ))}
        </div>
      </Card>

      <PauseAdvertisementDialog id={ad.id} open={pauseOpen} onOpenChange={setPauseOpen} />
      <DeleteAdvertisementDialog id={ad.id} open={deleteOpen} onOpenChange={setDeleteOpen} onDeleted={() => navigate('/advertisements')} />
    </div>
  );
}

function Info({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p dir={ltr ? 'ltr' : undefined} className={`mt-1 text-[12px] font-medium ${ltr ? 'text-left' : ''}`}>{value}</p>
    </div>
  );
}
