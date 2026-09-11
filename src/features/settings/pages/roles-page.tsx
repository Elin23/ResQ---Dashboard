import { getUserErrorMessage } from '@/lib/user-error-message';
import type { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Badge, Card, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, ErrorState, IconButton, PageHeader } from '@/components/ui';
import { DataTable } from '@/components/ui/data-table';
import { useRoles } from '../hooks';
import type { AdminRoleRecord } from '../types';

export function RolesPage() {
  const query = useRoles();
  const navigate = useNavigate();

  const columns = useMemo<Array<ColumnDef<AdminRoleRecord, unknown>>>(
    () => [
      {
        id: 'name',
        header: 'الدور',
        cell: ({ row }) => (
          <div>
            <p className="text-[12px] font-medium">{row.original.name}</p>
            <p className="text-[11px] text-muted-foreground" dir="ltr">{row.original.key}</p>
          </div>
        ),
      },
      {
        id: 'permissions',
        header: 'الصلاحيات',
        cell: ({ row }) => row.original.permissions.length,
      },
      {
        id: 'system',
        header: 'النوع',
        cell: ({ row }) => (
          <Badge tone={row.original.system ? 'info' : 'neutral'}>
            {row.original.system ? 'نظام' : 'مخصص'}
          </Badge>
        ),
      },
    ],
    [],
  );

  if (query.isError) {
    return (
      <ErrorState
        title="تعذر تحميل الأدوار"
        description={getUserErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="الأدوار والصلاحيات"
        description="تحديد المسؤوليات والصلاحيات الإدارية وفق مبدأ أقل صلاحية لازمة."
        breadcrumbs={[
          { label: 'الإعدادات', href: '/settings' },
          { label: 'الأدوار والصلاحيات' },
        ]}
      />

      <Card className="rounded-xl border-border/45 bg-muted/20 p-4 text-sm text-muted-foreground shadow-none">
        أدوار لوحة التحكم الحالية أدوار نظام محمية من الخادم. يمكن عرض صلاحياتها وتعيينها للمسؤولين، أما إنشاء أو تعديل أدوار مخصصة فغير متاح في عقد الباك الحالي.
      </Card>

      {/* Each role opens into a dedicated permission editor. */}
      <DataTable
        data={query.data ?? []}
        columns={columns}
        getRowId={(role) => role.id}
        enableSearch
        searchPlaceholder="ابحث عن دور"
        loading={query.isLoading}
        onRowClick={(role) => navigate(`/settings/roles/${role.id}`)}
        rowAriaLabel={(role) => `فتح الدور ${role.name}`}
        rowActions={(role) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton label={`إجراءات ${role.name}`}>
                <MoreHorizontal className="size-4" />
              </IconButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => navigate(`/settings/roles/${role.id}`)}>
                <ExternalLink className="size-4" />
                عرض الدور
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
    </div>
  );
}
