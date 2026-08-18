import type {
  AdminSession,
} from '@/features/auth/session';

import {
  recordAdminAuditEvent,
} from '@/features/audit-log/services/audit-log.mock';

import {
  getAdoptionRequests,
} from '@/features/adoption-requests/services/adoption-requests.mock';

import {
  getReports,
} from '@/features/reports/services/reports.mock';

import {
  getAdvertiserAdvertisementSummary,
} from '@/features/advertisements/services/advertisements.mock';

import {
  mockDelay,
} from '@/services/mock/delay';

import type {
  Organization,
  OrganizationDetails,
  OrganizationFilters,
  OrganizationInternalNote,
  OrganizationListResult,
  OrganizationStatistics,
  OrganizationSummary,
  OrganizationTimelineEvent,
  RejectOrganizationInput,
  RequestInfoInput,
  ReviewDocumentInput,
  SuspendOrganizationInput,
} from '../types';

import {
  organizationFixtures,
} from './organization-fixtures';

const clone = <T,>(
  value: T,
): T =>
  structuredClone(value);

let organizations =
  clone(
    organizationFixtures,
  );

const timelines =
  new Map<
    string,
    OrganizationTimelineEvent[]
  >();

const notes =
  new Map<
    string,
    OrganizationInternalNote[]
  >();

const reviews =
  new Map<
    string,
    OrganizationDetails['review']
  >();

for (const org of organizations) {
  const reviewReady =
    ![
      'NOT_REVIEWED',
      'REJECTED',
    ].includes(
      org.verificationStatus,
    );

  const checklist = [
    {
      key:
        'identity',

      label:
        'بيانات الجهة متطابقة',

      passed:
        reviewReady,
    },

    {
      key:
        'documents',

      label:
        'المستندات المطلوبة معتمدة',

      passed:
        org.documents
          .filter(
            (
              document,
            ) =>
              document.required,
          )
          .every(
            (
              document,
            ) =>
              document.status ===
              'VERIFIED',
          ) &&
        [
          'LICENSE',
          'REGISTRATION',
          'REPRESENTATIVE_ID',
          'ADDRESS_PROOF',
        ].every(
          (type) =>
            org.documents.some(
              (
                document,
              ) =>
                document.type ===
                  type &&
                document.status ===
                  'VERIFIED',
            ),
        ),
    },

    {
      key:
        'contact',

      label:
        'تم التحقق من ممثل الجمعية',

      passed:
        reviewReady,
    },
  ];

  reviews.set(
    org.id,
    {
      checklist,

      reviewer:
        org.verificationStatus ===
        'NOT_REVIEWED'
          ? undefined
          : {
              id:
                'ADM-004',

              name:
                'هبة منصور',
            },

      startedAt:
        org.verificationStatus ===
        'NOT_REVIEWED'
          ? undefined
          : org.updatedAt,

      rejectionReason:
        org.verificationStatus ===
        'REJECTED'
          ? 'تعذر التحقق من الجهة'
          : undefined,

      requestedItems:
        org.verificationStatus ===
        'MORE_INFO_REQUIRED'
          ? [
              'نسخة واضحة من الترخيص',
              'تحديث بيانات الممثل',
            ]
          : undefined,

      adminMessage:
        org.verificationStatus ===
        'MORE_INFO_REQUIRED'
          ? 'يرجى استكمال المستندات المطلوبة قبل متابعة الاعتماد.'
          : undefined,
    },
  );

  const events: OrganizationTimelineEvent[] =
    [
      {
        id:
          `${org.id}-created`,

        action:
          'تم إنشاء طلب انضمام الجمعية',

        actor:
          org.primaryContact.name,

        timestamp:
          org.createdAt,

        tone:
          'info',
      },
    ];

  if (
    org.verificationStatus !==
    'NOT_REVIEWED'
  ) {
    events.unshift({
      id:
        `${org.id}-review`,

      action:
        'بدأت مراجعة الجمعية',

      actor:
        'فريق التحقق',

      timestamp:
        org.updatedAt,

      tone:
        'pending',
    });
  }

  if (
    org.verificationStatus ===
    'VERIFIED'
  ) {
    events.unshift({
      id:
        `${org.id}-verified`,

      action:
        'تم اعتماد الجمعية',

      actor:
        'فريق التحقق',

      timestamp:
        org.updatedAt,

      tone:
        'success',
    });
  }

  if (
    org.status ===
    'SUSPENDED'
  ) {
    events.unshift({
      id:
        `${org.id}-suspended`,

      action:
        'تم تعليق حساب الجمعية',

      actor:
        'إدارة النظام',

      timestamp:
        org.updatedAt,

      tone:
        'critical',
    });
  }

  timelines.set(
    org.id,
    events,
  );

  notes.set(
    org.id,
    [],
  );
}

function updateOrg(
  id: string,
  fn: (
    org: Organization,
  ) => Organization,
) {
  const index =
    organizations.findIndex(
      (organization) =>
        organization.id ===
        id,
    );

  if (index < 0) {
    throw new Error(
      'ORGANIZATION_NOT_FOUND',
    );
  }

  const next =
    fn(
      organizations[
        index
      ]!,
    );

  organizations =
    organizations.map(
      (
        organization,
        currentIndex,
      ) =>
        currentIndex ===
        index
          ? next
          : organization,
    );

  const fixture =
    organizationFixtures.find(
      (
        organization,
      ) =>
        organization.id ===
        id,
    );

  if (fixture) {
    Object.assign(
      fixture,
      clone(next),
    );
  }

  return next;
}

function addEvent(
  id: string,
  event: Omit<
    OrganizationTimelineEvent,
    'id' | 'timestamp'
  >,
) {
  timelines.set(
    id,
    [
      {
        ...event,

        id:
          `${id}-event-${Date.now()}`,

        timestamp:
          new Date().toISOString(),
      },

      ...(
        timelines.get(
          id,
        ) ?? []
      ),
    ],
  );
}

async function statsFor(
  id: string,
): Promise<OrganizationStatistics> {
  const [
    reports,
    adoptions,
    ads,
  ] =
    await Promise.all([
      getReports({
        search: '',
        organizationId:
          id,
        page: 1,
        pageSize: 50,
      }),

      getAdoptionRequests({
        search: '',
        organizationId:
          id,
        page: 1,
        pageSize: 50,
      }),

      getAdvertiserAdvertisementSummary(
        'ORGANIZATION',
        id,
      ),
    ]);

  const activeReports =
    reports.items.filter(
      (report) =>
        report.status !==
        'CLOSED',
    );

  const closedReports =
    reports.items.filter(
      (report) =>
        report.status ===
        'CLOSED',
    );

  return {
    /*
     * أبقينا نفس أسماء الحقول مؤقتًا
     * للتوافق مع OrganizationStatistics الحالية.
     *
     * المعنى الآن:
     * activeReports = البلاغات المسندة النشطة
     * completedMissions = البلاغات المغلقة
     */
    activeReports:
      activeReports.length,

    closedReports:
      closedReports.length,

    completionRate:
      reports.total
        ? Math.round(
            (closedReports.length /
              reports.total) *
              100,
          )
        : undefined,

    pendingAdoptionRequests:
      adoptions.items.filter(
        (request) =>
          request.status ===
          'PENDING_REVIEW',
      ).length,

    completedAdoptions:
      adoptions.items.filter(
        (request) =>
          request.status ===
          'ADOPTED',
      ).length,

    rating:
      id ===
      'ORG-001'
        ? 4.8
        : id ===
            'ORG-003'
          ? 4.7
          : 4.5,

    reviewsCount:
      id ===
      'ORG-001'
        ? 126
        : 48,

    activeAdvertisements:
      ads.active,

    pendingAdvertisements:
      ads.pending,

    donationsTotal:
      id ===
      'ORG-001'
        ? 48_500_000
        : 12_800_000,

    donationsThisMonth:
      id ===
      'ORG-001'
        ? 6_100_000
        : 1_700_000,

    recentDonationTransactions:
      id ===
      'ORG-001'
        ? 34
        : 11,

    /*
     * إذا OrganizationStatistics عندك يسمح
     * بحقول إضافية ممكن لاحقًا نضيف:
     *
     * receivedReports
     *
     * حاليًا ما أضفته حتى ما نكسر type.
     */
  };
}

export async function getOrganizations(
  filters: OrganizationFilters,
): Promise<OrganizationListResult> {
  await mockDelay(120);

  let items =
    await Promise.all(
      organizations.map(
        async (
          organization,
        ) => ({
          ...organization,

          statistics:
            await statsFor(
              organization.id,
            ),
        }),
      ),
    );

  const needle =
    filters.search
      .trim()
      .toLocaleLowerCase(
        'ar',
      );

  items =
    items.filter(
      (organization) => {
        const hay =
          `${organization.id} ${organization.name} ${organization.registrationNumber ?? ''} ${organization.licenseNumber ?? ''} ${organization.primaryContact.name} ${organization.phone} ${organization.city ?? ''}`.toLocaleLowerCase(
            'ar',
          );

        if (
          needle &&
          !hay.includes(
            needle,
          )
        ) {
          return false;
        }

        if (
          filters.status &&
          organization.status !==
            filters.status
        ) {
          return false;
        }

        if (
          filters.verificationStatus &&
          organization.verificationStatus !==
            filters.verificationStatus
        ) {
          return false;
        }

        if (
          filters.governorate &&
          organization.governorate !==
            filters.governorate
        ) {
          return false;
        }

        if (
          filters.service &&
          !organization.services.some(
            (service) =>
              service.key ===
              filters.service,
          )
        ) {
          return false;
        }

        /*
         * أبقينا فلتر البلاغات النشطة activeReports
         * مؤقتًا للتوافق.
         * المعنى الآن: لديها بلاغات نشطة.
         */
        if (
          filters.activeReports ===
            'YES' &&
          !organization.statistics
            ?.activeReports
        ) {
          return false;
        }

        if (
          filters.activeReports ===
            'NO' &&
          (
            organization
              .statistics
              ?.activeReports ??
            0
          ) > 0
        ) {
          return false;
        }

        if (
          filters.dateFrom &&
          new Date(
            organization.createdAt,
          ) <
            new Date(
              `${filters.dateFrom}T00:00:00`,
            )
        ) {
          return false;
        }

        if (
          filters.dateTo &&
          new Date(
            organization.createdAt,
          ) >
            new Date(
              `${filters.dateTo}T23:59:59`,
            )
        ) {
          return false;
        }

        return true;
      },
    );

  items.sort(
    (
      first,
      second,
    ) =>
      filters.sortBy ===
      'name'
        ? first.name.localeCompare(
            second.name,
            'ar',
          )
        : filters.sortBy ===
            'status'
          ? first.status.localeCompare(
              second.status,
            )
          : new Date(
                second.updatedAt,
              ).getTime() -
            new Date(
              first.updatedAt,
            ).getTime(),
  );

  if (
    filters.sortDirection ===
    'asc'
  ) {
    items.reverse();
  }

  const total =
    items.length;

  const pageCount =
    Math.max(
      1,
      Math.ceil(
        total /
          filters.pageSize,
      ),
    );

  const page =
    Math.min(
      filters.page,
      pageCount,
    );

  return {
    items:
      clone(
        items.slice(
          (page - 1) *
            filters.pageSize,

          page *
            filters.pageSize,
        ),
      ),

    total,

    page,

    pageSize:
      filters.pageSize,

    pageCount,
  };
}

export async function getOrganizationSummary(): Promise<OrganizationSummary> {
  await mockDelay(70);

  const enriched =
    await Promise.all(
      organizations.map(
        async (
          organization,
        ) => ({
          organization,

          statistics:
            await statsFor(
              organization.id,
            ),
        }),
      ),
    );

  return {
    total:
      organizations.length,

    pendingVerification:
      organizations.filter(
        (organization) =>
          organization.status ===
          'PENDING_VERIFICATION',
      ).length,

    active:
      organizations.filter(
        (organization) =>
          organization.status ===
          'ACTIVE',
      ).length,

    suspended:
      organizations.filter(
        (organization) =>
          organization.status ===
          'SUSPENDED',
      ).length,

    /*
     * الاسم قديم، المعنى صار:
     * جمعيات لديها بلاغات نشطة.
     */
    withActiveReports:
      enriched.filter(
        ({
          statistics,
        }) =>
          statistics.activeReports >
          0,
      ).length,
  };
}

export async function getOrganizationById(
  id: string,
): Promise<
  OrganizationDetails | null
> {
  await mockDelay(100);

  const org =
    organizations.find(
      (
        organization,
      ) =>
        organization.id ===
        id,
    );

  if (!org) {
    return null;
  }

  const [
    statistics,
    reports,
    adoptions,
  ] =
    await Promise.all([
      statsFor(id),

      getReports({
        search: '',
        organizationId:
          id,
        page: 1,
        pageSize: 5,
      }),

      getAdoptionRequests({
        search: '',
        organizationId:
          id,
        page: 1,
        pageSize: 5,
      }),
    ]);

  return clone({
    organization: {
      ...org,
      statistics,
    },

    review:
      reviews.get(id) ?? {
        checklist: [],
      },

    timeline:
      timelines.get(id) ??
      [],

    notes:
      notes.get(id) ?? [],

    /*
     * البلاغات الأخيرة المسندة إلى الجمعية.
     */
    recentReports:
      reports.items.map(
        (report) => ({
          id:
            report.id,

          status:
            report.status,

          updatedAt:
            report.updatedAt,
        }),
      ),
    recentAdoptions:
      adoptions.items.map(
        (request) => ({
          id:
            request.id,

          status:
            request.status,

          applicantName:
            request.animal.name ?? request.animal.id,

          animalId:
            request.animal.id,
        }),
      ),
  });
}

export async function getAssignableOrganizations(
  search = '',
) {
  await mockDelay(45);

  const needle =
    search
      .trim()
      .toLocaleLowerCase(
        'ar',
      );

  return Promise.all(
    organizations
      .filter(
        (organization) =>
          organization.status ===
            'ACTIVE' &&
          organization.verificationStatus ===
            'VERIFIED' &&
          (
            !needle ||
            organization.name
              .toLocaleLowerCase(
                'ar',
              )
              .includes(
                needle,
              )
          ),
      )
      .map(
        async (
          organization,
        ) => {
          const statistics =
            await statsFor(
              organization.id,
            );

          const activeCases =
            statistics.activeReports;

          return {
            id:
              organization.id,

            name:
              organization.name,

            governorate:
              organization.governorate,

            /*
             * عدد البلاغات النشطة المسندة إلى الجمعية.
             */
            activeReports:
              activeCases,

            availability:
              activeCases >=
              5
                ? (
                    'LIMITED' as const
                  )
                : (
                    'AVAILABLE' as const
                  ),

            distanceKm:
              undefined,
          };
        },
      ),
  );
}

export async function startOrganizationReview(
  id: string,
  actor: AdminSession,
) {
  await mockDelay(80);

  const org =
    organizations.find(
      (
        organization,
      ) =>
        organization.id ===
        id,
    );

  if (!org) {
    throw new Error(
      'ORGANIZATION_NOT_FOUND',
    );
  }

  if (
    org.verificationStatus !==
    'NOT_REVIEWED'
  ) {
    throw new Error(
      'INVALID_VERIFICATION_TRANSITION',
    );
  }

  const timestamp =
    new Date().toISOString();

  const next =
    updateOrg(
      id,
      (
        organization,
      ) => ({
        ...organization,

        verificationStatus:
          'IN_REVIEW',

        updatedAt:
          timestamp,
      }),
    );

  const currentReview =
    reviews.get(id) ?? {
      checklist: [],
    };

  reviews.set(
    id,
    {
      ...currentReview,

      reviewer: {
        id:
          actor.id,

        name:
          actor.name,
      },

      startedAt:
        timestamp,

      checklist:
        currentReview.checklist.map(
          (
            checklistItem,
          ) =>
            checklistItem.key ===
              'identity' ||
            checklistItem.key ===
              'contact'
              ? {
                  ...checklistItem,
                  passed:
                    true,
                }
              : checklistItem,
        ),
    },
  );

  addEvent(
    id,
    {
      action:
        'بدأت مراجعة الجمعية',

      actor:
        actor.name,

      tone:
        'pending',
    },
  );

  recordAdminAuditEvent(
    actor,
    {
      action:
        'ORGANIZATION_REVIEW_STARTED',

      resource: {
        type:
          'ORGANIZATION',

        id,

        label:
          next.name,
      },

      previousValue: {
        verificationStatus:
          'NOT_REVIEWED',
      },

      newValue: {
        verificationStatus:
          'IN_REVIEW',
      },

      metadata: {
        source:
          'ملف الجمعية',
      },
    },
  );

  return clone(next);
}

export async function reviewOrganizationDocument(
  id: string,
  documentId: string,
  input: ReviewDocumentInput,
  actor: AdminSession,
) {
  await mockDelay(80);

  const timestamp =
    new Date().toISOString();

  const next =
    updateOrg(
      id,
      (
        organization,
      ) => ({
        ...organization,

        documents:
          organization.documents.map(
            (
              document,
            ) =>
              document.id ===
              documentId
                ? {
                    ...document,

                    status:
                      input.decision ===
                      'APPROVE'
                        ? 'VERIFIED'
                        : 'REJECTED',

                    reviewedAt:
                      timestamp,

                    rejectionReason:
                      input.decision ===
                      'REJECT'
                        ? input.reason
                        : undefined,
                  }
                : document,
          ),

        updatedAt:
          timestamp,
      }),
    );

  const requiredTypes =
    [
      'LICENSE',
      'REGISTRATION',
      'REPRESENTATIVE_ID',
      'ADDRESS_PROOF',
    ] as const;

  const documentsReady =
    requiredTypes.every(
      (type) =>
        next.documents.some(
          (
            document,
          ) =>
            document.type ===
              type &&
            document.status ===
              'VERIFIED',
        ),
    );

  const review =
    reviews.get(id) ?? {
      checklist: [],
    };

  reviews.set(
    id,
    {
      ...review,

      checklist:
        review.checklist.map(
          (
            checklistItem,
          ) =>
            checklistItem.key ===
            'documents'
              ? {
                  ...checklistItem,

                  passed:
                    documentsReady,
                }
              : checklistItem,
        ),
    },
  );

  addEvent(
    id,
    {
      action:
        input.decision ===
        'APPROVE'
          ? 'تم اعتماد مستند'
          : 'تم رفض مستند',

      actor:
        actor.name,

      details:
        input.reason,

      tone:
        input.decision ===
        'APPROVE'
          ? 'success'
          : 'critical',
    },
  );

  return clone(next);
}

export async function requestOrganizationInfo(
  id: string,
  input: RequestInfoInput,
  actor: AdminSession,
) {
  await mockDelay(90);

  const timestamp =
    new Date().toISOString();

  const next =
    updateOrg(
      id,
      (
        organization,
      ) => ({
        ...organization,

        verificationStatus:
          'MORE_INFO_REQUIRED',

        updatedAt:
          timestamp,
      }),
    );

  reviews.set(
    id,
    {
      ...(
        reviews.get(
          id,
        ) ?? {
          checklist: [],
        }
      ),

      requestedItems:
        input.requestedItems,

      adminMessage:
        input.message,

      deadline:
        input.deadline,
    },
  );

  addEvent(
    id,
    {
      action:
        'تم طلب معلومات إضافية',

      actor:
        actor.name,

      details:
        input.message,

      tone:
        'pending',
    },
  );

  return clone(next);
}

export async function approveOrganization(
  id: string,
  actor: AdminSession,
) {
  await mockDelay(100);

  const org =
    organizations.find(
      (
        organization,
      ) =>
        organization.id ===
        id,
    );

  if (!org) {
    throw new Error(
      'ORGANIZATION_NOT_FOUND',
    );
  }

  if (
    ![
      'IN_REVIEW',
      'MORE_INFO_REQUIRED',
    ].includes(
      org.verificationStatus,
    )
  ) {
    throw new Error(
      'INVALID_VERIFICATION_TRANSITION',
    );
  }

  const requiredTypes =
    [
      'LICENSE',
      'REGISTRATION',
      'REPRESENTATIVE_ID',
      'ADDRESS_PROOF',
    ] as const;

  if (
    requiredTypes.some(
      (type) =>
        !org.documents.some(
          (
            document,
          ) =>
            document.type ===
              type &&
            document.status ===
              'VERIFIED',
        ),
    ) ||
    org.documents.some(
      (
        document,
      ) =>
        document.required &&
        document.status !==
          'VERIFIED',
    )
  ) {
    throw new Error(
      'DOCUMENTS_UNRESOLVED',
    );
  }

  const review =
    reviews.get(id);

  if (
    review?.checklist.some(
      (
        checklistItem,
      ) =>
        !checklistItem.passed,
    )
  ) {
    throw new Error(
      'CHECKLIST_UNRESOLVED',
    );
  }

  const timestamp =
    new Date().toISOString();

  const next =
    updateOrg(
      id,
      (
        organization,
      ) => ({
        ...organization,

        status:
          'ACTIVE',

        verificationStatus:
          'VERIFIED',

        updatedAt:
          timestamp,
      }),
    );

  addEvent(
    id,
    {
      action:
        'تم اعتماد الجمعية',

      actor:
        actor.name,

      tone:
        'success',
    },
  );

  recordAdminAuditEvent(
    actor,
    {
      action:
        'ORGANIZATION_APPROVED',

      resource: {
        type:
          'ORGANIZATION',

        id,

        label:
          next.name,
      },

      previousValue: {
        status:
          org.status,

        verificationStatus:
          org.verificationStatus,
      },

      newValue: {
        status:
          'ACTIVE',

        verificationStatus:
          'VERIFIED',
      },

      metadata: {
        source:
          'ملف الجمعية',
      },
    },
  );

  return clone(next);
}

export async function rejectOrganization(
  id: string,
  input: RejectOrganizationInput,
  actor: AdminSession,
) {
  await mockDelay(90);

  const reason =
    input.reason ===
    'سبب آخر'
      ? input.otherReason ??
        input.reason
      : input.reason;

  const timestamp =
    new Date().toISOString();

  const next =
    updateOrg(
      id,
      (
        organization,
      ) => ({
        ...organization,

        status:
          'REJECTED',

        verificationStatus:
          'REJECTED',

        updatedAt:
          timestamp,
      }),
    );

  const review =
    reviews.get(id) ?? {
      checklist: [],
    };

  reviews.set(
    id,
    {
      ...review,

      rejectionReason:
        reason,
    },
  );

  addEvent(
    id,
    {
      action:
        'تم رفض طلب الجمعية',

      actor:
        actor.name,

      details:
        reason,

      tone:
        'critical',
    },
  );

  recordAdminAuditEvent(
    actor,
    {
      action:
        'ORGANIZATION_REJECTED',

      resource: {
        type:
          'ORGANIZATION',

        id,

        label:
          next.name,
      },

      reason,

      newValue: {
        status:
          'REJECTED',

        verificationStatus:
          'REJECTED',
      },

      metadata: {
        source:
          'ملف الجمعية',
      },
    },
  );

  return clone(next);
}

export async function suspendOrganization(
  id: string,
  input: SuspendOrganizationInput,
  actor: AdminSession,
) {
  await mockDelay(100);

  const current =
    await getOrganizationById(
      id,
    );

  if (!current) {
    throw new Error(
      'ORGANIZATION_NOT_FOUND',
    );
  }

  if (
    current.organization.status !==
    'ACTIVE'
  ) {
    throw new Error(
      'ORGANIZATION_NOT_ACTIVE',
    );
  }

  /*
   * ما عاد في Rescue Missions.
   * هذا العدد صار عدد البلاغات النشطة المسندة للجمعية.
   */
  if (
    (
      current.organization
        .statistics
        ?.activeReports ??
      0
    ) > 0 &&
    !input.acknowledgeActiveReports
  ) {
    throw new Error(
      'ACTIVE_REPORTS_ACK_REQUIRED',
    );
  }

  const reason =
    input.reason ===
    'سبب آخر'
      ? input.otherReason ??
        input.reason
      : input.reason;

  const timestamp =
    new Date().toISOString();

  const next =
    updateOrg(
      id,
      (
        organization,
      ) => ({
        ...organization,

        status:
          'SUSPENDED',

        updatedAt:
          timestamp,
      }),
    );

  addEvent(
    id,
    {
      action:
        'تم تعليق حساب الجمعية',

      actor:
        actor.name,

      details:
        [
          reason,
          input.note,
        ]
          .filter(Boolean)
          .join(' — '),

      tone:
        'critical',
    },
  );

  recordAdminAuditEvent(
    actor,
    {
      action:
        'ORGANIZATION_SUSPENDED',

      resource: {
        type:
          'ORGANIZATION',

        id,

        label:
          next.name,
      },

      reason,

      previousValue: {
        status:
          'ACTIVE',
      },

      newValue: {
        status:
          'SUSPENDED',
      },

      metadata: {
        source:
          'ملف الجمعية',
      },
    },
  );

  return clone(next);
}

export async function reactivateOrganization(
  id: string,
  note: string | undefined,
  actor: AdminSession,
) {
  await mockDelay(90);

  const org =
    organizations.find(
      (
        organization,
      ) =>
        organization.id ===
        id,
    );

  if (
    !org ||
    org.status !==
      'SUSPENDED'
  ) {
    throw new Error(
      'INVALID_REACTIVATION',
    );
  }

  const timestamp =
    new Date().toISOString();

  const next =
    updateOrg(
      id,
      (
        organization,
      ) => ({
        ...organization,

        status:
          'ACTIVE',

        updatedAt:
          timestamp,
      }),
    );

  addEvent(
    id,
    {
      action:
        'تمت إعادة تفعيل الجمعية',

      actor:
        actor.name,

      details:
        note,

      tone:
        'success',
    },
  );

  recordAdminAuditEvent(
    actor,
    {
      action:
        'ORGANIZATION_REACTIVATED',

      resource: {
        type:
          'ORGANIZATION',

        id,

        label:
          next.name,
      },

      reason:
        note,

      previousValue: {
        status:
          'SUSPENDED',
      },

      newValue: {
        status:
          'ACTIVE',
      },

      metadata: {
        source:
          'ملف الجمعية',
      },
    },
  );

  return clone(next);
}

export async function addOrganizationNote(
  id: string,
  note: string,
  actor: AdminSession,
) {
  await mockDelay(70);

  if (
    !organizations.some(
      (
        organization,
      ) =>
        organization.id ===
        id,
    )
  ) {
    throw new Error(
      'ORGANIZATION_NOT_FOUND',
    );
  }

  const created = {
    id:
      `${id}-note-${Date.now()}`,

    adminName:
      actor.name,

    adminRole:
      actor.roleLabel,

    createdAt:
      new Date().toISOString(),

    note,
  };

  notes.set(
    id,
    [
      created,

      ...(
        notes.get(
          id,
        ) ?? []
      ),
    ],
  );

  addEvent(
    id,
    {
      action:
        'أضيفت ملاحظة داخلية',

      actor:
        actor.name,

      tone:
        'neutral',
    },
  );

  return clone(created);
}

export async function getOrganizationDashboardSnapshot() {
  await mockDelay(40);

  return {
    pending:
      organizations.filter(
        (
          organization,
        ) =>
          organization.status ===
          'PENDING_VERIFICATION',
      ).length,

    active:
      organizations.filter(
        (
          organization,
        ) =>
          organization.status ===
          'ACTIVE',
      ).length,
  };
}