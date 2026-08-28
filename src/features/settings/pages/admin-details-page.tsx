import { Link, useParams } from 'react-router';

import { Avatar, Badge, Card, ErrorState, PageHeader, Skeleton } from '@/components/ui';
import { PermissionGuard } from '@/features/auth/rbac';

import { AdminStatusBadge } from '../components/settings-components';
import { useAdminUser } from '../hooks';
import { formatAdminDate } from '../utils';

export function AdminDetailsPage() {
  const { adminId = '' } = useParams();
  const query = useAdminUser(adminId);

  if (query.isLoading) {
    return <Skeleton className="h-[34rem]" />;
  }

  if (query.isError) {
    return (
      <ErrorState
        title="تعذر تحميل المسؤول"
        description={query.error.message}
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (!query.data) {
    return (
      <ErrorState
        title="المسؤول غير موجود"
        description="تحقق من المعرف الإداري."
      />
    );
  }

  const a = query.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={a.fullName}
        description={`${a.id} · حساب إداري مستقل عن حسابات مستخدمي المنصة`}
        breadcrumbs={[
          { label: 'الإعدادات', href: '/settings' },
          { label: 'المسؤولون', href: '/settings/admin-users' },
          { label: a.fullName },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-6">
          <Card>
            <div className="flex items-center gap-4">
              <Avatar name={a.fullName} size="lg" />

              <div className="min-w-0">
                <h2 className="truncate font-bold">{a.fullName}</h2>
                <p dir="ltr" className="truncate text-sm text-muted-foreground">
                  {a.email}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">الحالة:</span>{' '}
                <AdminStatusBadge status={a.status} />
              </p>

              <p>
                <span className="text-muted-foreground">آخر دخول:</span>{' '}
                {formatAdminDate(a.lastLoginAt)}
              </p>

              <p>
                <span className="text-muted-foreground">المصادقة الثنائية:</span>{' '}
                {a.mfaEnabled ? 'مفعلة' : 'غير مفعلة/غير متاحة'}
              </p>

              <p>
                <span className="text-muted-foreground">تاريخ الإنشاء:</span>{' '}
                {formatAdminDate(a.createdAt)}
              </p>
            </div>
          </Card>

          {/* Admin roles are read-only after account creation. */}
          <Card>
            <h2 className="font-bold">الدور الإداري</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              يتم تعيين الدور عند إنشاء الحساب الإداري ولا يتم تعديله من صفحة الحساب.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {a.roles.map((role) => (
                <Badge key={role.id} tone="info">
                  {role.name}
                </Badge>
              ))}
            </div>
          </Card>
        </main>

        <aside className="space-y-6">
          <Card>
            <h2 className="font-bold">معلومات الحساب</h2>

            <div className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">معرف المسؤول</span>
                <span dir="ltr" className="font-medium">{a.id}</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">عدد الأدوار</span>
                <span className="font-medium">{a.roles.length.toLocaleString('ar-SA-u-nu-latn')}</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">حالة الحساب</span>
                <AdminStatusBadge status={a.status} />
              </div>
            </div>
          </Card>

          <PermissionGuard permission="audit.read">
            <Card>
              <h2 className="font-bold">سجل الإجراءات</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                استخدم سجل النشاط المركزي لعرض الأحداث المنسوبة لهذا المسؤول.
              </p>

              <Link
                className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
                to={`/audit-log?actorId=${encodeURIComponent(a.id)}`}
              >
                فتح سجل النشاط
              </Link>
            </Card>
          </PermissionGuard>
        </aside>
      </div>
    </div>
  );
}
