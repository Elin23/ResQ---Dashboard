import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { Badge, Button, Card, ConfirmDialog, ErrorState, PageHeader, Skeleton } from '@/components/ui';
import { PermissionGuard } from '@/features/auth/rbac';
import { RoleEditor } from '../components/settings-components';
import { useAdminUsers, useDeleteRole, useRole } from '../hooks';

export function RoleDetailsPage() {
  const { roleId = '' } = useParams();
  const query = useRole(roleId);
  const nav = useNavigate();
  const del = useDeleteRole();
  const [confirm, setConfirm] = useState(false);

  const users = useAdminUsers({
    search: '',
    roleId,
    page: 1,
    pageSize: 50,
  });

  if (query.isLoading) {
    return <Skeleton className="h-[38rem]" />;
  }

  if (query.isError) {
    return (
      <ErrorState
        title="تعذر تحميل الدور"
        description={query.error.message}
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (!query.data) {
    return <ErrorState title="الدور غير موجود" />;
  }

  const role = query.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={role.name}
        description={role.description}
        breadcrumbs={[
          { label: 'الإعدادات', href: '/settings' },
          { label: 'الأدوار', href: '/settings/roles' },
          { label: role.name },
        ]}
        actions={
          <>
            {role.system && <Badge tone="info">دور نظام</Badge>}

            {!role.system && (
              <PermissionGuard permission="roles.delete">
                <Button
                  variant="danger"
                  onClick={() => setConfirm(true)}
                >
                  حذف الدور
                </Button>
              </PermissionGuard>
            )}
          </>
        }
      />

      <RoleEditor role={role} />

      <Card>
        <h2 className="font-bold">المسؤولون الذين يستخدمون هذا الدور</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          يساعد هذا السياق على مراجعة أثر أي تغيير قبل حفظه.
        </p>

        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {users.data?.items.map((a) => (
            <Link
              key={a.id}
              to={`/settings/admin-users/${a.id}`}
              className="rounded-md border p-3 hover:bg-muted/40"
            >
              <p className="font-semibold">{a.fullName}</p>
              <p className="text-xs text-muted-foreground" dir="ltr">{a.email}</p>
            </Link>
          ))}
        </div>
      </Card>

      {/* Custom roles can be deleted only after confirming their current usage impact. */}
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="حذف الدور المخصص"
        description="لا يمكن حذف دور نظام أو دور مستخدم من قبل مسؤولين. سيبقى سجل التدقيق محفوظًا."
        confirmLabel="حذف الدور"
        destructive
        onConfirm={async () => {
          try {
            await del.mutateAsync(role.id);
            toast.success('تم حذف الدور المخصص.');
            nav('/settings/roles');
          } catch (e) {
            toast.error(e instanceof Error ? e.message : 'تعذر حذف الدور.');
          }
        }}
      />
    </div>
  );
}