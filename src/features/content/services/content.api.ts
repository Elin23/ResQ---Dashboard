import type { AdminSession } from '@/features/auth/session';
import { apiClient } from '@/services/api/client';
import { resolveMediaUrl } from '@/lib/media-url';
import type {
  Article,
  ArticleCategory,
  AwarenessContent,
  ContentListFilters,
  ContentListResult,
  ContentRevision,
  ContentStatus,
  EditorialEvent,
  EditorialInput,
  EditorialNote,
  EditorialRecord,
  FaqItem,
  SuccessStory,
} from '../types';

type R = Record<string, unknown>;
type EditorialKind = 'article' | 'story' | 'awareness';
type EditorialItem = Article | SuccessStory | AwarenessContent;
const apiKind = (kind: EditorialKind) => kind === 'story' ? 'success-story' : kind;

const rec = (value: unknown): R => value && typeof value === 'object' && !Array.isArray(value) ? value as R : {};
const arr = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const str = (...values: unknown[]): string | undefined => values.find((value) => typeof value === 'string' && value.trim()) as string | undefined;
const num = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};
const bool = (...values: unknown[]): boolean | undefined => values.find((value) => typeof value === 'boolean') as boolean | undefined;
const identifier = (...values: unknown[]): string => String(values.find((value) => value !== null && value !== undefined && String(value).trim()) ?? '');
const unwrap = (value: unknown): unknown => {
  const record = rec(value);
  return record.data ?? record.result ?? record.value ?? value;
};
const now = () => new Date().toISOString();

const statusMap: Record<string, ContentStatus> = {
  DRAFT: 'DRAFT',
  IN_REVIEW: 'IN_REVIEW',
  REVIEW: 'IN_REVIEW',
  PENDING: 'IN_REVIEW',
  PENDING_REVIEW: 'IN_REVIEW',
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'PUBLISHED',
  ACTIVE: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
  INACTIVE: 'ARCHIVED',
};

function normalizeStatus(value: unknown): ContentStatus {
  return statusMap[String(value ?? '').trim().toUpperCase()] ?? 'DRAFT';
}

function normalizeAuthor(value: unknown, fallback?: R) {
  const author = rec(value);
  return {
    id: identifier(author.id, author.userId, fallback?.authorId, fallback?.createdById, fallback?.creatorId) || 'SYSTEM',
    name: str(author.name, author.fullName, author.displayName, fallback?.authorName, fallback?.createdByName, fallback?.creatorName) ?? 'إدارة ResQ',
  };
}

function normalizeBase(value: unknown) {
  const x = rec(value);
  const createdAt = str(x.createdAt, x.creationTime, x.createdOn) ?? now();
  const updatedAt = str(x.updatedAt, x.lastModificationTime, x.modifiedAt) ?? createdAt;
  return {
    x,
    id: identifier(x.id, x.contentId, x.articleId, x.storyId, x.awarenessId),
    title: str(x.title, x.name) ?? 'محتوى',
    slug: str(x.slug) ?? '',
    content: str(x.body, x.content, x.description) ?? '',
    summary: str(x.excerpt, x.summary, x.description) ?? '',
    coverImageUrl: resolveMediaUrl(str(x.coverImageUrl, x.imageUrl, x.coverUrl)) || undefined,
    coverAltText: str(x.coverAltText, x.imageAlt, x.title),
    status: normalizeStatus(x.status),
    author: normalizeAuthor(x.author ?? x.creator ?? x.createdBy, x),
    publishedAt: str(x.publishedAt, x.publishedOn),
    scheduledAt: str(x.scheduledAt),
    createdAt,
    updatedAt,
  };
}

function normalizeArticle(value: unknown): Article {
  const base = normalizeBase(value);
  const x = base.x;
  return {
    id: base.id,
    title: base.title,
    slug: base.slug,
    excerpt: base.summary,
    content: base.content,
    coverImageUrl: base.coverImageUrl,
    coverAltText: base.coverAltText,
    category: (str(x.category)?.toUpperCase() as ArticleCategory | undefined) ?? 'OTHER',
    tags: arr(x.tags).map(String).filter(Boolean),
    status: base.status,
    author: base.author,
    seo: {
      metaTitle: str(rec(x.seo).metaTitle, x.metaTitle),
      metaDescription: str(rec(x.seo).metaDescription, x.metaDescription),
    },
    publishedAt: base.publishedAt,
    scheduledAt: base.scheduledAt,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
  };
}

function normalizeStory(value: unknown): SuccessStory {
  const base = normalizeBase(value);
  const x = base.x;
  return {
    id: base.id,
    title: base.title,
    slug: base.slug,
    summary: base.summary,
    content: base.content,
    coverImageUrl: base.coverImageUrl,
    coverAltText: base.coverAltText,
    gallery: arr(x.gallery ?? x.media).map((media, index) => {
      const m = rec(media);
      return {
        id: identifier(m.id, `${base.id}-MEDIA-${index + 1}`),
        type: 'IMAGE' as const,
        url: resolveMediaUrl(str(m.url, m.imageUrl)),
        altText: str(m.altText, m.caption, base.title) ?? base.title,
        caption: str(m.caption),
      };
    }).filter((media) => media.url),
    reportId: identifier(x.reportId) || undefined,
    organizationId: identifier(x.organizationId) || undefined,
    status: base.status,
    author: base.author,
    publishedAt: base.publishedAt,
    scheduledAt: base.scheduledAt,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
  };
}

function normalizeAwareness(value: unknown): AwarenessContent {
  const base = normalizeBase(value);
  const x = base.x;
  const audience = arr(x.audience ?? x.audiences).map((item) => String(item).toUpperCase()).filter((item): item is 'ALL' | 'USERS' | 'ORGANIZATIONS' => ['ALL', 'USERS', 'ORGANIZATIONS'].includes(item));
  return {
    id: base.id,
    title: base.title,
    slug: base.slug,
    summary: base.summary,
    content: base.content,
    coverImageUrl: base.coverImageUrl,
    coverAltText: base.coverAltText,
    audience: audience.length ? audience : ['ALL'],
    status: base.status,
    author: base.author,
    publishedAt: base.publishedAt,
    scheduledAt: base.scheduledAt,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
  };
}

function normalizeItem(kind: EditorialKind, value: unknown): EditorialItem {
  return kind === 'article' ? normalizeArticle(value) : kind === 'story' ? normalizeStory(value) : normalizeAwareness(value);
}

function normalizeList<T extends EditorialItem>(payload: unknown, filters: ContentListFilters, normalize: (value: unknown) => T): ContentListResult<T> {
  const body = rec(unwrap(payload));
  const source = body.items ?? body.content ?? body.records ?? body.data ?? unwrap(payload);
  const items = arr(source).map(normalize);
  const total = num(body.total, body.totalCount, body.count) ?? items.length;
  const page = num(body.page, body.pageNumber) ?? filters.page;
  const pageSize = num(body.pageSize, body.maxResultCount) ?? filters.pageSize;
  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / Math.max(1, pageSize))) };
}

function query(filters: ContentListFilters) {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set('search', filters.search.trim());
  if (filters.status) params.set('status', filters.status);
  params.set('page', String(filters.page));
  params.set('pageSize', String(filters.pageSize));
  return params.toString();
}

function timelineEvent(value: unknown, index: number): EditorialEvent {
  const x = rec(value);
  return {
    id: identifier(x.id, x.eventId, `EV-${index + 1}`),
    title: str(x.title, x.action, x.event, x.status) ?? 'تحديث المحتوى',
    actor: str(x.actorName, x.actor, rec(x.actor).name, x.adminName),
    timestamp: str(x.timestamp, x.createdAt, x.creationTime) ?? now(),
    details: str(x.details, x.description, x.reason, x.note),
    tone: str(x.tone) as EditorialEvent['tone'],
  };
}

function note(value: unknown, index: number): EditorialNote {
  const x = rec(value);
  return {
    id: identifier(x.id, x.noteId, `NOTE-${index + 1}`),
    adminName: str(x.adminName, x.actorName, x.createdByName, rec(x.admin).name) ?? 'الإدارة',
    createdAt: str(x.createdAt, x.creationTime) ?? now(),
    note: str(x.note, x.body, x.text) ?? '',
  };
}

function revision(value: unknown, index: number, itemId: string): ContentRevision {
  const x = rec(value);
  return {
    id: identifier(x.id, x.revisionId, `REV-${index + 1}`),
    contentId: identifier(x.contentId, itemId),
    createdAt: str(x.createdAt, x.creationTime) ?? now(),
    author: normalizeAuthor(x.author ?? x.createdBy, x),
    summary: str(x.summary, x.description, x.action),
  };
}

function normalizeRecord(kind: EditorialKind, payload: unknown): EditorialRecord<EditorialItem> | undefined {
  const raw = unwrap(payload);
  if (raw == null) return undefined;
  const body = rec(raw);
  const item = normalizeItem(kind, body.item ?? body.content ?? body);
  if (!item.id) return undefined;
  return {
    item,
    timeline: arr(body.timeline ?? body.events ?? body.activity).map(timelineEvent),
    notes: arr(body.notes ?? body.internalNotes).map(note),
    revisions: arr(body.revisions ?? body.history).map((value, index) => revision(value, index, item.id)),
  };
}

function metric(value: unknown) {
  const x = rec(value);
  return {
    total: num(x.total, x.totalCount, x.count) ?? 0,
    drafts: num(x.drafts, x.draft, x.draftCount) ?? 0,
    published: num(x.published, x.publishedCount, x.active) ?? 0,
    scheduled: num(x.scheduled, x.scheduledCount) ?? 0,
  };
}

function normalizeOverview(payload: unknown) {
  const x = rec(unwrap(payload));
  return {
    articles: metric(x.articles),
    stories: metric(x.stories ?? x.successStories),
    awareness: metric(x.awareness),
    faq: metric(x.faq ?? x.faqs),
  };
}

function normalizeFaq(value: unknown, index: number): FaqItem {
  const x = rec(value);
  const createdAt = str(x.createdAt, x.creationTime) ?? now();
  return {
    id: identifier(x.id, x.faqId),
    question: str(x.question) ?? '',
    answer: str(x.answer) ?? '',
    category: str(x.category) ?? 'عام',
    order: num(x.sortOrder, x.order) ?? index + 1,
    active: bool(x.active, x.isActive) ?? String(x.status ?? '').toUpperCase() !== 'INACTIVE',
    createdAt,
    updatedAt: str(x.updatedAt, x.lastModificationTime) ?? createdAt,
  };
}

export async function getArticles(filters: ContentListFilters, signal?: AbortSignal) {
  const payload = await apiClient.get<unknown>(`/api/dashboard/content/articles?${query(filters)}`, signal);
  let result = normalizeList(payload, filters, normalizeArticle);
  if (filters.category) result = { ...result, items: result.items.filter((item) => item.category === filters.category) };
  if (filters.tag) result = { ...result, items: result.items.filter((item) => item.tags.includes(filters.tag!)) };
  return result;
}

export async function getStories(filters: ContentListFilters, signal?: AbortSignal) {
  return normalizeList(await apiClient.get<unknown>(`/api/dashboard/content/success-stories?${query(filters)}`, signal), filters, normalizeStory);
}

export async function getAwareness(filters: ContentListFilters, signal?: AbortSignal) {
  return normalizeList(await apiClient.get<unknown>(`/api/dashboard/content/awareness?${query(filters)}`, signal), filters, normalizeAwareness);
}

export async function getContentOverview(signal?: AbortSignal) {
  return normalizeOverview(await apiClient.get<unknown>('/api/dashboard/content/overview', signal));
}

export async function getEditorialRecord(kind: EditorialKind, id: string, signal?: AbortSignal) {
  return normalizeRecord(kind, await apiClient.get<unknown>(`/api/dashboard/content/${encodeURIComponent(apiKind(kind))}/${encodeURIComponent(id)}`, signal));
}

export async function saveEditorial(kind: EditorialKind, id: string | undefined, input: EditorialInput, _actor: AdminSession, status: ContentStatus = 'DRAFT') {
  const body = {
    title: input.title,
    slug: input.slug,
    excerpt: input.summary,
    body: input.content,
    coverImageUrl: input.coverImageUrl ?? null,
    category: input.category ?? null,
    tags: input.tags,
    scheduledAt: input.scheduledAt ?? null,
  };
  const payload = id
    ? await apiClient.patch<unknown>(`/api/dashboard/content/${encodeURIComponent(apiKind(kind))}/${encodeURIComponent(id)}`, body)
    : await apiClient.post<unknown>(`/api/dashboard/content/${encodeURIComponent(apiKind(kind))}`, body);
  const item = normalizeItem(kind, unwrap(payload));
  if (status !== 'DRAFT' && item.id) {
    await changeContentStatus(kind, item.id, status, _actor, input.scheduledAt);
    return (await getEditorialRecord(kind, item.id))?.item ?? item;
  }
  return item;
}

export async function changeContentStatus(kind: EditorialKind, id: string, status: ContentStatus, _actor: AdminSession, scheduledAt?: string) {
  const payload = await apiClient.patch<unknown>(`/api/dashboard/content/${encodeURIComponent(apiKind(kind))}/${encodeURIComponent(id)}/status`, { status, scheduledAt: scheduledAt ?? null });
  if (payload !== undefined) return normalizeItem(kind, unwrap(payload));
  return (await getEditorialRecord(kind, id))?.item;
}

export async function addEditorialNote(kind: EditorialKind, id: string, noteText: string, _actor: AdminSession) {
  const payload = await apiClient.post<unknown>(`/api/dashboard/content/${encodeURIComponent(apiKind(kind))}/${encodeURIComponent(id)}/notes`, { note: noteText });
  return payload === undefined ? undefined : note(unwrap(payload), 0);
}

export async function getFaqItems(signal?: AbortSignal) {
  const payload = unwrap(await apiClient.get<unknown>('/api/dashboard/faq', signal));
  const body = rec(payload);
  return arr(body.items ?? body.faqs ?? body.data ?? payload).map(normalizeFaq).sort((a, b) => a.order - b.order);
}

export async function saveFaq(input: { id?: string; question: string; answer: string; category: string }) {
  const body = { question: input.question, answer: input.answer, category: input.category };
  const payload = input.id
    ? await apiClient.patch<unknown>(`/api/dashboard/faq/${encodeURIComponent(input.id)}`, body)
    : await apiClient.post<unknown>('/api/dashboard/faq', body);
  if (payload === undefined) return undefined;
  return normalizeFaq(unwrap(payload), 0);
}

export async function toggleFaq(id: string, active: boolean) {
  return apiClient.patch(`/api/dashboard/faq/${encodeURIComponent(id)}/status`, { status: active ? 'ACTIVE' : 'INACTIVE' });
}

export async function moveFaq(id: string, direction: 'up' | 'down') {
  const items = await getFaqItems();
  const currentIndex = items.findIndex((item) => item.id === id);
  if (currentIndex < 0) throw new Error('NOT_FOUND');
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return items;
  const sortOrder = items[targetIndex]!.order;
  await apiClient.post(`/api/dashboard/faq/${encodeURIComponent(id)}/reorder`, { sortOrder });
  return getFaqItems();
}
