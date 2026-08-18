import { useMemo, type ReactNode } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Activity, CalendarClock, Download, Eye, MoreHorizontal, RotateCcw, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router';
import { Badge, Button, Checkbox, DebouncedSearchInput, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, EmptyState, IconButton, Input, Modal, Select, Skeleton } from '@/components/ui';
import { DataTable, type DataTableQueryState } from '@/components/ui/data-table';
import { rolePermissions } from '@/features/auth/permissions';
import { useSession } from '@/features/auth/session';
import { auditActionLabels, auditResourceLabels, sensitiveAuditActions } from '../constants';
import type { AuditAction, AuditEvent, AuditFilters, AuditResourceType, AuditSummary } from '../types';
import { formatAuditRelative, formatAuditTimestamp, resourcePath, resourcePermission, valueRows } from '../utils';

export function AuditSummaryStrip({ summary, loading, onSensitive }: { summary?: AuditSummary; loading: boolean; onSensitive: () => void }) {
  const items = [
    { label: 'إجمالي الأحداث', value: summary?.total ?? 0, icon: Activity },
    { label: 'إجراءات اليوم', value: summary?.today ?? 0, icon: CalendarClock },
    { label: 'إجراءات حساسة', value: summary?.sensitive ?? 0, icon: ShieldAlert, click: onSensitive },
  ];
  if (loading) return <div className="grid gap-2.5 sm:grid-cols-3">{items.map((item) => <Skeleton key={item.label} className="h-[90px] rounded-xl" />)}</div>;
  return <div className="grid gap-2.5 sm:grid-cols-3">{items.map((item) => { const Icon = item.icon; return <button key={item.label} type="button" onClick={item.click} disabled={!item.click} className="flex min-h-[90px] items-center justify-between rounded-xl border border-border/45 bg-white p-3.5 text-start transition-colors duration-200 enabled:hover:border-primary/20 enabled:hover:bg-primary/[0.025]"><div><p className="text-[12px] font-normal text-muted-foreground">{item.label}</p><p className="mt-2 text-[22px] font-semibold leading-none text-foreground">{item.value.toLocaleString('ar-SA-u-nu-latn')}</p></div><span className="flex size-9 items-center justify-center rounded-lg bg-primary/[0.06] text-primary"><Icon className="size-4" strokeWidth={1.7} /></span></button>; })}</div>;
}

export interface AuditFilterOptions { actors: Array<{ id: string; name: string }>; roles: string[]; actions: AuditAction[]; resourceTypes: AuditResourceType[]; }
export function AuditFilterBar({ filters, options, onChange, onClear }: { filters: AuditFilters; options?: AuditFilterOptions; onChange: (patch: Partial<AuditFilters>) => void; onClear: () => void }) {
  const active = Boolean(filters.search || filters.actorId || filters.actorType || filters.action || filters.resourceType || filters.from || filters.to || filters.sensitive);
  return <div dir="rtl" className="flex flex-wrap items-end justify-start gap-2 rounded-xl border border-border/45 bg-white p-3">
    <label className="min-w-[260px] flex-1"><span className="sr-only">البحث</span><DebouncedSearchInput value={filters.search} onValueChange={(value) => onChange({ search: value, page: 1 })} placeholder="ابحث بالإجراء، المسؤول أو المورد…" /></label>
    <label className="min-w-[170px]"><span className="mb-1 block text-[11px] font-normal text-muted-foreground">الإجراء</span><Select value={filters.action ?? 'ALL'} onValueChange={(value) => onChange({ action: value === 'ALL' ? undefined : value as AuditAction, page: 1 })} options={[{ value: 'ALL', label: 'كل الإجراءات' }, ...(options?.actions ?? []).map((value) => ({ value, label: auditActionLabels[value] }))]} /></label>
    <label className="min-w-[160px]"><span className="mb-1 block text-[11px] font-normal text-muted-foreground">نوع المورد</span><Select value={filters.resourceType ?? 'ALL'} onValueChange={(value) => onChange({ resourceType: value === 'ALL' ? undefined : value as AuditResourceType, page: 1 })} options={[{ value: 'ALL', label: 'كل الموارد' }, ...(options?.resourceTypes ?? []).map((value) => ({ value, label: auditResourceLabels[value] }))]} /></label>
    <label className="min-w-[150px]"><span className="mb-1 block text-[11px] font-normal text-muted-foreground">المسؤول</span><Select value={filters.actorId ?? 'ALL'} onValueChange={(value) => onChange({ actorId: value === 'ALL' ? undefined : value, page: 1 })} options={[{ value: 'ALL', label: 'كل المسؤولين' }, ...(options?.actors ?? []).map((item) => ({ value: item.id, label: item.name }))]} /></label>
    <label className="min-w-[138px]"><span className="mb-1 block text-[11px] font-normal text-muted-foreground">من تاريخ</span><Input className="h-9 rounded-xl text-[12px]" type="date" value={filters.from ?? ''} onChange={(event) => onChange({ from: event.target.value || undefined, page: 1 })} /></label>
    <label className="min-w-[138px]"><span className="mb-1 block text-[11px] font-normal text-muted-foreground">إلى تاريخ</span><Input className="h-9 rounded-xl text-[12px]" type="date" value={filters.to ?? ''} onChange={(event) => onChange({ to: event.target.value || undefined, page: 1 })} /></label>
    <label className="flex h-9 items-center gap-2 rounded-xl border border-border/45 px-3 text-[12px] font-normal text-muted-foreground"><Checkbox checked={filters.sensitive ?? false} onCheckedChange={(value) => onChange({ sensitive: value === true ? true : undefined, page: 1 })} />حساس فقط</label>
    {active && <Button className="h-9 rounded-xl text-[12px]" variant="ghost" onClick={onClear}><RotateCcw className="size-4" />مسح</Button>}
  </div>;
}

function ActorInline({ event }: { event: AuditEvent }) { return <div className="flex min-w-0 items-center gap-2"><span className="truncate text-[12px] font-medium text-foreground">{event.actor.name}</span><span className="shrink-0 text-[11px] text-muted-foreground">{event.actor.role ?? (event.actor.type === 'SYSTEM' ? 'النظام' : 'إداري')}</span></div>; }

export function AuditTable({ items, total, pageCount, filters, loading, onStateChange, onOpen }: { items: AuditEvent[]; total: number; pageCount: number; filters: AuditFilters; loading: boolean; onStateChange: (state: DataTableQueryState) => void; onOpen: (event: AuditEvent) => void }) {
  const columns = useMemo<Array<ColumnDef<AuditEvent, unknown>>>(() => [
    { id: 'timestamp', header: 'الوقت', cell: ({ row }) => <div className="whitespace-nowrap"><span className="text-[12px] text-foreground">{formatAuditTimestamp(row.original.timestamp)}</span><span className="ms-2 text-[11px] text-muted-foreground">{formatAuditRelative(row.original.timestamp)}</span></div> },
    { id: 'actor', header: 'المسؤول', enableSorting: false, cell: ({ row }) => <ActorInline event={row.original} /> },
    { id: 'action', header: 'الإجراء', enableSorting: false, cell: ({ row }) => <div className="flex items-center gap-2"><span className="text-[12px] text-foreground">{auditActionLabels[row.original.action]}</span>{sensitiveAuditActions.has(row.original.action) && <Badge tone="critical">حساس</Badge>}</div> },
    { id: 'resource', header: 'المورد', enableSorting: false, cell: ({ row }) => <div className="flex min-w-0 items-center gap-2"><span className="text-[12px] font-medium">{auditResourceLabels[row.original.resource.type]}</span><span className="max-w-[180px] truncate text-[11px] text-muted-foreground">{row.original.resource.label ?? row.original.resource.id}</span></div> },
    { id: 'context', header: 'السياق', enableSorting: false, cell: ({ row }) => <span className="block max-w-[240px] truncate text-[11px] text-muted-foreground">{row.original.reason ?? row.original.metadata?.source ?? '—'}</span> },
  ], []);
  return <DataTable data={items} columns={columns} getRowId={(item) => item.id} loading={loading} enableSearch={false} manualPagination manualSorting pageCount={pageCount} totalCount={total} state={{ pageIndex: filters.page - 1, pageSize: filters.pageSize, search: '', sorting: [{ id: 'timestamp', desc: filters.sortDirection === 'desc' }] }} onStateChange={onStateChange} onRowClick={onOpen} rowAriaLabel={(item) => `عرض تفاصيل حدث ${item.id}`} rowActions={(item) => <DropdownMenu><DropdownMenuTrigger asChild><IconButton label={`إجراءات ${item.id}`}><MoreHorizontal className="size-4" /></IconButton></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onSelect={() => onOpen(item)}><Eye className="size-4" />عرض التفاصيل</DropdownMenuItem></DropdownMenuContent></DropdownMenu>} emptyState={<EmptyState title={filters.search || filters.action || filters.resourceType || filters.actorId || filters.sensitive ? 'لا توجد أحداث تطابق عوامل التصفية الحالية.' : 'لا توجد أحداث مسجلة ضمن الفترة المحددة.'} />} />;
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) { return <div className="grid gap-1 border-b border-border/35 py-2.5 last:border-0 sm:grid-cols-[8rem_1fr]"><dt className="text-[11px] font-normal text-muted-foreground">{label}</dt><dd className="text-[12px] text-foreground">{children}</dd></div>; }
function AuditDiffViewer({ event, canSensitive }: { event: AuditEvent; canSensitive: boolean }) { const before = valueRows(event.previousValue, canSensitive), after = valueRows(event.newValue, canSensitive); if (!before.length && !after.length) return <p className="text-[12px] text-muted-foreground">لا توجد قيم قبل/بعد لهذا الحدث.</p>; const keys = [...new Set([...before.map((item) => item.field), ...after.map((item) => item.field)])]; return <div className="space-y-2">{keys.map((key) => { const previous = before.find((item) => item.field === key)?.value ?? '—', next = after.find((item) => item.field === key)?.value ?? '—'; return <div key={key} className="rounded-lg border border-border/40 p-3"><p className="text-[12px] font-medium">{key}</p><div className="mt-2 grid gap-2 sm:grid-cols-2"><div className="rounded-lg bg-muted/35 p-2.5"><span className="block text-[11px] text-muted-foreground">قبل</span><span className="text-[12px]">{previous}</span></div><div className="rounded-lg bg-primary/[0.035] p-2.5"><span className="block text-[11px] text-muted-foreground">بعد</span><span className="text-[12px]">{next}</span></div></div></div>; })}</div>; }

export function AuditDetailModal({ event, onClose }: { event: AuditEvent | null; onClose: () => void }) {
  const { session } = useSession();
  if (!event || !session) return null;
  const permissions = rolePermissions[session.role];
  const required = resourcePermission(event.resource.type);
  const canOpen = !required || permissions.has(required);
  const path = canOpen ? resourcePath(event.resource.type, event.resource.id) : undefined;
  const canTechnical = permissions.has('audit.technical.read');
  const canSensitive = event.resource.type === 'USER' ? permissions.has('users.sensitive.read') : false;
  return <Modal open={Boolean(event)} onOpenChange={(open) => { if (!open) onClose(); }} title="تفاصيل الحدث" description="سجل للقراءة فقط."><div className="max-h-[70vh] space-y-4 overflow-y-auto pe-1"><dl><DetailRow label="المسؤول"><ActorInline event={event} /></DetailRow><DetailRow label="الإجراء">{auditActionLabels[event.action]}</DetailRow><DetailRow label="المورد"><div className="flex flex-wrap items-center gap-2"><span>{auditResourceLabels[event.resource.type]}</span><span dir="ltr" className="text-[11px] text-muted-foreground">{event.resource.id}</span>{path && <Link className="text-[12px] text-primary" to={path}>فتح المورد</Link>}</div></DetailRow><DetailRow label="الوقت">{formatAuditTimestamp(event.timestamp)}</DetailRow><DetailRow label="السبب">{event.reason ?? 'لا يوجد سبب مسجل'}</DetailRow><DetailRow label="المصدر">{event.metadata?.source ?? '—'}</DetailRow></dl><section><h3 className="mb-2 text-[14px] font-semibold">التغييرات</h3><AuditDiffViewer event={event} canSensitive={canSensitive} /></section>{canTechnical && event.requestContext && <section><h3 className="mb-2 text-[14px] font-semibold">بيانات تقنية</h3><dl><DetailRow label="عنوان IP">{event.requestContext.ipAddress ?? '—'}</DetailRow><DetailRow label="معرف التتبع"><span dir="ltr" className="text-[11px]">{event.requestContext.correlationId ?? '—'}</span></DetailRow></dl></section>}</div></Modal>;
}

export function AuditExportButton({ onExport, disabled }: { onExport: () => void; disabled?: boolean }) { return <Button className="h-9 rounded-xl text-[12px]" variant="secondary" onClick={onExport} disabled={disabled}><Download className="size-4" />تصدير السجل</Button>; }
