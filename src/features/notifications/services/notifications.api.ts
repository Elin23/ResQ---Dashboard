import type { AdminSession } from '@/features/auth/session';
import { apiClient } from '@/services/api/client';
import type {
  BroadcastDetails, BroadcastDraftInput, BroadcastFilters, BroadcastListResult,
  BroadcastNotification, NotificationAudience, NotificationDeliveryStatus,
  NotificationSummary, NotificationTimelineEvent, ScheduleBroadcastInput,
  SendBroadcastInput, SystemNotificationTemplate, TemplateUpdateInput,
} from '../types';

type R = Record<string, unknown>;
const rec = (v: unknown): R => v && typeof v === 'object' && !Array.isArray(v) ? v as R : {};
const arr = (v: unknown): unknown[] => Array.isArray(v) ? v : [];
const str = (...v: unknown[]): string | undefined => v.find(x => typeof x === 'string' && x.trim()) as string | undefined;
const num = (...v: unknown[]): number | undefined => { for (const x of v) { const n = typeof x === 'number' ? x : typeof x === 'string' ? Number(x) : NaN; if (Number.isFinite(n)) return n; } return undefined; };
const id = (...v: unknown[]) => String(v.find(x => x !== null && x !== undefined && String(x).trim()) ?? '');
const unwrap = (v: unknown): unknown => { const r = rec(v); return r.data ?? r.result ?? r.value ?? v; };
const iso = (...values: unknown[]): string | undefined => { const s = str(...values); if (!s) return undefined; const d = new Date(s); return Number.isNaN(d.getTime()) ? s : d.toISOString(); };
const qs = (values: Record<string, unknown>) => { const p = new URLSearchParams(); Object.entries(values).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== '') p.set(k, String(v)); }); const s=p.toString(); return s ? `?${s}` : ''; };

const statusMap: Record<string, NotificationDeliveryStatus> = {
  DRAFT:'DRAFT', SCHEDULED:'SCHEDULED', SENDING:'SENDING', SENT:'SENT', PARTIALLY_SENT:'PARTIALLY_SENT', PARTIAL:'PARTIALLY_SENT', FAILED:'FAILED', CANCELLED:'CANCELLED', CANCELED:'CANCELLED'
};
const normalizeStatus = (v: unknown): NotificationDeliveryStatus => statusMap[String(v ?? '').toUpperCase()] ?? 'DRAFT';
const channels = (v: unknown) => arr(v).map(x => String(x).toUpperCase()).filter((x): x is 'IN_APP'|'PUSH' => x === 'IN_APP' || x === 'PUSH');
function audience(v: unknown): NotificationAudience {
  const r=rec(v); return {
    everyone: Boolean(r.everyone ?? r.isEveryone ?? false),
    userTypes: arr(r.userTypes).map(String).filter((x): x is 'USER'|'ORGANIZATION' => x==='USER'||x==='ORGANIZATION'),
    governorates: arr(r.governorates ?? r.governorateIds).map(String),
    organizationIds: arr(r.organizationIds).map(String), userIds: arr(r.userIds).map(String),
  };
}
function broadcast(v: unknown): BroadcastNotification {
  const r=rec(v), creator=rec(r.createdBy ?? r.creator ?? r.admin), stats=rec(r.statistics ?? r.stats);
  return {
    id:id(r.id,r.broadcastId,r.notificationId), title:str(r.title) ?? '', body:str(r.body,r.message) ?? '',
    channels: channels(r.channels), audience: audience(r.audience), deepLink:str(r.deepLink,r.deepLinkUrl), imageUrl:str(r.imageUrl,r.image),
    status:normalizeStatus(r.status), scheduledAt:iso(r.scheduledAt), sentAt:iso(r.sentAt),
    createdBy:{ id:id(creator.id,creator.userId,r.createdById), name:str(creator.name,creator.fullName,r.createdByName) ?? 'الإدارة' },
    statistics: Object.keys(stats).length ? { targetedCount:num(stats.targetedCount,stats.targetCount) ?? 0, sentCount:num(stats.sentCount), failedCount:num(stats.failedCount), openedCount:num(stats.openedCount) } : undefined,
    failureReason:str(r.failureReason,r.error), createdAt:iso(r.createdAt,r.creationTime) ?? new Date().toISOString(), updatedAt:iso(r.updatedAt,r.lastModificationTime,r.createdAt) ?? new Date().toISOString(),
  };
}
function timelineEvent(v: unknown, i:number): NotificationTimelineEvent { const r=rec(v); return { id:id(r.id,`event-${i}`), title:str(r.title,r.label,r.action) ?? 'تحديث', timestamp:iso(r.timestamp,r.createdAt,r.creationTime) ?? new Date().toISOString(), actor:str(r.actor,r.actorName,r.createdByName), detail:str(r.detail,r.details,r.description), tone:(str(r.tone) as NotificationTimelineEvent['tone']) ?? 'neutral' }; }
function summarize(a: NotificationAudience) { if (a.everyone) return 'جميع المستخدمين'; if (a.organizationIds?.length) return `${a.organizationIds.length} جمعية`; if (a.userIds?.length) return `${a.userIds.length} مستخدم`; if (a.governorates?.length) return `حسب المحافظة`; return 'حسب نوع الحساب'; }
function template(v: unknown): SystemNotificationTemplate { const r=rec(v); return { id:id(r.id,r.key), key:str(r.key,r.id) ?? '', name:str(r.name,r.displayName) ?? str(r.key) ?? '', description:str(r.description) ?? '', titleTemplate:str(r.titleTemplate,r.title) ?? '', bodyTemplate:str(r.bodyTemplate,r.body) ?? '', channels:channels(r.channels).length ? channels(r.channels) : ['IN_APP'], enabled:Boolean(r.isActive ?? r.enabled ?? true), required:Boolean(r.required ?? r.isRequired ?? false), availableVariables:arr(r.availableVariables ?? r.variables).map((x,i)=>{const q=rec(x); return {key:str(q.key,q.name)??`var${i+1}`,label:str(q.label,q.displayName,q.key)??'',example:str(q.example,q.sample)??''};}), updatedAt:iso(r.updatedAt,r.lastModificationTime) ?? new Date().toISOString() }; }
function body(input: BroadcastDraftInput, scheduledAt?: string) { return { title:input.title, body:input.body, channels:input.channels, audience:input.audience, deepLink:input.deepLink || null, imageUrl:input.imageUrl || null, scheduledAt:scheduledAt ?? null }; }

export async function getBroadcastNotifications(f: BroadcastFilters, signal?:AbortSignal): Promise<BroadcastListResult> { const payload=unwrap(await apiClient.get<unknown>(`/api/dashboard/notifications/broadcasts${qs({search:f.search,status:f.status,page:f.page,pageSize:f.pageSize})}`,signal)); const r=rec(payload); const items=arr(r.items ?? r.broadcasts ?? r.data ?? payload).map(broadcast); const total=num(r.total,r.totalCount) ?? items.length; return {items,total,pageCount:Math.max(1,num(r.pageCount)??Math.ceil(total/f.pageSize))}; }
export async function getBroadcastNotification(idValue:string, signal?:AbortSignal): Promise<BroadcastDetails> { const payload=unwrap(await apiClient.get<unknown>(`/api/dashboard/notifications/broadcasts/${encodeURIComponent(idValue)}`,signal)); const r=rec(payload); const b=broadcast(r.broadcast ?? r.notification ?? payload); return {broadcast:b,timeline:arr(r.timeline ?? r.events).map(timelineEvent),audienceSummary:str(r.audienceSummary)??summarize(b.audience),estimatedAudience:num(r.estimatedAudience,b.statistics?.targetedCount)??0}; }
export async function getNotificationSummary(signal?:AbortSignal):Promise<NotificationSummary>{const p=rec(unwrap(await apiClient.get<unknown>('/api/dashboard/notifications/broadcasts/summary',signal))); return {scheduled:num(p.scheduled,p.scheduledCount)??0,sentToday:num(p.sentToday,p.sentTodayCount)??0,partiallySent:num(p.partiallySent,p.partiallySentCount)??0,drafts:num(p.drafts,p.draftCount)??0,activeTemplates:num(p.activeTemplates,p.activeTemplatesCount)??0};}
export async function estimateNotificationAudience(a:NotificationAudience, signal?:AbortSignal){const p=unwrap(await apiClient.request<unknown>('/api/dashboard/notifications/audience/estimate',{method:'POST',body:a,signal})); const r=rec(p); return num(p,r.count,r.estimatedAudience,r.total)??0;}
export async function createBroadcastDraft(input:BroadcastDraftInput,_actor:AdminSession){const p=await apiClient.post<unknown>('/api/dashboard/notifications/broadcasts/drafts',body(input)); return p===undefined?undefined:broadcast(unwrap(p));}
export async function sendBroadcast(input:SendBroadcastInput,_actor:AdminSession){const p=await apiClient.post<unknown>('/api/dashboard/notifications/broadcasts/send',body(input)); return p===undefined?undefined:broadcast(unwrap(p));}
export async function scheduleBroadcast(input:ScheduleBroadcastInput,_actor:AdminSession){const p=await apiClient.post<unknown>('/api/dashboard/notifications/broadcasts/schedule',body(input,input.scheduledAt)); return p===undefined?undefined:broadcast(unwrap(p));}
export async function sendExistingBroadcast(idValue:string,_actor:AdminSession){const p=await apiClient.post<unknown>(`/api/dashboard/notifications/broadcasts/${encodeURIComponent(idValue)}/send`); return p===undefined?undefined:broadcast(unwrap(p));}
export async function scheduleExistingBroadcast(idValue:string,scheduledAt:string,_actor:AdminSession){const p=await apiClient.post<unknown>(`/api/dashboard/notifications/broadcasts/${encodeURIComponent(idValue)}/schedule`,{scheduledAt}); return p===undefined?undefined:broadcast(unwrap(p));}
export async function cancelBroadcast(idValue:string,_actor:AdminSession){const p=await apiClient.post<unknown>(`/api/dashboard/notifications/broadcasts/${encodeURIComponent(idValue)}/cancel`); return p===undefined?undefined:broadcast(unwrap(p));}
export async function duplicateBroadcast(idValue:string,_actor:AdminSession){const p=await apiClient.post<unknown>(`/api/dashboard/notifications/broadcasts/${encodeURIComponent(idValue)}/duplicate`); return p===undefined?undefined:broadcast(unwrap(p));}
export async function getNotificationTemplates(signal?:AbortSignal){const p=unwrap(await apiClient.get<unknown>('/api/dashboard/notifications/templates',signal)); const r=rec(p); return arr(r.items ?? r.templates ?? p).map(template);}
export async function getNotificationTemplate(key:string,signal?:AbortSignal){const p=unwrap(await apiClient.get<unknown>(`/api/dashboard/notifications/templates/${encodeURIComponent(key)}`,signal)); return p==null?undefined:template(p);}
export async function updateNotificationTemplate(key:string,input:TemplateUpdateInput){const p=await apiClient.patch<unknown>(`/api/dashboard/notifications/templates/${encodeURIComponent(key)}`,{name:null,titleTemplate:input.titleTemplate,bodyTemplate:input.bodyTemplate,isActive:input.enabled}); return p===undefined?undefined:template(unwrap(p));}
export async function getNotificationTargetSources(signal?:AbortSignal){const p=unwrap(await apiClient.get<unknown>('/api/dashboard/notifications/target-sources',signal)); const r=rec(p); const map=(v:unknown)=>arr(v).map(x=>{const q=rec(x);return{id:id(q.id,q.userId,q.organizationId),name:str(q.name,q.fullName,q.title)??id(q.id)}}); return {organizations:map(r.organizations),users:map(r.users)};}
