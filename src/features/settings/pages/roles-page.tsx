import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, MoreHorizontal, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Badge, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, ErrorState, IconButton, PageHeader } from '@/components/ui';
import { DataTable } from '@/components/ui/data-table';
import { PermissionGuard } from '@/features/auth/rbac';
import { CreateRoleDialog } from '../components/settings-components';
import { useRoles } from '../hooks';
import type { AdminRoleRecord } from '../types';
import { formatAdminDate } from '../utils';

export function RolesPage() {
  const query = useRoles();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const columns = useMemo<Array<ColumnDef<AdminRoleRecord, unknown>>>(() => [
    { id: 'name', header: 'الدور', cell: ({ row }) => <div><p className="text-[12px] font-medium">{row.original.name}</p><p className="text-[11px] text-muted-foreground" dir="ltr">{row.original.key}</p></div> },
    { id: 'description', header: 'الوصف', cell: ({ row }) => <span className="line-clamp-2 max-w-md text-[12px] text-muted-foreground">{row.original.description}</span> },
    { id: 'usersCount', header: 'المسؤولون', cell: ({ row }) => row.original.usersCount },
    { id: 'permissions', header: 'الصلاحيات', cell: ({ row }) => row.original.permissions.length },
    { id: 'system', header: 'النوع', cell: ({ row }) => <Badge tone={row.original.system ? 'info' : 'neutral'}>{row.original.system ? 'نظام' : 'مخصص'}</Badge> },
    { id: 'updatedAt', header: 'آخر تحديث', cell: ({ row }) => <span className="whitespace-nowrap text-[12px] text-muted-foreground">{formatAdminDate(row.original.updatedAt)}</span> },
  ], []);
  if (query.isError) return <ErrorState title="تعذر تحميل الأدوار" description={query.error.message} onRetry={() => void query.refetch()} />;
  return <div className="space-y-6"><PageHeader title="الأدوار والصلاحيات" description="تحديد المسؤوليات والصلاحيات الإدارية وفق مبدأ أقل صلاحية لازمة." breadcrumbs={[{ label: 'الإعدادات', href: '/settings' }, { label: 'الأدوار والصلاحيات' }]} actions={<PermissionGuard permission="roles.create"><Button onClick={() => setOpen(true)}><Plus className="size-4" />إنشاء دور</Button></PermissionGuard>} /><DataTable data={query.data ?? []} columns={columns} getRowId={(role) => role.id} enableSearch searchPlaceholder="ابحث عن دور" loading={query.isLoading} onRowClick={(role) => navigate(`/settings/roles/${role.id}`)} rowAriaLabel={(role) => `فتح الدور ${role.name}`} rowActions={(role) => <DropdownMenu><DropdownMenuTrigger asChild><IconButton label={`إجراءات ${role.name}`}><MoreHorizontal className="size-4" /></IconButton></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onSelect={() => navigate(`/settings/roles/${role.id}`)}><ExternalLink className="size-4" />عرض الدور</DropdownMenuItem></DropdownMenuContent></DropdownMenu>} /><CreateRoleDialog open={open} onOpenChange={setOpen} /></div>;
}
