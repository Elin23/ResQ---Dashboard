import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button, ConfirmDialog, EmptyState } from '@/components/ui';
import { usePermission } from '@/features/auth/rbac';

import { entityTypeLabels } from '../constants';
import { useDeleteMapListing, useToggleMapListing } from '../hooks';
import type { MapEntity } from '../types';

export function MapManageView({ entities }: { entities: MapEntity[] }) {
  const canUpdate = usePermission('map.update');
  const canDelete = usePermission('map.delete');
  const toggle = useToggleMapListing();
  const remove = useDeleteMapListing();
  const [deleting, setDeleting] = useState<MapEntity>();

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border/45 bg-white">
        <div className="border-b border-border/35 px-4 py-3">
          <p className="text-[13px] font-semibold">إدارة الأماكن المنشورة</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">يمكن تعطيل أو حذف الإدخالات اليدوية وطلبات المستخدمين. الجمعيات ونقاط الإطعام تُدار من صفحاتها الأصلية.</p>
        </div>

        {entities.length ? (
          <div className="overflow-x-auto" tabIndex={0} aria-label="جدول إدارة الأماكن المنشورة">
            <table dir="rtl" className="w-full min-w-[780px] text-[12px]">
              <thead className="bg-muted/30 text-muted-foreground">
                <tr>
                  {['المكان', 'الفئة', 'المصدر', 'الموقع', 'الحالة', 'الإجراءات'].map((header) => (
                    <th key={header} className="px-3.5 py-2.5 text-start font-medium">{header}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {entities.map((item) => {
                  const managed = !['ORGANIZATION_AUTO', 'FEEDING_POINT_AUTO'].includes(item.metadata.source);
                  const hasActions = managed && (canUpdate || canDelete);

                  return (
                    <tr key={item.id} className="border-t border-border/35 hover:bg-primary/[0.02]">
                      <td className="px-3.5 py-3 align-middle font-medium">{item.title}</td>
                      <td className="px-3.5 py-3 align-middle">{entityTypeLabels[item.type]}</td>
                      <td className="px-3.5 py-3 align-middle text-muted-foreground">
                        {item.metadata.source === 'ADMIN'
                          ? 'إضافة الإدارة'
                          : item.metadata.source === 'USER_REQUEST'
                            ? 'طلب مستخدم'
                            : item.metadata.source === 'ORGANIZATION_AUTO'
                              ? 'تلقائي من الجمعية'
                              : 'تلقائي من نقطة الإطعام'}
                      </td>
                      <td className="px-3.5 py-3 align-middle">{item.governorate}{item.city ? ` — ${item.city}` : ''}</td>
                      <td className="px-3.5 py-3 align-middle">{item.metadata.status === 'ACTIVE' ? 'نشط' : 'متوقف'}</td>
                      <td className="px-3.5 py-3 align-middle">
                        {!managed ? (
                          <span className="text-[11px] text-muted-foreground">من السجل الأصلي</span>
                        ) : hasActions ? (
                          <div className="flex gap-2">
                            {canUpdate && (
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={toggle.isPending}
                                onClick={() =>
                                  toggle.mutate(item.id, {
                                    onSuccess: () => toast.success(item.metadata.status === 'ACTIVE' ? 'تم إيقاف المكان.' : 'تمت إعادة تفعيل المكان.'),
                                    onError: () => toast.error('تعذر تحديث حالة المكان.'),
                                  })
                                }
                              >
                                {item.metadata.status === 'ACTIVE' ? 'إيقاف' : 'إعادة تفعيل'}
                              </Button>
                            )}

                            {canDelete && (
                              <Button size="sm" variant="ghost" className="text-critical" onClick={() => setDeleting(item)}>
                                <Trash2 className="size-4" />
                                حذف
                              </Button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">للعرض فقط</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState title="لا توجد أماكن منشورة" description="ستظهر الأماكن المنشورة هنا عند توفرها." />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(undefined);
        }}
        title="حذف المكان من الخريطة"
        description={deleting ? `سيتم حذف ${deleting.title} من الخريطة.` : 'سيتم حذف المكان المحدد من الخريطة.'}
        confirmLabel="حذف"
        destructive
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success('تم حذف المكان.');
              setDeleting(undefined);
            },
            onError: () => toast.error('تعذر حذف المكان.'),
          })
        }
      />
    </>
  );
}
