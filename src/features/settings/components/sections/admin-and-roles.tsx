import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, ChevronDown, ChevronUp, ExternalLink, MoreHorizontal, ShieldCheck, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Avatar, Badge, Button, Card, Checkbox, ConfirmDialog, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, IconButton, Input, Modal, SectionHeader, Textarea } from '@/components/ui';
import { DataTable } from '@/components/ui/data-table';
import { permissionDefinitions, permissionModuleLabels, type Permission, type PermissionModule } from '@/features/auth/permissions';
import { usePermission } from '@/features/auth/rbac';
import { adminStatusLabels } from '../../constants';
import { useCreateRole, useInviteAdmin, useReactivateAdmin, useRoles, useSuspendAdmin, useUpdateAdminRoles, useUpdateRole } from '../../hooks';
import { inviteAdminSchema, roleSchema, suspendAdminSchema } from '../../schemas';
import type { AdminFilters, AdminRoleRecord, AdminUser, CreateRoleInput, InviteAdminInput } from '../../types';
import { formatAdminDate } from '../../utils';

export function AdminStatusBadge({ status }: { status: AdminUser['status'] }) {
  return (
    <Badge
      tone={
        status === 'ACTIVE'
          ? 'success'
          : status === 'INVITED'
            ? 'info'
            : status === 'SUSPENDED'
              ? 'pending'
              : 'critical'
      }
    >
      {adminStatusLabels[status]}
    </Badge>
  );
}

export function AdminUsersTable({ items, total, pageCount, filters, loading, onPage }: { items: AdminUser[]; total: number; pageCount: number; filters: AdminFilters; loading: boolean; onPage: (page: number, pageSize: number) => void }) {
  const nav = useNavigate();

  const columns = useMemo<Array<ColumnDef<AdminUser, unknown>>>(
    () => [
      {
        id: 'admin',
        header: 'المسؤول',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar
              name={row.original.fullName}
              src={row.original.avatarUrl}
            />

            <div>
              <p className="font-semibold">{row.original.fullName}</p>
              <p className="text-xs text-muted-foreground" dir="ltr">{row.original.id}</p>
            </div>
          </div>
        ),
      },
      {
        id: 'email',
        header: 'البريد الإلكتروني',
        cell: ({ row }) => <span dir="ltr">{row.original.email}</span>,
      },
      {
        id: 'roles',
        header: 'الأدوار',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.roles.map((r) => (
              <Badge key={r.id}>{r.name}</Badge>
            ))}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'الحالة',
        cell: ({ row }) => <AdminStatusBadge status={row.original.status} />,
      },
      {
        id: 'lastLogin',
        header: 'آخر تسجيل دخول',
        cell: ({ row }) => formatAdminDate(row.original.lastLoginAt),
      },
      {
        id: 'createdAt',
        header: 'تاريخ الإنشاء',
        cell: ({ row }) => formatAdminDate(row.original.createdAt),
      },
    ],
    [],
  );

  return (
    <DataTable
      data={items}
      columns={columns}
      getRowId={(a) => a.id}
      enableSearch={false}
      manualPagination
      pageCount={pageCount}
      totalCount={total}
      loading={loading}
      state={{
        pageIndex: filters.page - 1,
        pageSize: filters.pageSize,
        search: filters.search,
        sorting: [],
      }}
      onStateChange={(s) => onPage(s.pageIndex + 1, s.pageSize)}
      onRowClick={(a) => nav(`/settings/admin-users/${a.id}`)}
      rowAriaLabel={(a) => `فتح حساب المسؤول ${a.fullName}`}
      rowActions={(a) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton label={`إجراءات ${a.fullName}`}>
              <MoreHorizontal className="size-4" />
            </IconButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => nav(`/settings/admin-users/${a.id}`)}>
              <ExternalLink className="size-4" />
              عرض الحساب
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    />
  );
}

export function InviteAdminDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const roles = useRoles();
  const mutation = useInviteAdmin();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<InviteAdminInput>({
    resolver: zodResolver(inviteAdminSchema),
    defaultValues: {
      fullName: '',
      email: '',
      roleIds: [],
    },
  });

  const selected = watch('roleIds');

  const submit = handleSubmit(async (v) => {
    try {
      await mutation.mutateAsync(v);
      toast.success('تم إنشاء دعوة المسؤول في البيانات التجريبية.');
      reset();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر إنشاء الدعوة.');
    }
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="دعوة مسؤول جديد"
      description="سيتم إنشاء حالة دعوة فقط. إرسال البريد وقبول الدعوة مسؤولية الخادم."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>

          <Button onClick={() => void submit()} disabled={mutation.isPending}>
            <UserPlus className="size-4" />
            إنشاء الدعوة
          </Button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <label className="block text-sm font-semibold">
          الاسم
          <Input className="mt-1" {...register('fullName')} />
          {errors.fullName && <span className="text-xs text-critical">{errors.fullName.message}</span>}
        </label>

        <label className="block text-sm font-semibold">
          البريد الإلكتروني
          <Input dir="ltr" className="mt-1" {...register('email')} />
          {errors.email && <span className="text-xs text-critical">{errors.email.message}</span>}
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">الأدوار</legend>

          {roles.data?.map((r) => (
            <Checkbox
              key={r.id}
              label={r.name}
              checked={selected.includes(r.id)}
              onCheckedChange={(checked) =>
                setValue(
                  'roleIds',
                  checked
                    ? [...selected, r.id]
                    : selected.filter((id) => id !== r.id),
                  { shouldValidate: true },
                )
              }
            />
          ))}

          {errors.roleIds && <p className="text-xs text-critical">{errors.roleIds.message}</p>}
        </fieldset>
      </form>
    </Modal>
  );
}

export function AdminStatusActions({ admin, currentAdminId }: { admin: AdminUser; currentAdminId: string }) {
  const canSuspend = usePermission('admins.suspend');
  const canActivate = usePermission('admins.activate');
  const suspend = useSuspendAdmin();
  const reactivate = useReactivateAdmin();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ reason: string }>({
    resolver: zodResolver(suspendAdminSchema),
    defaultValues: { reason: '' },
  });

  const self = admin.id === currentAdminId;

  return (
    <>
      {admin.status === 'ACTIVE' && canSuspend && (
        <Button variant="danger" disabled={self} onClick={() => setOpen(true)}>
          تعليق الحساب
        </Button>
      )}

      {admin.status === 'SUSPENDED' && canActivate && (
        <Button
          onClick={async () => {
            try {
              await reactivate.mutateAsync(admin.id);
              toast.success('تمت إعادة تفعيل المسؤول.');
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'تعذر التفعيل.');
            }
          }}
        >
          إعادة التفعيل
        </Button>
      )}

      {self && <p className="text-xs text-muted-foreground">لا يمكنك تعليق حسابك الإداري الحالي.</p>}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="تعليق حساب المسؤول"
        description="سيُمنع المسؤول من الوصول إلى لوحة الإدارة حتى إعادة تفعيله."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              إلغاء
            </Button>

            <Button
              variant="danger"
              onClick={() =>
                void handleSubmit(async (v) => {
                  try {
                    await suspend.mutateAsync({
                      id: admin.id,
                      reason: v.reason,
                    });

                    toast.success('تم تعليق الحساب.');
                    reset();
                    setOpen(false);
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'تعذر التعليق.');
                  }
                })()
              }
            >
              تأكيد التعليق
            </Button>
          </>
        }
      >
        <label className="block text-sm font-semibold">
          سبب التعليق
          <Textarea className="mt-1" {...register('reason')} />
          {errors.reason && <span className="text-xs text-critical">{errors.reason.message}</span>}
        </label>
      </Modal>
    </>
  );
}

export function AdminRolesEditor({ admin }: { admin: AdminUser }) {
  const roles = useRoles();
  const mutation = useUpdateAdminRoles();
  const [selected, setSelected] = useState(admin.roles.map((r) => r.id));

  const roleRows = roles.data ?? [];

  const currentPermissions = new Set(
    roleRows
      .filter((r) => admin.roles.some((a) => a.id === r.id))
      .flatMap((r) => r.permissions),
  );

  const nextPermissions = new Set(
    roleRows
      .filter((r) => selected.includes(r.id))
      .flatMap((r) => r.permissions),
  );

  const added = [...nextPermissions].filter((p) => !currentPermissions.has(p));

  return (
    <Card>
      <SectionHeader
        title="الأدوار الممنوحة"
        description="الصلاحيات الفعلية هي اتحاد صلاحيات جميع الأدوار."
      />

      <div className="mt-4 space-y-2">
        {roles.data?.map((r) => (
          <Checkbox
            key={r.id}
            checked={selected.includes(r.id)}
            label={`${r.name}${r.system ? ' · دور نظام' : ''}`}
            onCheckedChange={(checked) =>
              setSelected(
                checked
                  ? [...selected, r.id]
                  : selected.filter((id) => id !== r.id),
              )
            }
          />
        ))}
      </div>

      {/* Show the permission impact before saving role changes. */}
      {added.length > 0 && (
        <div className="mt-4 rounded-md bg-info/10 p-3 text-sm">
          إضافة الأدوار المحددة ستمنح {added.length} صلاحيات جديدة لهذا المسؤول.
        </div>
      )}

      <Button
        className="mt-4"
        disabled={!selected.length || mutation.isPending}
        onClick={async () => {
          try {
            await mutation.mutateAsync({
              id: admin.id,
              roleIds: selected,
            });
            toast.success('تم تحديث أدوار المسؤول.');
          } catch (e) {
            toast.error(e instanceof Error ? e.message : 'تعذر تحديث الأدوار.');
          }
        }}
      >
        حفظ الأدوار
      </Button>
    </Card>
  );
}

export function PermissionMatrix({ value, onChange, readOnly = false }: { value: Permission[]; onChange?: (v: Permission[]) => void; readOnly?: boolean }) {
  const groups = useMemo(() => {
    const map = new Map<PermissionModule, typeof permissionDefinitions>();

    permissionDefinitions.forEach((p) =>
      map.set(
        p.module,
        [...(map.get(p.module) ?? []), p],
      ),
    );

    return [...map.entries()];
  }, []);

  const [toggles, setToggles] = useState<Set<PermissionModule>>(
    new Set(groups.map(([m]) => m)),
  );

  return (
    <div className="space-y-3">
      {groups.map(([module, defs]) => (
        <Card key={module} className="overflow-hidden p-0">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-start"
            onClick={() =>
              setToggles((cur) => {
                const n = new Set(cur);

                if (n.has(module)) {
                  n.delete(module);
                } else {
                  n.add(module);
                }

                return n;
              })
            }
          >
            <span className="font-bold">{permissionModuleLabels[module]}</span>
            {toggles.has(module) ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>

          {toggles.has(module) && (
            <div className="grid gap-3 border-t p-4 md:grid-cols-2">
              {defs.map((d) => (
                <label key={d.key} className="flex items-start gap-3 rounded-md border p-3">
                  <Checkbox
                    checked={value.includes(d.key)}
                    ariaLabel={d.label}
                    onCheckedChange={(checked) =>
                      !readOnly &&
                      onChange?.(
                        checked
                          ? [...value, d.key]
                          : value.filter((p) => p !== d.key),
                      )
                    }
                  />

                  <span>
                    <span className="flex flex-wrap items-center gap-2 font-semibold">
                      {d.label}
                      {d.sensitive && <Badge tone="critical">صلاحية حساسة</Badge>}
                    </span>

                    <span className="mt-1 block text-xs text-muted-foreground">
                      {d.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

export function CreateRoleDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const mutation = useCreateRole();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateRoleInput>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  });

  const perms = watch('permissions');

  const sensitive = permissionDefinitions.filter(
    (p) => p.sensitive && perms.includes(p.key),
  );

  const submit = handleSubmit(async (input) => {
    try {
      await mutation.mutateAsync(input);
      toast.success('تم إنشاء الدور.');
      reset();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر إنشاء الدور.');
    }
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="إنشاء دور إداري"
      description="أنشئ دورًا مخصصًا قائمًا على الصلاحيات، دون استثناءات خاصة لكل مسؤول."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>

          <Button disabled={mutation.isPending} onClick={() => void submit()}>
            إنشاء الدور
          </Button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <label className="block text-sm font-semibold">
          اسم الدور
          <Input className="mt-1" {...register('name')} />
          {errors.name && <span className="text-xs text-critical">{errors.name.message}</span>}
        </label>

        <label className="block text-sm font-semibold">
          الوصف
          <Textarea className="mt-1" {...register('description')} />
          {errors.description && <span className="text-xs text-critical">{errors.description.message}</span>}
        </label>

        {sensitive.length > 0 && (
          <div className="rounded-md border border-critical/20 bg-critical/5 p-3 text-sm">
            <p className="font-semibold">سيُمنح الدور {sensitive.length} صلاحيات حساسة.</p>
            <p className="mt-1 text-muted-foreground">راجعها بعناية قبل الحفظ.</p>
          </div>
        )}

        <PermissionMatrix
          value={perms}
          onChange={(value) =>
            setValue('permissions', value, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
        />

        {errors.permissions && <p className="text-sm text-critical">{errors.permissions.message}</p>}
      </form>
    </Modal>
  );
}

export function RoleEditor({ role }: { role: AdminRoleRecord }) {
  const canUpdate = usePermission('roles.update');
  const mutation = useUpdateRole();
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description ?? '');
  const [perms, setPerms] = useState<Permission[]>(role.permissions);
  const [confirm, setConfirm] = useState(false);

  const addedSensitive = permissionDefinitions.filter(
    (p) =>
      p.sensitive &&
      perms.includes(p.key) &&
      !role.permissions.includes(p.key),
  );

  const readOnly = !canUpdate || role.systemRole === 'SUPER_ADMIN';

  const save = async () => {
    try {
      await mutation.mutateAsync({
        id: role.id,
        input: {
          name,
          description,
          permissions: perms,
        },
      });

      toast.success('تم تحديث الدور وتسجيل التغيير في سجل النشاط.');
      setConfirm(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر تحديث الدور.');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold">
            اسم الدور
            <Input
              className="mt-1"
              value={name}
              disabled={role.system || readOnly}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="text-sm font-semibold">
            الوصف
            <Input
              className="mt-1"
              value={description}
              disabled={readOnly}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </div>

        {role.usersCount > 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            هذا الدور مستخدم من قبل {role.usersCount} مسؤولين، وستنعكس التغييرات عليهم جميعًا.
          </p>
        )}

        {addedSensitive.length > 0 && (
          <div className="mt-3 rounded-md border border-pending/30 bg-pending/10 p-3 text-sm">
            <AlertTriangle className="mb-1 size-4" />
            ستضيف {addedSensitive.length} صلاحيات حساسة جديدة: {addedSensitive.map((p) => p.label).join('، ')}.
          </div>
        )}

        {role.systemRole === 'SUPER_ADMIN' && (
          <p className="mt-3 text-sm text-muted-foreground">
            صلاحيات مدير النظام الشامل مقفلة في المحاكاة لحماية آخر مسار استرداد إداري.
          </p>
        )}
      </Card>

      <PermissionMatrix
        value={perms}
        onChange={setPerms}
        readOnly={readOnly}
      />

      {!readOnly && (
        <Button
          disabled={mutation.isPending}
          onClick={() =>
            addedSensitive.length
              ? setConfirm(true)
              : void save()
          }
        >
          <ShieldCheck className="size-4" />
          حفظ صلاحيات الدور
        </Button>
      )}

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="تأكيد منح صلاحيات حساسة"
        description={`سيتم منح هذا الدور ${addedSensitive.length} صلاحيات حساسة جديدة، وستنطبق على ${role.usersCount} مسؤولين يستخدمون الدور.`}
        confirmLabel="تأكيد وحفظ"
        onConfirm={save}
      />
    </div>
  );
}

