import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button, EmptyState, Modal, Textarea } from '@/components/ui';
import { usePermission } from '@/features/auth/rbac';

import { entityTypeLabels } from '../constants';
import { useApproveMapListing, useRejectMapListing } from '../hooks';
import type { MapListingRequest } from '../types';

const defaultRejectionReason = 'المعلومات أو الصور لا تثبت وجود المكان بالشكل المطلوب.';

export function MapRequestsView({ requests }: { requests: MapListingRequest[] }) {
  const canReview = usePermission('map.review');
  const approve = useApproveMapListing();
  const reject = useRejectMapListing();
  const [rejecting, setRejecting] = useState<MapListingRequest>();
  const [reason, setReason] = useState(defaultRejectionReason);

  const pending = requests.filter((item) => item.metadata.reviewStatus === 'PENDING');

  const openReject = (item: MapListingRequest) => {
    setReason(defaultRejectionReason);
    setRejecting(item);
  };

  const closeReject = () => {
    setRejecting(undefined);
    setReason(defaultRejectionReason);
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border/45 bg-white">
        <div className="border-b border-border/35 px-4 py-3">
          <p className="text-[13px] font-semibold">طلبات الظهور على الخريطة</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">طلبات المستخدمين العاديين فقط تحتاج موافقة الإدارة قبل أن تصبح ظاهرة للعامة.</p>
        </div>

        {pending.length ? (
          <div className="overflow-x-auto" tabIndex={0} aria-label="جدول طلبات الظهور على الخريطة">
            <table dir="rtl" className="w-full min-w-[760px] text-[12px]">
              <thead className="bg-muted/30 text-muted-foreground">
                <tr>
                  {['المكان', 'الفئة', 'مقدم الطلب', 'الموقع', 'التواصل', 'الإجراءات'].map((header) => (
                    <th key={header} className="px-3.5 py-2.5 text-start font-medium">{header}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {pending.map((item) => (
                  <tr key={item.id} className="border-t border-border/35 hover:bg-primary/[0.02]">
                    <td className="px-3.5 py-3 align-middle">
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-0.5 max-w-56 truncate text-[11px] text-muted-foreground">{item.metadata.description ?? item.address}</p>
                    </td>
                    <td className="px-3.5 py-3 align-middle">{entityTypeLabels[item.type]}</td>
                    <td className="px-3.5 py-3 align-middle">{item.metadata.ownerName}</td>
                    <td className="px-3.5 py-3 align-middle">{item.governorate}{item.city ? ` — ${item.city}` : ''}</td>
                    <td dir="ltr" className="px-3.5 py-3 text-left align-middle text-muted-foreground">{item.metadata.phone ?? '—'}</td>
                    <td className="px-3.5 py-3 align-middle">
                      {canReview ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={approve.isPending}
                            onClick={() =>
                              approve.mutate(item.id, {
                                onSuccess: () => toast.success('تمت الموافقة ونشر المكان.'),
                                onError: () => toast.error('تعذر نشر المكان. حاول مرة أخرى.'),
                              })
                            }
                          >
                            <Check className="size-4" />
                            نشر
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => openReject(item)}>
                            <X className="size-4" />
                            رفض
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">للعرض فقط</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState title="لا توجد طلبات تنتظر المراجعة" description="ستظهر هنا طلبات المستخدمين الراغبين بإضافة مكان جديد إلى الخريطة." />
          </div>
        )}
      </div>

      <Modal
        open={Boolean(rejecting)}
        onOpenChange={(open) => {
          if (!open) closeReject();
        }}
        title="رفض طلب الظهور"
        description={rejecting?.title}
        footer={
          <>
            <Button variant="secondary" onClick={closeReject}>إلغاء</Button>
            <Button
              variant="danger"
              disabled={reason.trim().length < 3 || reject.isPending}
              onClick={() =>
                rejecting &&
                reject.mutate(
                  { id: rejecting.id, reason: reason.trim() },
                  {
                    onSuccess: () => {
                      toast.success('تم رفض الطلب وتسجيل السبب.');
                      closeReject();
                    },
                    onError: () => toast.error('تعذر رفض الطلب. حاول مرة أخرى.'),
                  },
                )
              }
            >
              تأكيد الرفض
            </Button>
          </>
        }
      >
        <label className="text-[12px] font-medium">
          سبب الرفض
          <Textarea className="mt-1" value={reason} onChange={(event) => setReason(event.target.value)} />
        </label>
      </Modal>
    </>
  );
}
