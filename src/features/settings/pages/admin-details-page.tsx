import { Link, useParams } from 'react-router';
import { Avatar, Badge, Card, ErrorState, PageHeader, Skeleton } from '@/components/ui';
import { permissionDefinitions } from '@/features/auth/permissions';
import { PermissionGuard } from '@/features/auth/rbac';
import { useSession } from '@/features/auth/session';
import { AdminRolesEditor, AdminStatusActions, AdminStatusBadge } from '../components/settings-components';
import { useAdminUser, useRoles } from '../hooks';
import { formatAdminDate, getEffectivePermissions } from '../utils';

export function AdminDetailsPage() {
  const { adminId = '' } = useParams();
  const query = useAdminUser(adminId);
  const roles = useRoles();
  const { session } = useSession();

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

  const roleRecords = (roles.data ?? []).filter((r) =>
    a.roles.some((x) => x.id === r.id),
  );

  // Effective permissions are the union of all assigned roles.
  const effective = getEffectivePermissions(roleRecords);

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
        actions={
          <AdminStatusActions
            admin={a}
            currentAdminId={session?.id ?? ''}
          />
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-6">
          <Card>
            <div className="flex items-center gap-4">
              <Avatar
                name={a.fullName}
                size="lg"
              />

              <div>
                <h2 className="font-bold">{a.fullName}</h2>
                <p dir="ltr" className="text-sm text-muted-foreground">
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

          <PermissionGuard permission="admins.update">
            <AdminRolesEditor admin={a} />
          </PermissionGuard>

          <Card>
            <h2 className="font-bold">الصلاحيات الفعلية</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              اتحاد صلاحيات الأدوار الممنوحة. لا توجد استثناءات فردية.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {effective.map((key) => {
                const permission = permissionDefinitions.find((p) => p.key === key);

                return (
                  <Badge
                    key={key}
                    tone={permission?.sensitive ? 'critical' : 'neutral'}
                  >
                    {permission?.label ?? key}
                  </Badge>
                );
              })}
            </div>
          </Card>
        </main>

        <aside className="space-y-6">
          <Card>
            <h2 className="font-bold">الأدوار</h2>

            <div className="mt-3 space-y-2">
              {a.roles.map((r) => (
                <Link
                  key={r.id}
                  to={`/settings/roles/${r.id}`}
                  className="block rounded-md border p-3 hover:bg-muted/40"
                >
                  {r.name}
                </Link>
              ))}
            </div>
          </Card>

          <PermissionGuard permission="audit.read">
            <Card>
              <h2 className="font-bold">سجل الإجراءات</h2>

              <p className="mt-2 text-sm text-muted-foreground">
                استخدم سجل النشاط المركزي لعرض الأحداث المنسوبة لهذا المسؤول.
              </p>

              <Link
                className="mt-3 inline-block text-sm font-semibold text-primary"
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