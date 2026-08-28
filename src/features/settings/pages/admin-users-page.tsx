import { Clock3, PauseCircle, ShieldCheck, UserCheck, UserPlus, UsersRound } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Button, EmptyState, ErrorState, Input, PageHeader, Select } from '@/components/ui';
import { SummaryCard } from '@/components/ui/summary-card';
import { PermissionGuard } from '@/features/auth/rbac';
import { readEnumParam } from '@/lib/search-params';
import { AdminUsersTable, InviteAdminDialog } from '../components/settings-components';
import { adminStatusLabels } from '../constants';
import { useAdminUsers, useRoles } from '../hooks';
import { adminAccountStatuses, type AdminFilters } from '../types';


function parse(p: URLSearchParams): AdminFilters {
  return {
    search: p.get('q') ?? '',
    status: readEnumParam(p.get('status'), adminAccountStatuses),
    roleId: p.get('role') ?? undefined,
    lastLogin: readEnumParam(p.get('login'), ['RECENT_30_DAYS', 'NEVER'] as const),
    page: Math.max(1, Number(p.get('page') ?? 1) || 1),
    pageSize: [10, 20, 50].includes(Number(p.get('pageSize')))
      ? Number(p.get('pageSize'))
      : 10,
  };
}

function params(f: AdminFilters) {
  const p = new URLSearchParams();

  if (f.search) p.set('q', f.search);
  if (f.status) p.set('status', f.status);
  if (f.roleId) p.set('role', f.roleId);
  if (f.lastLogin) p.set('login', f.lastLogin);
  if (f.page > 1) p.set('page', String(f.page));
  if (f.pageSize !== 10) p.set('pageSize', String(f.pageSize));

  return p;
}

export function AdminUsersPage() {
  const [p, setP] = useSearchParams();
  const filters = parse(p);
  const query = useAdminUsers(filters);
  const roles = useRoles();
  const [invite, setInvite] = useState(false);

  // Keep table filters reflected in the URL so the view is shareable.
  const update = useCallback(
    (patch: Partial<AdminFilters>) =>
      setP(
        params({
          ...filters,
          ...patch,
        }),
      ),
    [filters, setP],
  );

  if (query.isError && !query.data) {
    return (
      <ErrorState
        title="تعذر تحميل المسؤولين"
        description={query.error.message}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const items = query.data?.items ?? [];
  const all = query.data?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="المستخدمون الإداريون"
        description="إدارة حسابات فريق الإدارة والأدوار والصلاحيات الممنوحة لهم."
        breadcrumbs={[
          { label: 'الإعدادات', href: '/settings' },
          { label: 'المستخدمون الإداريون' },
        ]}
        actions={
          <PermissionGuard permission="admins.create">
            <Button onClick={() => setInvite(true)}>
              <UserPlus className="size-4" />
              دعوة مسؤول جديد
            </Button>
          </PermissionGuard>
        }
      />

      {/* Admin account metrics follow the same summary hierarchy used across the dashboard. */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          label="إجمالي المسؤولين"
          value={all.toLocaleString('ar-SA-u-nu-latn')}
          icon={UsersRound}
          tone="primary"
        />
        <SummaryCard
          label="نشطون"
          value={items.filter((a) => a.status === 'ACTIVE').length.toLocaleString('ar-SA-u-nu-latn')}
          icon={UserCheck}
          tone="success"
        />
        <SummaryCard
          label="دعوات معلقة"
          value={items.filter((a) => a.status === 'INVITED').length.toLocaleString('ar-SA-u-nu-latn')}
          icon={Clock3}
          tone="pending"
        />
        <SummaryCard
          label="حسابات معلقة"
          value={items.filter((a) => a.status === 'SUSPENDED').length.toLocaleString('ar-SA-u-nu-latn')}
          icon={PauseCircle}
          tone="critical"
        />
        <SummaryCard
          label="مديرو النظام"
          value={items.filter((a) => a.roles.some((r) => r.key === 'SUPER_ADMIN')).length.toLocaleString('ar-SA-u-nu-latn')}
          icon={ShieldCheck}
          tone="info"
        />
      </div>

      <div className="flex flex-wrap gap-2 rounded-lg border bg-surface p-3">
        <Input
          className="max-w-sm"
          placeholder="ابحث بالاسم أو البريد أو المعرف"
          value={filters.search}
          onChange={(e) =>
            update({
              search: e.target.value,
              page: 1,
            })
          }
        />

        <Select
          value={filters.status ?? 'ALL'}
          onValueChange={(v) =>
            update({
              status:
                v === 'ALL'
                  ? undefined
                  : (v as AdminFilters['status']),
              page: 1,
            })
          }
          options={[
            { value: 'ALL', label: 'كل الحالات' },
            ...adminAccountStatuses.map((s) => ({
              value: s,
              label: adminStatusLabels[s],
            })),
          ]}
        />

        <Select
          value={filters.roleId ?? 'ALL'}
          onValueChange={(v) =>
            update({
              roleId: v === 'ALL' ? undefined : v,
              page: 1,
            })
          }
          options={[
            { value: 'ALL', label: 'كل الأدوار' },
            ...(roles.data ?? []).map((r) => ({
              value: r.id,
              label: r.name,
            })),
          ]}
        />

        <Button
          variant="secondary"
          onClick={() => setP(new URLSearchParams())}
        >
          مسح
        </Button>
      </div>

      <AdminUsersTable
        items={items}
        total={all}
        pageCount={query.data?.pageCount ?? 1}
        filters={filters}
        loading={query.isLoading}
        onPage={(page, pageSize) =>
          update({
            page,
            pageSize,
          })
        }
      />

      {!query.isLoading && items.length === 0 && (
        <EmptyState title="لا يوجد مستخدمون إداريون مطابقون لعوامل التصفية." />
      )}

      <InviteAdminDialog
        open={invite}
        onOpenChange={setInvite}
      />
    </div>
  );
}