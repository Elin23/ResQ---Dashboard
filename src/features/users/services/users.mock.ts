import type { AdminSession } from '@/features/auth/session';
import { getAdoptionRequests } from '@/features/adoption-requests/services/adoption-requests.mock';
import { recordAdminAuditEvent } from '@/features/audit-log/services/audit-log.mock';
import { getReports } from '@/features/reports/services/reports.mock';
import { mockDelay } from '@/services/mock/delay';
import type { ModerateUserInput, User, UserAccountStatus, UserActivityEvent, UserDetails, UserFilters, UserInternalNote, UserListResult, UserModerationAction, UserModerationRecord, UserSummary, UserVerificationStatus } from '../types';

const seedNow = Date.now();
const daysAgo = (n: number) => new Date(seedNow - n * 86400000).toISOString();
const hoursAgo = (n: number) => new Date(seedNow - n * 3600000).toISOString();
const clone = <T>(value: T): T => structuredClone(value);

interface Supplemental {
  accountStatus: UserAccountStatus;
  verificationStatus: UserVerificationStatus;
  governorate?: string;
  createdAt: string;
  lastActiveAt?: string;
  updatedAt?: string;
  profileBio?: string;
  birthDate?: string;
  supportTickets: number;
  supportStatus?: 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';
}

const supplemental = new Map<string, Supplemental>([
  [
    'USR-1001',
    {
      accountStatus: 'ACTIVE',
      verificationStatus: 'PHONE_VERIFIED',
      governorate: 'دمشق',
      createdAt: daysAgo(620),
      lastActiveAt: hoursAgo(2),
      profileBio: 'تهتم برعاية الحيوانات المنزلية وتتابع حالات الإنقاذ المحلية.',
      supportTickets: 1,
      supportStatus: 'RESOLVED',
    },
  ],
  [
    'USR-1002',
    {
      accountStatus: 'ACTIVE',
      verificationStatus: 'PHONE_VERIFIED',
      governorate: 'ريف دمشق',
      createdAt: daysAgo(410),
      lastActiveAt: hoursAgo(7),
      supportTickets: 0,
    },
  ],
  [
    'USR-1003',
    {
      accountStatus: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      governorate: 'حلب',
      createdAt: daysAgo(830),
      lastActiveAt: daysAgo(2),
      supportTickets: 2,
      supportStatus: 'CLOSED',
    },
  ],
  [
    'USR-1004',
    {
      accountStatus: 'ACTIVE',
      verificationStatus: 'UNVERIFIED',
      governorate: 'اللاذقية',
      createdAt: daysAgo(230),
      lastActiveAt: daysAgo(10),
      supportTickets: 0,
    },
  ],
  [
    'USR-1005',
    {
      accountStatus: 'SUSPENDED',
      verificationStatus: 'PHONE_VERIFIED',
      governorate: 'حمص',
      createdAt: daysAgo(90),
      lastActiveAt: daysAgo(18),
      supportTickets: 3,
      supportStatus: 'PENDING',
    },
  ],
  [
    'USR-1006',
    {
      accountStatus: 'ACTIVE',
      verificationStatus: 'PHONE_VERIFIED',
      governorate: 'طرطوس',
      createdAt: daysAgo(500),
      lastActiveAt: hoursAgo(22),
      supportTickets: 1,
      supportStatus: 'RESOLVED',
    },
  ],
  [
    'USR-1107',
    {
      accountStatus: 'ACTIVE',
      verificationStatus: 'PHONE_VERIFIED',
      governorate: 'دمشق',
      createdAt: daysAgo(720),
      lastActiveAt: hoursAgo(1),
      supportTickets: 0,
    },
  ],
  [
    'USR-1120',
    {
      accountStatus: 'ACTIVE',
      verificationStatus: 'UNVERIFIED',
      governorate: 'حلب',
      createdAt: daysAgo(310),
      lastActiveAt: daysAgo(4),
      supportTickets: 1,
      supportStatus: 'RESOLVED',
    },
  ],
  [
    'USR-1152',
    {
      accountStatus: 'ACTIVE',
      verificationStatus: 'PHONE_VERIFIED',
      governorate: 'طرطوس',
      createdAt: daysAgo(450),
      lastActiveAt: daysAgo(1),
      supportTickets: 0,
    },
  ],
  [
    'USR-1160',
    {
      accountStatus: 'BLOCKED',
      verificationStatus: 'PHONE_VERIFIED',
      governorate: 'دمشق',
      createdAt: daysAgo(540),
      lastActiveAt: daysAgo(34),
      supportTickets: 4,
      supportStatus: 'CLOSED',
    },
  ],
  [
    'USR-1168',
    {
      accountStatus: 'ACTIVE',
      verificationStatus: 'PHONE_VERIFIED',
      governorate: 'حلب',
      createdAt: daysAgo(190),
      lastActiveAt: daysAgo(3),
      supportTickets: 0,
    },
  ],
  [
    'USR-1174',
    {
      accountStatus: 'DEACTIVATED',
      verificationStatus: 'PHONE_VERIFIED',
      governorate: 'ريف دمشق',
      createdAt: daysAgo(900),
      lastActiveAt: daysAgo(80),
      supportTickets: 1,
      supportStatus: 'CLOSED',
    },
  ],
]);

const moderationById = new Map<string, UserModerationRecord[]>([
  [
    'USR-1005',
    [
      {
        id: 'MOD-1005-1',
        userId: 'USR-1005',
        action: 'SUSPEND',
        reason: 'نشاط مريب',
        note: 'تم تعليق الحساب مؤقتًا لحين مراجعة سياق النشاط.',
        actorId: 'ADM-001',
        actorName: 'مدير النظام',
        createdAt: daysAgo(8),
      },
    ],
  ],
  [
    'USR-1160',
    [
      {
        id: 'MOD-1160-1',
        userId: 'USR-1160',
        action: 'BLOCK',
        reason: 'إساءة استخدام خطرة أو متكررة',
        actorId: 'ADM-001',
        actorName: 'مدير النظام',
        createdAt: daysAgo(30),
      },
    ],
  ],
]);

const notesById = new Map<string, UserInternalNote[]>();

const standalone: User[] = [
  {
    id: 'USR-1301',
    fullName: 'مها العبد',
    phone: '0948 330 215',
    email: 'maha.abd@example.test',
    governorate: 'دمشق',
    city: 'الميدان',
    accountStatus: 'ACTIVE',
    verificationStatus: 'PHONE_VERIFIED',
    createdAt: daysAgo(12),
    updatedAt: daysAgo(1),
    lastActiveAt: hoursAgo(5),
    profileBio: 'متابعة للحملات المجتمعية ورعاية الحيوانات.',
  },
  {
    id: 'USR-1302',
    fullName: 'عمر حمزة',
    governorate: 'حماة',
    city: 'القصور',
    accountStatus: 'ACTIVE',
    verificationStatus: 'UNVERIFIED',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
    lastActiveAt: daysAgo(1),
  },
  {
    id: 'USR-1303',
    fullName: 'رنا الصفدي',
    email: 'rana.safadi@example.test',
    governorate: 'درعا',
    city: 'المحطة',
    accountStatus: 'SUSPENDED',
    verificationStatus: 'PHONE_VERIFIED',
    createdAt: daysAgo(150),
    updatedAt: daysAgo(4),
    lastActiveAt: daysAgo(12),
  },
];

function fallback(id: string): Supplemental {
  return (
    supplemental.get(id) ?? {
      accountStatus: 'ACTIVE',
      verificationStatus: 'PHONE_VERIFIED',
      createdAt: daysAgo(365),
      lastActiveAt: daysAgo(6),
      supportTickets: 0,
    }
  );
}

function applySupplemental(user: User): User {
  const s = supplemental.get(user.id);

  if (!s) {
    return user;
  }

  return {
    ...user,
    accountStatus: s.accountStatus,
    verificationStatus: s.verificationStatus,
    governorate: s.governorate ?? user.governorate,
    createdAt: s.createdAt ?? user.createdAt,
    updatedAt: s.updatedAt ?? user.updatedAt,
    lastActiveAt: s.lastActiveAt ?? user.lastActiveAt,
    profileBio: s.profileBio ?? user.profileBio,
    birthDate: s.birthDate ?? user.birthDate,
  };
}

async function relationshipData() {
  const [reports, adoptions] = await Promise.all([
    getReports({ search: '', page: 1, pageSize: 500 }),
    getAdoptionRequests({ search: '', page: 1, pageSize: 500 }),
  ]);

  return {
    reports: reports.items,
    adoptions: adoptions.items,
  };
}

type RelationshipData = Awaited<ReturnType<typeof relationshipData>>;

function allUsers({ reports, adoptions }: RelationshipData): User[] {
  const map = new Map<string, User>(standalone.map((u) => [u.id, applySupplemental(u)]));

  for (const r of reports) {
    if (r.reporter.isGuest) {
      continue;
    }

    const s = fallback(r.reporter.id);
    const existing = map.get(r.reporter.id);

    map.set(r.reporter.id, {
      id: r.reporter.id,
      fullName: r.reporter.name,
      phone: r.reporter.phone ?? existing?.phone,
      email: r.reporter.email ?? existing?.email,
      governorate: s.governorate ?? r.governorate,
      city: existing?.city ?? r.city,
      accountStatus: s.accountStatus,
      verificationStatus: s.verificationStatus,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt ?? r.updatedAt,
      lastActiveAt: s.lastActiveAt ?? r.updatedAt,
      profileBio: s.profileBio,
    });
  }

  for (const a of adoptions) {
    if (a.publisher.type !== 'USER') {
      continue;
    }

    const s = fallback(a.publisher.id);
    const existing = map.get(a.publisher.id);

    map.set(a.publisher.id, {
      id: a.publisher.id,
      fullName: a.publisher.name,
      phone: a.publisher.phone ?? existing?.phone,
      email: a.publisher.email ?? existing?.email,
      governorate: s.governorate,
      city: a.publisher.city,
      accountStatus: s.accountStatus,
      verificationStatus: s.verificationStatus,
      createdAt: a.publisher.memberSince ?? s.createdAt,
      updatedAt: s.updatedAt ?? a.updatedAt,
      lastActiveAt: s.lastActiveAt ?? a.updatedAt,
      profileBio: s.profileBio,
    });
  }

  return [...map.values()];
}

function isResolved(status: string) {
  return status === 'CLOSED';
}

function isActiveReport(status: string) {
  return !isResolved(status);
}

function enrich(user: User, { reports, adoptions }: RelationshipData): User {
  const ur = reports.filter((r) => !r.reporter.isGuest && r.reporter.id === user.id);
  const ua = adoptions.filter((a) => a.publisher.type === 'USER' && a.publisher.id === user.id);

  return {
    ...user,
    statistics: {
      reportsCount: ur.length,
      verifiedReportsCount: ur.length,
      activeReportsCount: ur.filter((r) => isActiveReport(r.status)).length,
      resolvedReportsCount: ur.filter((r) => isResolved(r.status)).length,
      adoptionRequestsCount: ua.length,
      pendingAdoptionRequestsCount: ua.filter((a) => a.status === 'PENDING_REVIEW').length,
      underReviewAdoptionRequestsCount: 0,
      activeAdoptionRequestsCount: ua.filter((a) => a.status === 'PUBLISHED').length,
      completedAdoptionsCount: ua.filter((a) => a.status === 'ADOPTED').length,
      supportTicketsCount: fallback(user.id).supportTickets,
      accountAgeDays: Math.max(0, Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000)),
    },
  };
}

export async function getUsers(filters: UserFilters): Promise<UserListResult> {
  await mockDelay(90);

  const relationships = await relationshipData();
  let users = allUsers(relationships).map((user) => enrich(user, relationships));
  const needle = filters.search.trim().toLocaleLowerCase('ar');

  users = users.filter((u) => {
    const hay = `${u.id} ${u.fullName} ${u.phone ?? ''} ${u.email ?? ''} ${u.city ?? ''}`.toLocaleLowerCase('ar');

    if (needle && !hay.includes(needle)) {
      return false;
    }

    if (filters.accountStatus && u.accountStatus !== filters.accountStatus) {
      return false;
    }

    if (
      filters.verificationStatus &&
      u.verificationStatus !== filters.verificationStatus
    ) {
      return false;
    }

    return true;
  });

  const key = filters.sortBy;

  users.sort((a, b) => {
    let n = 0;

    if (key === 'fullName') {
      n = a.fullName.localeCompare(b.fullName, 'ar');
    } else if (key === 'accountStatus') {
      n = a.accountStatus.localeCompare(b.accountStatus);
    } else if (key === 'lastActiveAt') {
      n =
        new Date(a.lastActiveAt ?? 0).getTime() -
        new Date(b.lastActiveAt ?? 0).getTime();
    } else {
      n = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return (filters.sortDirection === 'asc' ? 1 : -1) * n;
  });

  const total = users.length;
  const pageCount = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(filters.page, pageCount);

  return {
    items: clone(
      users.slice(
        (page - 1) * filters.pageSize,
        page * filters.pageSize,
      ),
    ),
    total,
    page,
    pageSize: filters.pageSize,
    pageCount,
  };
}

export async function getUserSummary(): Promise<UserSummary> {
  const relationships = await relationshipData();
  const users = allUsers(relationships).map((user) => enrich(user, relationships));
  const start = new Date();

  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  return {
    total: users.length,
    newThisMonth: users.filter((u) => new Date(u.createdAt) >= start).length,
    active: users.filter((u) => u.accountStatus === 'ACTIVE').length,
    suspended: users.filter((u) => u.accountStatus === 'SUSPENDED').length,
    blocked: users.filter((u) => u.accountStatus === 'BLOCKED').length,
    withActiveAdoptions: users.filter(
      (u) => (u.statistics?.activeAdoptionRequestsCount ?? 0) > 0,
    ).length,
  };
}

function buildUserDetails(id: string, relationships: RelationshipData): UserDetails | null {
  const base = allUsers(relationships).find((u) => u.id === id);

  if (!base) {
    return null;
  }

  const user = enrich(base, relationships);
  const { reports, adoptions } = relationships;

  const relatedReports = reports
    .filter((r) => !r.reporter.isGuest && r.reporter.id === id)
    .map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      severity: r.severity,
      createdAt: r.createdAt,
    }));

  const relatedAdoptions = adoptions
    .filter((a) => a.publisher.type === 'USER' && a.publisher.id === id)
    .map((a) => ({
      id: a.id,
      animalId: a.animal.id,
      animalName: a.animal.name,
      status: a.status,
      submittedAt: a.submittedAt,
      completedAt: a.adoptedAt,
    }));

  const moderation = moderationById.get(id) ?? [];

  const reportEvents: UserActivityEvent[] = relatedReports
    .slice(0, 3)
    .map((r) => ({
      id: `${id}-${r.id}`,
      title: 'تم إرسال بلاغ',
      timestamp: r.createdAt,
      details: r.id,
      tone: 'info',
    }));

  const adoptionEvents: UserActivityEvent[] = relatedAdoptions
    .slice(0, 3)
    .map((a) => ({
      id: `${id}-${a.id}`,
      title:
        a.status === 'ADOPTED'
          ? 'اكتمل تبني الحيوان المعروض'
          : 'تم إرسال عرض حيوان للتبني',
      timestamp: a.completedAt ?? a.submittedAt,
      details: a.id,
      tone: a.status === 'ADOPTED' ? 'success' : 'pending',
    }));

  const moderationEvents: UserActivityEvent[] = moderation.map((m) => ({
    id: `${id}-${m.id}`,
    title: {
      WARNING: 'تم إصدار تحذير إداري',
      SUSPEND: 'تم تعليق الحساب',
      REACTIVATE: 'تمت إعادة التفعيل',
      BLOCK: 'تم حظر الحساب',
      UNBLOCK: 'تم رفع الحظر',
    }[m.action],
    actor: m.actorName,
    timestamp: m.createdAt,
    details: m.reason,
    tone:
      m.action === 'BLOCK' || m.action === 'SUSPEND'
        ? 'critical'
        : m.action === 'REACTIVATE' || m.action === 'UNBLOCK'
          ? 'success'
          : 'pending',
  }));

  const activity: UserActivityEvent[] = [
    {
      id: `${id}-created`,
      title: 'تم إنشاء الحساب',
      timestamp: user.createdAt,
      tone: 'info',
    },
  ];

  if (user.verificationStatus !== 'UNVERIFIED') {
    activity.push({
      id: `${id}-verified`,
      title: 'تم توثيق رقم الهاتف',
      timestamp: daysAgo(
        Math.max(
          1,
          (user.statistics?.accountAgeDays ?? 10) - 2,
        ),
      ),
      tone: 'success',
    });
  }

  activity.push(
    ...reportEvents,
    ...adoptionEvents,
    ...moderationEvents,
  );

  activity.sort(
    (a, b) =>
      new Date(b.timestamp).getTime() -
      new Date(a.timestamp).getTime(),
  );

  const s = fallback(id);

  return {
    user,
    reports: relatedReports,
    adoptions: relatedAdoptions,
    moderation: clone(moderation),
    activity,
    notes: clone(notesById.get(id) ?? []),
    support: {
      ticketsCount: s.supportTickets,
      lastTicketStatus: s.supportStatus,
      lastTicketAt: s.supportTickets ? daysAgo(11) : undefined,
    },
  };
}

export async function getUserById(id: string): Promise<UserDetails | null> {
  await mockDelay(70);

  return buildUserDetails(id, await relationshipData());
}

function resolveModerationReason(input: ModerateUserInput | undefined) {
  if (!input) {
    return undefined;
  }

  return input.reason === 'سبب آخر' ? input.otherReason ?? input.reason : input.reason;
}

// Keep moderation state and history synchronized in one place.
function updateStatus(
  user: User,
  status: UserAccountStatus,
  action: UserModerationAction,
  input: ModerateUserInput | undefined,
  actor: AdminSession,
) {
  const s = supplemental.get(user.id) ?? {
    accountStatus: user.accountStatus,
    verificationStatus: user.verificationStatus,
    governorate: user.governorate,
    createdAt: user.createdAt,
    lastActiveAt: user.lastActiveAt,
    updatedAt: user.updatedAt,
    profileBio: user.profileBio,
    birthDate: user.birthDate,
    supportTickets: user.statistics?.supportTicketsCount ?? 0,
  };

  const changedAt = new Date().toISOString();

  supplemental.set(user.id, {
    ...s,
    accountStatus: status,
    updatedAt: changedAt,
  });

  const record: UserModerationRecord = {
    id: `MOD-${user.id}-${Date.now()}`,
    userId: user.id,
    action,
    reason: resolveModerationReason(input),
    note: input?.note,
    actorId: actor.id,
    actorName: actor.name,
    createdAt: changedAt,
  };

  moderationById.set(user.id, [
    record,
    ...(moderationById.get(user.id) ?? []),
  ]);

  return record;
}

export async function suspendUser(id: string, input: ModerateUserInput, actor: AdminSession) {
  await mockDelay(80);

  const relationships = await relationshipData();
  const d = buildUserDetails(id, relationships);

  if (!d) {
    throw new Error('USER_NOT_FOUND');
  }

  if (d.user.accountStatus !== 'ACTIVE') {
    throw new Error('INVALID_USER_TRANSITION');
  }

  updateStatus(d.user, 'SUSPENDED', 'SUSPEND', input, actor);

  recordAdminAuditEvent(actor, {
    action: 'USER_SUSPENDED',
    resource: {
      type: 'USER',
      id,
      label: d.user.fullName,
    },
    reason: resolveModerationReason(input),
    previousValue: {
      status: d.user.accountStatus,
    },
    newValue: {
      status: 'SUSPENDED',
    },
    metadata: {
      source: 'إدارة المستخدمين',
    },
  });

  return buildUserDetails(id, relationships);
}

export async function reactivateUser(id: string, note: string | undefined, actor: AdminSession) {
  await mockDelay(70);

  const relationships = await relationshipData();
  const d = buildUserDetails(id, relationships);

  if (!d) {
    throw new Error('USER_NOT_FOUND');
  }

  if (d.user.accountStatus !== 'SUSPENDED') {
    throw new Error('INVALID_USER_TRANSITION');
  }

  updateStatus(
    d.user,
    'ACTIVE',
    'REACTIVATE',
    {
      reason: 'إعادة تفعيل الحساب',
      note,
    },
    actor,
  );

  recordAdminAuditEvent(actor, {
    action: 'USER_REACTIVATED',
    resource: {
      type: 'USER',
      id,
      label: d.user.fullName,
    },
    reason: note,
    previousValue: {
      status: 'SUSPENDED',
    },
    newValue: {
      status: 'ACTIVE',
    },
    metadata: {
      source: 'إدارة المستخدمين',
    },
  });

  return buildUserDetails(id, relationships);
}

export async function blockUser(id: string, input: ModerateUserInput, actor: AdminSession) {
  await mockDelay(80);

  const relationships = await relationshipData();
  const d = buildUserDetails(id, relationships);

  if (!d) {
    throw new Error('USER_NOT_FOUND');
  }

  if (!['ACTIVE', 'SUSPENDED'].includes(d.user.accountStatus)) {
    throw new Error('INVALID_USER_TRANSITION');
  }

  updateStatus(d.user, 'BLOCKED', 'BLOCK', input, actor);

  recordAdminAuditEvent(actor, {
    action: 'USER_BLOCKED',
    resource: {
      type: 'USER',
      id,
      label: d.user.fullName,
    },
    reason: resolveModerationReason(input),
    previousValue: {
      status: d.user.accountStatus,
    },
    newValue: {
      status: 'BLOCKED',
    },
    metadata: {
      source: 'إدارة المستخدمين',
    },
  });

  return buildUserDetails(id, relationships);
}

export async function unblockUser(id: string, note: string | undefined, actor: AdminSession) {
  await mockDelay(70);

  const relationships = await relationshipData();
  const d = buildUserDetails(id, relationships);

  if (!d) {
    throw new Error('USER_NOT_FOUND');
  }

  if (d.user.accountStatus !== 'BLOCKED') {
    throw new Error('INVALID_USER_TRANSITION');
  }

  updateStatus(
    d.user,
    'ACTIVE',
    'UNBLOCK',
    {
      reason: 'رفع حظر الحساب',
      note,
    },
    actor,
  );

  recordAdminAuditEvent(actor, {
    action: 'USER_UNBLOCKED',
    resource: {
      type: 'USER',
      id,
      label: d.user.fullName,
    },
    reason: note,
    previousValue: {
      status: 'BLOCKED',
    },
    newValue: {
      status: 'ACTIVE',
    },
    metadata: {
      source: 'إدارة المستخدمين',
    },
  });

  return buildUserDetails(id, relationships);
}

export async function addUserNote(id: string, note: string, actor: AdminSession) {
  await mockDelay(60);

  const relationships = await relationshipData();

  if (!buildUserDetails(id, relationships)) {
    throw new Error('USER_NOT_FOUND');
  }

  const created: UserInternalNote = {
    id: `${id}-note-${Date.now()}`,
    adminName: actor.name,
    adminRole: actor.roleLabel,
    createdAt: new Date().toISOString(),
    note,
  };

  notesById.set(id, [
    created,
    ...(notesById.get(id) ?? []),
  ]);

  return clone(created);
}