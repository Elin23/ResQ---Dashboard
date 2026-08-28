import { recordAdminAuditEvent } from '@/features/audit-log/services/audit-log.mock';
import type { AdminSession } from '@/features/auth/session';
import { mockDelay } from '@/services/mock/delay';
import type { Article, AwarenessContent, ContentListFilters, ContentListResult, ContentStatus, EditorialEvent, EditorialInput, EditorialNote, EditorialRecord, FaqItem, SuccessStory } from '../types';
import { normalizeTags } from '../utils';

const now = Date.now();

const days = (offset: number) =>
  new Date(now + offset * 86_400_000).toISOString();

const hours = (offset: number) =>
  new Date(now + offset * 3_600_000).toISOString();

const author = {
  id: 'mock-admin-001',
  name: 'أحمد الخطيب',
};

const articles: Article[] = [
  {
    id: 'ART-2026-0041',
    title: 'كيف تعتني بحيوان مصاب حتى وصول المساعدة؟',
    slug: 'care-for-injured-animal',
    excerpt: 'خطوات آمنة وبسيطة للمساعدة الأولية دون تعريض الحيوان أو نفسك للخطر.',
    content: 'حافظ على مسافة آمنة وراقب تنفس الحيوان وحركته. لا تحاول إعطاء أدوية بشرية. جهّز وصفًا واضحًا للموقع والحالة، واتبع تعليمات فريق الإنقاذ حتى وصول المساعدة.',
    coverAltText: 'كلب يتلقى رعاية هادئة',
    category: 'ANIMAL_CARE',
    tags: ['رعاية', 'إنقاذ', 'سلامة'],
    status: 'PUBLISHED',
    author,
    publishedAt: days(-18),
    createdAt: days(-24),
    updatedAt: days(-18),
  },
  {
    id: 'ART-2026-0042',
    title: 'أهمية التعقيم في تحسين حياة الحيوانات',
    slug: 'importance-of-sterilization',
    excerpt: 'شرح مبسط لدور التعقيم في الصحة والرفق بالحيوان وإدارة أعداد الحيوانات.',
    content: 'التعقيم قرار صحي وإداري يحتاج تقييمًا بيطريًا للحالة الفردية. يساعد في تقليل بعض المخاطر وتحسين إدارة أعداد الحيوانات، مع ضرورة الالتزام بتعليمات الطبيب قبل الإجراء وبعده.',
    category: 'HEALTH',
    tags: ['تعقيم', 'صحة'],
    status: 'DRAFT',
    author,
    createdAt: days(-4),
    updatedAt: hours(-5),
  },
  {
    id: 'ART-2026-0043',
    title: 'دليل التغذية الآمنة للقطط المنقذة',
    slug: 'safe-nutrition-rescued-cats',
    excerpt: 'مبادئ تقديم الطعام والماء تدريجيًا للقطط التي وصلت حديثًا إلى الرعاية.',
    content: 'ابدأ بكميات صغيرة ومياه نظيفة وراقب أي علامات عدم تحمل. يجب أن تحدد جهة الرعاية أو الجمعية الخطة المناسبة للحالات الضعيفة أو التي تحتاج علاجًا خاصًا.',
    category: 'NUTRITION',
    tags: ['تغذية', 'قطط'],
    status: 'IN_REVIEW',
    author,
    createdAt: days(-7),
    updatedAt: hours(-9),
  },
  {
    id: 'ART-2026-0044',
    title: 'سلامة الحيوانات خلال موجات الحر',
    slug: 'animals-heatwave-safety',
    excerpt: 'إرشادات توعوية حول الماء والظل ومؤشرات الإجهاد الحراري التي تتطلب تدخلًا.',
    content: 'وفّر ماءً نظيفًا وظلًا مستمرًا، وتجنب النشاط في ساعات الذروة. عند ظهور خمول شديد أو تنفس غير طبيعي يجب التواصل مع جهة رعاية مختصة.',
    category: 'SAFETY',
    tags: ['سلامة', 'رعاية'],
    status: 'SCHEDULED',
    author,
    scheduledAt: days(3),
    createdAt: days(-3),
    updatedAt: hours(-3),
  },
  {
    id: 'ART-2026-0045',
    title: 'كيف تستعد لتبني حيوان؟',
    slug: 'prepare-for-adoption',
    excerpt: 'أسئلة عملية تساعد الأسرة على تقييم الوقت والمساحة والالتزام قبل التبني.',
    content: 'التبني التزام طويل الأمد. قيّم وقتك وميزانيتك ومساحة السكن، واتفق مع جميع أفراد المنزل على مسؤوليات الرعاية والمتابعة البيطرية.',
    category: 'ADOPTION',
    tags: ['تبني', 'رعاية'],
    status: 'ARCHIVED',
    author,
    publishedAt: days(-90),
    createdAt: days(-100),
    updatedAt: days(-10),
  },
];

const stories: SuccessStory[] = [
  {
    id: 'ST-2026-0017',
    title: 'من الشارع إلى منزل آمن: قصة لوز',
    slug: 'lawz-safe-home',
    summary: 'رحلة إنقاذ وعلاج وتعافٍ انتهت بانتقال لوز إلى منزل دائم.',
    content: 'بدأت القصة ببلاغ عن كلب مصاب، ثم نُقل عبر مهمة إنقاذ إلى الرعاية. بعد العلاج والتعافي أصبح جاهزًا للتبني، وتمت مطابقة طلب مناسب معه حتى اكتملت عملية التبني.',
    reportId: 'RQ-2026-00481',
    organizationId: 'ORG-001',
    status: 'PUBLISHED',
    author,
    publishedAt: days(-9),
    createdAt: days(-14),
    updatedAt: days(-9),
  },
  {
    id: 'ST-2026-0018',
    title: 'مشمش يعود للحياة الطبيعية',
    slug: 'mishmish-recovery',
    summary: 'قطة صغيرة تجاوزت إصابة صعبة وأصبحت جاهزة لحياة مستقرة.',
    content: 'وصلت مشمش إلى الرعاية بعد تدخل سريع، وخضعت لفحص ومتابعة حتى استقرت حالتها الصحية.',
    reportId: 'RQ-2026-00482',
    organizationId: 'ORG-002',
    status: 'IN_REVIEW',
    author,
    createdAt: days(-5),
    updatedAt: hours(-7),
  },
];

const awareness: AwarenessContent[] = [
  {
    id: 'AWR-2026-0011',
    title: 'التعامل مع الحيوانات المصابة بأمان',
    slug: 'safe-injured-animal-contact',
    summary: 'محتوى توعوي قصير للاستخدام في الواجهة العامة.',
    content: 'لا تقترب بسرعة من حيوان خائف أو مصاب. حافظ على مسافة، أبعد الأطفال والحيوانات الأخرى، وأرسل بلاغًا يتضمن الموقع ووصف الحالة.',
    audience: ['ALL'],
    status: 'PUBLISHED',
    author,
    publishedAt: days(-12),
    createdAt: days(-15),
    updatedAt: days(-12),
  },
  {
    id: 'AWR-2026-0012',
    title: 'أهمية توفير المياه في الصيف',
    slug: 'summer-water-awareness',
    summary: 'تذكير مجتمعي بتوفير مياه نظيفة وآمنة للحيوانات.',
    content: 'يمكن للمياه النظيفة في مكان مظلل أن تقلل مخاطر الجفاف. احرص على تغيير المياه وتنظيف الوعاء بانتظام.',
    audience: ['USERS'],
    status: 'SCHEDULED',
    author,
    scheduledAt: days(2),
    createdAt: days(-2),
    updatedAt: hours(-2),
  },
];

let faqs: FaqItem[] = [
  {
    id: 'FAQ-001',
    question: 'كيف أرسل بلاغًا عن حيوان مصاب؟',
    answer: 'استخدم نموذج البلاغ وأضف الموقع ووصف الحالة وصورًا واضحة إن أمكن.',
    category: 'البلاغات',
    order: 1,
    active: true,
    createdAt: days(-50),
    updatedAt: days(-10),
  },
  {
    id: 'FAQ-002',
    question: 'كيف أتابع طلب التبني؟',
    answer: 'يمكن متابعة حالة الطلب من حسابك، وستظهر أي خطوة تتطلب استكمالًا.',
    category: 'التبني',
    order: 2,
    active: true,
    createdAt: days(-40),
    updatedAt: days(-8),
  },
  {
    id: 'FAQ-003',
    question: 'هل يمكن التبرع بشكل مجهول؟',
    answer: 'نعم عندما يكون هذا الخيار متاحًا في مسار التبرع.',
    category: 'التبرعات',
    order: 3,
    active: false,
    createdAt: days(-35),
    updatedAt: days(-7),
  },
];

const events = new Map<string, EditorialEvent[]>();
const notes = new Map<string, EditorialNote[]>();

const revisions = new Map<
  string,
  Array<{
    id: string;
    contentId: string;
    createdAt: string;
    author: { id: string; name: string };
    summary?: string;
  }>
>();

// Build the first timeline from each mock content record.
for (const item of [...articles, ...stories, ...awareness]) {
  events.set(
    item.id,
    [
      {
        id: `${item.id}-create`,
        title: 'تم إنشاء المسودة',
        actor: item.author.name,
        timestamp: item.createdAt,
        tone: 'info' as const,
      },
      ...(item.publishedAt
        ? [
            {
              id: `${item.id}-publish`,
              title: 'تم نشر المحتوى',
              actor: item.author.name,
              timestamp: item.publishedAt,
              tone: 'success' as const,
            },
          ]
        : []),
      ...(item.scheduledAt
        ? [
            {
              id: `${item.id}-schedule`,
              title: 'تمت جدولة النشر',
              actor: item.author.name,
              timestamp: item.scheduledAt,
              tone: 'pending' as const,
            },
          ]
        : []),
    ].sort(
      (a, b) =>
        +new Date(b.timestamp) -
        +new Date(a.timestamp),
    ),
  );
}

const clone = <T>(value: T): T => structuredClone(value);

const repo = (kind: 'article' | 'story' | 'awareness') =>
  kind === 'article'
    ? articles
    : kind === 'story'
      ? stories
      : awareness;

function filter<
  T extends {
    id: string;
    title: string;
    status: ContentStatus;
    author: { name: string };
    updatedAt: string;
    publishedAt?: string;
    scheduledAt?: string;
  },
>(
  items: T[],
  filters: ContentListFilters,
): ContentListResult<T> {
  const search = filters.search.trim().toLowerCase();

  const all = items.filter((item) => {
    const haystack =
      `${item.id} ${item.title} ${'slug' in item ? item.slug : ''}`
        .toLowerCase();

    if (search && !haystack.includes(search)) {
      return false;
    }

    if (filters.status && item.status !== filters.status) {
      return false;
    }

    if (filters.author && item.author.name !== filters.author) {
      return false;
    }

    const relevantDate =
      item.publishedAt ??
      item.scheduledAt ??
      item.updatedAt;

    if (filters.dateFrom && relevantDate < filters.dateFrom) {
      return false;
    }

    if (
      filters.dateTo &&
      relevantDate > `${filters.dateTo}T23:59:59`
    ) {
      return false;
    }

    return true;
  });

  const start = (filters.page - 1) * filters.pageSize;

  return {
    items: clone(
      all.slice(
        start,
        start + filters.pageSize,
      ),
    ),
    total: all.length,
    page: filters.page,
    pageSize: filters.pageSize,
    pageCount: Math.max(
      1,
      Math.ceil(all.length / filters.pageSize),
    ),
  };
}

export async function getArticles(filters: ContentListFilters) {
  await mockDelay(70);

  let result = filter(articles, filters);

  // Article-only filters are applied after the shared content filtering.
  if (filters.category) {
    result = {
      ...result,
      items: result.items.filter(
        (item) => item.category === filters.category,
      ),
    };
  }

  if (filters.tag) {
    const tag = filters.tag;

    result = {
      ...result,
      items: result.items.filter(
        (item) => item.tags.includes(tag),
      ),
    };
  }

  return result;
}

export async function getStories(filters: ContentListFilters) {
  await mockDelay(70);

  return filter(stories, filters);
}

export async function getAwareness(filters: ContentListFilters) {
  await mockDelay(70);

  return filter(awareness, filters);
}

export async function getContentOverview() {
  await mockDelay(35);

  const metric = (items: Array<{ status: ContentStatus }>) => ({
    total: items.length,
    drafts: items.filter(
      (item) => item.status === 'DRAFT',
    ).length,
    published: items.filter(
      (item) => item.status === 'PUBLISHED',
    ).length,
    scheduled: items.filter(
      (item) => item.status === 'SCHEDULED',
    ).length,
  });

  return {
    articles: metric(articles),
    stories: metric(stories),
    awareness: metric(awareness),
    faq: {
      total: faqs.length,
      drafts: 0,
      published: faqs.filter(
        (item) => item.active,
      ).length,
      scheduled: 0,
    },
  };
}

export async function getEditorialRecord(
  kind: 'article' | 'story' | 'awareness',
  id: string,
): Promise<EditorialRecord<Article | SuccessStory | AwarenessContent> | undefined> {
  await mockDelay(55);

  const item = repo(kind).find(
    (record) => record.id === id,
  );

  if (!item) {
    return undefined;
  }

  return {
    item: clone(item),
    timeline: clone(events.get(id) ?? []),
    notes: clone(notes.get(id) ?? []),
    revisions: clone(revisions.get(id) ?? []),
  };
}

function addEvent(
  id: string,
  title: string,
  actor: AdminSession,
  tone: EditorialEvent['tone'] = 'info',
  details?: string,
) {
  const event = {
    id: `EV-${Date.now()}`,
    title,
    actor: actor.name,
    timestamp: new Date().toISOString(),
    tone,
    details,
  };

  // New timeline events are always shown first.
  events.set(id, [
    event,
    ...(events.get(id) ?? []),
  ]);
}

export async function saveEditorial(
  kind: 'article' | 'story' | 'awareness',
  id: string | undefined,
  input: EditorialInput,
  actor: AdminSession,
  status: ContentStatus = 'DRAFT',
) {
  await mockDelay(80);

  const list = repo(kind);
  const existing = id
    ? list.find((item) => item.id === id)
    : undefined;

  // Slugs must stay unique inside each content type.
  if (
    list.some(
      (item) =>
        item.slug === input.slug &&
        item.id !== id,
    )
  ) {
    throw new Error('SLUG_EXISTS');
  }

  const timestamp = new Date().toISOString();

  const newId =
    id ??
    `${
      kind === 'article'
        ? 'ART'
        : kind === 'story'
          ? 'ST'
          : 'AWR'
    }-2026-${String(list.length + 50).padStart(4, '0')}`;

  const common = {
    id: newId,
    title: input.title,
    slug: input.slug,
    content: input.content,
    status,
    author: {
      id: actor.id,
      name: actor.name,
    },
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
    publishedAt:
      status === 'PUBLISHED'
        ? timestamp
        : undefined,
    scheduledAt:
      status === 'SCHEDULED'
        ? new Date(
            input.scheduledAt ?? timestamp,
          ).toISOString()
        : undefined,
  };

  let next:
    | Article
    | SuccessStory
    | AwarenessContent;

  if (kind === 'article') {
    next = {
      ...common,
      excerpt: input.summary,
      category: input.category ?? 'OTHER',
      tags: normalizeTags(input.tags),
      coverImageUrl: input.coverImageUrl || undefined,
      coverAltText: input.coverAltText,
      seo: {
        metaTitle: input.metaTitle,
        metaDescription: input.metaDescription,
      },
    };
  } else if (kind === 'story') {
    next = {
      ...common,
      summary: input.summary,
      coverImageUrl: input.coverImageUrl || undefined,
      coverAltText: input.coverAltText,
      reportId: input.reportId,
      organizationId: input.organizationId,
    };
  } else {
    next = {
      ...common,
      summary: input.summary,
      coverImageUrl: input.coverImageUrl || undefined,
      coverAltText: input.coverAltText,
      audience: input.audience ?? ['ALL'],
    };
  }

  if (existing) {
    Object.assign(existing, next);
  } else if (kind === 'article') {
    articles.unshift(next as Article);
  } else if (kind === 'story') {
    stories.unshift(next as SuccessStory);
  } else {
    awareness.unshift(next as AwarenessContent);
  }

  // Keep a small revision history for the editorial details page.
  revisions.set(newId, [
    {
      id: `REV-${Date.now()}`,
      contentId: newId,
      createdAt: timestamp,
      author: {
        id: actor.id,
        name: actor.name,
      },
      summary: existing
        ? 'تحديث المحتوى'
        : 'إنشاء المسودة',
    },
    ...(revisions.get(newId) ?? []),
  ]);

  addEvent(
    newId,
    status === 'PUBLISHED'
      ? 'تم نشر المحتوى'
      : status === 'SCHEDULED'
        ? 'تمت جدولة النشر'
        : status === 'IN_REVIEW'
          ? 'تم إرسال المحتوى للمراجعة'
          : 'تم حفظ المسودة',
    actor,
    status === 'PUBLISHED'
      ? 'success'
      : status === 'SCHEDULED'
        ? 'pending'
        : 'info',
  );

  return clone(next);
}

export async function changeContentStatus(
  kind: 'article' | 'story' | 'awareness',
  id: string,
  status: ContentStatus,
  actor: AdminSession,
  scheduledAt?: string,
) {
  const record = await getEditorialRecord(kind, id);

  if (!record) {
    throw new Error('NOT_FOUND');
  }

  const item = repo(kind).find(
    (recordItem) => recordItem.id === id,
  );

  if (!item) {
    throw new Error('NOT_FOUND');
  }

  const previousStatus = item.status;
  const timestamp = new Date().toISOString();

  item.status = status;
  item.updatedAt = timestamp;

  if (status === 'PUBLISHED') {
    item.publishedAt = timestamp;
  }

  if (status === 'SCHEDULED') {
    item.scheduledAt = scheduledAt;
  }

  addEvent(
    id,
    status === 'ARCHIVED'
      ? 'تمت أرشفة المحتوى'
      : status === 'DRAFT'
        ? 'تمت إعادة المحتوى إلى مسودة'
        : status === 'IN_REVIEW'
          ? 'تم إرسال المحتوى للمراجعة'
          : status === 'PUBLISHED'
            ? 'تم نشر المحتوى'
            : 'تمت جدولة النشر',
    actor,
    status === 'PUBLISHED'
      ? 'success'
      : status === 'ARCHIVED'
        ? 'neutral'
        : 'info',
  );

  // Publishing and archiving are important enough to appear in the admin audit log.
  if (
    status === 'PUBLISHED' ||
    status === 'ARCHIVED'
  ) {
    recordAdminAuditEvent(actor, {
      action:
        status === 'PUBLISHED'
          ? 'CONTENT_PUBLISHED'
          : 'CONTENT_ARCHIVED',
      resource: {
        type: 'CONTENT',
        id,
        label: item.title,
      },
      previousValue: {
        status: previousStatus,
      },
      newValue: {
        status,
      },
      metadata: {
        source: 'نظام إدارة المحتوى',
      },
    });
  }

  return clone(item);
}

export async function addEditorialNote(
  id: string,
  note: string,
  actor: AdminSession,
) {
  await mockDelay(40);

  const item = {
    id: `NOTE-${Date.now()}`,
    adminName: actor.name,
    createdAt: new Date().toISOString(),
    note,
  };

  notes.set(id, [
    item,
    ...(notes.get(id) ?? []),
  ]);

  return clone(item);
}

export async function getFaqItems() {
  await mockDelay(40);

  return clone(
    [...faqs].sort(
      (a, b) => a.order - b.order,
    ),
  );
}

export async function saveFaq(input: { id?: string; question: string; answer: string; category: string }) {
  await mockDelay(45);

  const timestamp = new Date().toISOString();

  if (input.id) {
    const item = faqs.find(
      (faq) => faq.id === input.id,
    );

    if (!item) {
      throw new Error('NOT_FOUND');
    }

    Object.assign(item, input, {
      updatedAt: timestamp,
    });

    return clone(item);
  }

  const item: FaqItem = {
    id: `FAQ-${String(faqs.length + 1).padStart(3, '0')}`,
    question: input.question,
    answer: input.answer,
    category: input.category,
    order: faqs.length + 1,
    active: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  faqs = [...faqs, item];

  return clone(item);
}

export async function toggleFaq(
  id: string,
  active: boolean,
) {
  await mockDelay(35);

  const item = faqs.find(
    (faq) => faq.id === id,
  );

  if (!item) {
    throw new Error('NOT_FOUND');
  }

  item.active = active;
  item.updatedAt = new Date().toISOString();

  return clone(item);
}

export async function moveFaq(
  id: string,
  direction: 'up' | 'down',
) {
  await mockDelay(35);

  const ordered = [...faqs].sort(
    (a, b) => a.order - b.order,
  );

  const currentIndex = ordered.findIndex(
    (item) => item.id === id,
  );

  const targetIndex =
    direction === 'up'
      ? currentIndex - 1
      : currentIndex + 1;

  if (
    currentIndex < 0 ||
    targetIndex < 0 ||
    targetIndex >= ordered.length
  ) {
    return clone(ordered);
  }

  // Swap the two items and rebuild their display order.
  [ordered[currentIndex], ordered[targetIndex]] = [
    ordered[targetIndex]!,
    ordered[currentIndex]!,
  ];

  ordered.forEach((item, index) => {
    item.order = index + 1;
  });

  faqs = ordered;

  return clone(faqs);
}