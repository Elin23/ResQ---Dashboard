import { mockDelay } from '@/services/mock/delay';
import { organizationFixtures } from '@/features/organizations/services/organization-fixtures';
import { recordAdminAuditEvent } from '@/features/audit-log/services/audit-log.mock';
import type { AdminSession } from '@/features/auth/session';
import type { AdminStatusOverrideInput, DeleteReportInput, EligibleOrganization, Report, ReportDetails, ReportFilters, ReportListResult, ReportNote, ReportSummary, ReportTimelineEvent } from '../types';
import { isTodayIso } from '../utils';

const now = Date.now();
const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000).toISOString();
const daysAgo = (days: number, extraMinutes = 0) => minutesAgo(days * 1440 + extraMinutes);
const media = (id: string, animal: 'dog' | 'cat' | 'bird', count = 2) => Array.from({ length: count }, (_, index) => ({
  id: `${id}-media-${index + 1}`,
  type: 'IMAGE' as const,
  url: `https://images.unsplash.com/photo-${animal === 'dog' ? ['1552053831-71594a27632d','1583337130417-3346a1be7dee','1537151608828-ea2b11777ee8'][index % 3] : animal === 'cat' ? ['1573865526739-10659fec78a5','1592194996308-7b43878e84a6','1518791841217-8f162f1e1131'][index % 3] : ['1444464666168-49d633b86797','1452570053594-1b985d6ea890','1552728089-57bdde30beb3'][index % 3]}?auto=format&fit=crop&w=1200&q=80`,
  thumbnailUrl: undefined,
  createdAt: minutesAgo(60 + index * 3),
}));

const seeds: Array<Omit<Report, 'createdAt' | 'updatedAt' | 'media'> & { createdMinutes: number; updatedMinutes?: number; mediaAnimal: 'dog' | 'cat' | 'bird'; mediaCount?: number }> = [
  { id:'RQ-2026-00481', status:'EN_ROUTE', severity:'CRITICAL', animalType:'DOG', animalDescription:'كلب بالغ مصاب في الطرف الخلفي', title:'كلب مصاب بحادث سير', description:'كلب على جانب الطريق بعد حادث سير ويبدو غير قادر على الوقوف. يوجد نزف ظاهر ويحتاج إلى تدخل سريع.', governorate:'دمشق', city:'المزة', address:'أوتستراد المزة قرب دوار الجمارك', latitude:33.4984, longitude:36.2477, reporter:{id:'USR-1021',name:'ليان المصري',phone:'+963 944 218 603',email:'layan@example.com',isGuest:false}, internalNotesCount:1, createdMinutes:14, mediaAnimal:'dog', mediaCount:3 },
  { id:'RQ-2026-00482', status:'EN_ROUTE', severity:'HIGH', animalType:'CAT', animalDescription:'قطة صغيرة عالقة على سطح', title:'قطة عالقة على سطح مبنى', description:'القطة موجودة على سطح مبنى مرتفع منذ ساعات ولا يمكن للسكان الوصول إليها بأمان.', governorate:'حلب', city:'الفرقان', address:'شارع تشرين قرب حديقة الفرقان', latitude:36.2111, longitude:37.1215, reporter:{id:'GUEST-82',name:'رامي بركات',phone:'+963 933 771 124',isGuest:true}, internalNotesCount:0, createdMinutes:27, updatedMinutes:19, mediaAnimal:'cat', mediaCount:2 },
  { id:'RQ-2026-00483', status:'EN_ROUTE', severity:'MEDIUM', animalType:'DOG', animalDescription:'كلب ضال مع جرح واضح في القدم', title:'كلب ضال يعاني من جرح في القدم', description:'الكلب هادئ ويمكن الاقتراب منه، الجرح يبدو قديمًا ويحتاج إلى فحص بيطري.', governorate:'حمص', city:'الإنشاءات', address:'شارع الحضارة مقابل المركز الثقافي', latitude:34.7231, longitude:36.6954, reporter:{id:'USR-1098',name:'نور حداد',phone:'+963 955 142 210',email:'nour.h@example.com',isGuest:false}, verifiedAt:minutesAgo(41), internalNotesCount:2, createdMinutes:53, updatedMinutes:41, mediaAnimal:'dog' },
  { id:'RQ-2026-00484', status:'EN_ROUTE', severity:'CRITICAL', animalType:'CAT', animalDescription:'قطة مصابة ومرهقة', title:'قطة مصابة قرب سوق شعبي', description:'القطة لديها إصابة في الرأس وتتنفس بصعوبة. تم نقلها إلى مكان آمن مؤقتًا بانتظار فريق إنقاذ.', governorate:'دمشق', city:'باب توما', address:'ساحة باب توما قرب المدخل الشرقي', latitude:33.5135, longitude:36.3171, reporter:{id:'USR-1103',name:'مازن العلي',phone:'+963 988 621 332',isGuest:false}, verifiedAt:minutesAgo(58), internalNotesCount:3, createdMinutes:71, updatedMinutes:58, mediaAnimal:'cat', mediaCount:3 },
  { id:'RQ-2026-00485', status:'EN_ROUTE', severity:'HIGH', animalType:'DOG', animalDescription:'جروان بجانب طريق سريع', title:'جراء في موقع غير آمن', description:'جروان صغيران قرب حركة سيارات كثيفة، لا تظهر إصابات واضحة لكن الموقع شديد الخطورة.', governorate:'ريف دمشق', city:'جرمانا', address:'طريق المطار القديم قرب جسر جرمانا', latitude:33.4862, longitude:36.3469, reporter:{id:'GUEST-85',name:'هدى صباغ',phone:'+963 936 330 818',isGuest:true}, assignedOrganization:{id:'ORG-001',name:'جمعية الرحمة للحيوان'}, verifiedAt:minutesAgo(92), assignedAt:minutesAgo(75), internalNotesCount:1, createdMinutes:118, updatedMinutes:75, mediaAnimal:'dog' },
  { id:'RQ-2026-00486', status:'EN_ROUTE', severity:'CRITICAL', animalType:'DOG', animalDescription:'كلب كبير عالق داخل قناة صرف', title:'كلب عالق داخل قناة تصريف', description:'الفريق وصل إلى الموقع ويعمل على إخراج الحيوان باستخدام معدات حبال.', governorate:'حلب', city:'الحمدانية', address:'الحمدانية - المحور الرابع', latitude:36.1685, longitude:37.1107, reporter:{id:'USR-1112',name:'سلمى طه',phone:'+963 949 004 205',isGuest:false}, assignedOrganization:{id:'ORG-003',name:'فريق أمان للإنقاذ'}, verifiedAt:minutesAgo(130), assignedAt:minutesAgo(112), internalNotesCount:2, createdMinutes:145, updatedMinutes:18, mediaAnimal:'dog', mediaCount:3 },
  { id:'RQ-2026-00487', status:'RECEIVED', severity:'HIGH', animalType:'CAT', animalDescription:'قطة مصابة بكسر محتمل', title:'قطة مصابة بعد سقوط', description:'تم استلام القطة ونقلها إلى جهة رعاية لإجراء الفحص اللازم.', governorate:'دمشق', city:'أبو رمانة', address:'شارع الجلاء قرب ساحة المالكي', latitude:33.5227, longitude:36.2822, reporter:{id:'USR-1120',name:'جود منصور',email:'joud.m@example.com',isGuest:false}, assignedOrganization:{id:'ORG-002',name:'جمعية رفق دمشق'}, verifiedAt:minutesAgo(190), assignedAt:minutesAgo(170), internalNotesCount:1, createdMinutes:220, updatedMinutes:34, mediaAnimal:'cat' },
  { id:'RQ-2026-00488', status:'CLOSED', severity:'LOW', animalType:'BIRD', animalDescription:'حمامة بجناح متعب', title:'طائر غير قادر على الطيران', description:'تم فحص الطائر وتبين عدم وجود إصابة خطرة، وأعيد إلى مكان آمن بعد الرعاية.', governorate:'حمص', city:'الوعر', address:'حديقة الوعر المركزية', latitude:34.7421, longitude:36.6757, reporter:{id:'GUEST-88',name:'رنا الدروبي',isGuest:true}, assignedOrganization:{id:'ORG-004',name:'مبادرة رعاية حمص'}, verifiedAt:minutesAgo(280), assignedAt:minutesAgo(260), closedAt:minutesAgo(90), internalNotesCount:1, createdMinutes:330, updatedMinutes:90, mediaAnimal:'bird' },
  { id:'RQ-2026-00489', status:'CLOSED', severity:'LOW', animalType:'OTHER', animalDescription:'مشاهدة غير مؤكدة لحيوان بري', title:'بلاغ غير مكتمل عن حيوان بري', description:'المعلومات والموقع غير كافيين للتحقق من وجود حالة إنقاذ فعلية.', governorate:'اللاذقية', city:'الرمل الجنوبي', address:'موقع تقريبي فقط', latitude:35.5060, longitude:35.7768, reporter:{id:'GUEST-89',name:'سامر درويش',isGuest:true}, rejectionReason:'معلومات غير كافية', internalNotesCount:1, createdMinutes:410, updatedMinutes:370, mediaAnimal:'bird', mediaCount:1 },
  { id:'RQ-2026-00490', status:'EN_ROUTE', severity:'HIGH', animalType:'DOG', animalDescription:'كلب مصاب بجروح سطحية', title:'كلب يحتاج نقلًا إلى جهة رعاية', description:'تم تأمين الحيوان مؤقتًا ويحتاج إلى جمعية لنقله إلى نقطة رعاية.', governorate:'درعا', city:'درعا البلد', address:'قرب دوار الكازية', latitude:32.6151, longitude:36.1024, reporter:{id:'USR-1140',name:'أمير الزعبي',phone:'+963 957 812 200',isGuest:false}, verifiedAt:minutesAgo(430), internalNotesCount:2, createdMinutes:470, updatedMinutes:430, mediaAnimal:'dog' },
  { id:'RQ-2026-00491', status:'EN_ROUTE', severity:'MEDIUM', animalType:'CAT', animalDescription:'هررة صغيرة دون الأم', title:'هررة صغيرة في مدخل بناء', description:'ثلاث هرر صغيرة موجودة منذ الصباح دون ظهور الأم.', governorate:'حماة', city:'الحاضر', address:'شارع العلمين', latitude:35.1318, longitude:36.7578, reporter:{id:'GUEST-91',name:'عبير شاهين',phone:'+963 932 613 101',isGuest:true}, internalNotesCount:0, createdMinutes:520, mediaAnimal:'cat' },
  { id:'RQ-2026-00492', status:'EN_ROUTE', severity:'MEDIUM', animalType:'DOG', animalDescription:'كلب ضعيف قرب منطقة صناعية', title:'كلب منهك يحتاج فحصًا', description:'الكلب يستجيب للماء لكنه ضعيف جدًا.', governorate:'طرطوس', city:'المنطقة الصناعية', address:'مدخل المنطقة الصناعية الشمالي', latitude:34.8959, longitude:35.8867, reporter:{id:'USR-1152',name:'وسيم دياب',email:'w.diab@example.com',isGuest:false}, assignedOrganization:{id:'ORG-005',name:'فريق أصدقاء الحيوان - الساحل'}, verifiedAt:minutesAgo(600), assignedAt:minutesAgo(570), internalNotesCount:1, createdMinutes:650, updatedMinutes:570, mediaAnimal:'dog' },
  { id:'RQ-2026-00493', status:'EN_ROUTE', severity:'HIGH', animalType:'CAT', animalDescription:'قطة داخل مستودع مغلق', title:'قطة محاصرة داخل مستودع', description:'تم التواصل مع صاحب المستودع والفريق في الطريق.', governorate:'دمشق', city:'القابون', address:'المنطقة الصناعية القديمة', latitude:33.5483, longitude:36.3376, reporter:{id:'USR-1160',name:'غسان خليل',phone:'+963 944 509 918',isGuest:false}, assignedOrganization:{id:'ORG-002',name:'جمعية رفق دمشق'}, verifiedAt:minutesAgo(700), assignedAt:minutesAgo(680), internalNotesCount:2, createdMinutes:730, updatedMinutes:55, mediaAnimal:'cat' },
  { id:'RQ-2026-00494', status:'EN_ROUTE', severity:'LOW', animalType:'BIRD', animalDescription:'طائر صغير مصاب بجناحه', title:'طائر مصاب في حديقة', description:'الطائر في صندوق آمن عند المبلغ.', governorate:'حلب', city:'العزيزية', address:'حديقة السبيل', latitude:36.2056, longitude:37.1510, reporter:{id:'USR-1168',name:'تالا شربتجي',phone:'+963 953 642 731',isGuest:false}, verifiedAt:minutesAgo(780), internalNotesCount:0, createdMinutes:800, updatedMinutes:780, mediaAnimal:'bird' },
  { id:'RQ-2026-00495', status:'CLOSED', severity:'MEDIUM', animalType:'DOG', animalDescription:'كلب مصاب بالجلد', title:'كلب يحتاج رعاية بيطرية', description:'تم العلاج وتسليم الحيوان لمأوى شريك.', governorate:'ريف دمشق', city:'صحنايا', address:'الساحة الرئيسية', latitude:33.4272, longitude:36.2345, reporter:{id:'USR-1174',name:'يوسف نجار',phone:'+963 956 911 376',isGuest:false}, assignedOrganization:{id:'ORG-001',name:'جمعية الرحمة للحيوان'}, verifiedAt:daysAgo(1,90), assignedAt:daysAgo(1,70), closedAt:minutesAgo(120), internalNotesCount:1, createdMinutes:1560, updatedMinutes:120, mediaAnimal:'dog' },
  { id:'RQ-2026-00496', status:'RECEIVED', severity:'CRITICAL', animalType:'CAT', animalDescription:'قطة دهستها سيارة', title:'قطة مصابة بحادث', description:'تم نقلها إلى جهة رعاية وهي تحت المراقبة.', governorate:'اللاذقية', city:'الزراعة', address:'قرب جامعة تشرين', latitude:35.5317, longitude:35.7910, reporter:{id:'GUEST-96',name:'أحمد زيدان',phone:'+963 933 208 431',isGuest:true}, assignedOrganization:{id:'ORG-005',name:'فريق أصدقاء الحيوان - الساحل'}, verifiedAt:daysAgo(1,160), assignedAt:daysAgo(1,130), internalNotesCount:2, createdMinutes:1660, updatedMinutes:210, mediaAnimal:'cat', mediaCount:3 },
  { id:'RQ-2026-00497', status:'CLOSED', severity:'MEDIUM', animalType:'DOG', animalDescription:'كلب شوهد مرة واحدة', title:'بلاغ مكرر عن كلب ضال', description:'البلاغ يطابق حالة قائمة في نفس الموقع والوقت.', governorate:'دمشق', city:'ركن الدين', address:'شارع أسد الدين', latitude:33.5357, longitude:36.2880, reporter:{id:'USR-1190',name:'ديمة قصاب',isGuest:false}, rejectionReason:'بلاغ مكرر', internalNotesCount:1, createdMinutes:1810, updatedMinutes:1780, mediaAnimal:'dog' },
  { id:'RQ-2026-00498', status:'EN_ROUTE', severity:'MEDIUM', animalType:'DOG', animalDescription:'كلب مسن لا يتحرك جيدًا', title:'كلب مسن بحاجة إلى نقل', description:'الحيوان في مدخل منزل مهجور ويحتاج إلى نقل آمن.', governorate:'حمص', city:'كرم الشامي', address:'شارع الأهرام', latitude:34.7169, longitude:36.7068, reporter:{id:'USR-1198',name:'فراس محفوض',phone:'+963 948 155 901',isGuest:false}, verifiedAt:daysAgo(1,430), internalNotesCount:0, createdMinutes:1940, updatedMinutes:1870, mediaAnimal:'dog' },
  { id:'RQ-2026-00499', status:'EN_ROUTE', severity:'HIGH', animalType:'CAT', animalDescription:'قطة على حافة شرفة', title:'قطة في موقع مرتفع وخطر', description:'لا يمكن الوصول إليها من الشقة المجاورة.', governorate:'حماة', city:'القصور', address:'شارع 8 آذار', latitude:35.1401, longitude:36.7468, reporter:{id:'GUEST-99',name:'ريم حيدر',phone:'+963 936 502 447',isGuest:true}, internalNotesCount:0, createdMinutes:2100, updatedMinutes:2070, mediaAnimal:'cat' },
  { id:'RQ-2026-00500', status:'EN_ROUTE', severity:'LOW', animalType:'BIRD', animalDescription:'طائر مصاب إصابة بسيطة', title:'طائر يحتاج نقلًا لمختص', description:'الطائر محفوظ في صندوق مهوى.', governorate:'طرطوس', city:'الكورنيش', address:'قرب المرفأ القديم', latitude:34.8891, longitude:35.8734, reporter:{id:'USR-1201',name:'سوسن عيسى',email:'sawsan@example.com',isGuest:false}, assignedOrganization:{id:'ORG-005',name:'فريق أصدقاء الحيوان - الساحل'}, verifiedAt:daysAgo(2,60), assignedAt:daysAgo(2,35), internalNotesCount:1, createdMinutes:3020, updatedMinutes:2910, mediaAnimal:'bird' },
  { id:'RQ-2026-00501', status:'EN_ROUTE', severity:'MEDIUM', animalType:'DOG', animalDescription:'كلب عالق ضمن أرض مسيجة', title:'كلب محاصر داخل أرض خاصة', description:'تم الحصول على موافقة المالك للدخول والفريق في الموقع.', governorate:'درعا', city:'المحطة', address:'حي شمال الخط', latitude:32.6259, longitude:36.1074, reporter:{id:'USR-1214',name:'باسل الحريري',phone:'+963 955 670 012',isGuest:false}, assignedOrganization:{id:'ORG-006',name:'مبادرة كفوف درعا'}, verifiedAt:daysAgo(2,170), assignedAt:daysAgo(2,130), internalNotesCount:2, createdMinutes:3140, updatedMinutes:65, mediaAnimal:'dog' },
  { id:'RQ-2026-00502', status:'CLOSED', severity:'HIGH', animalType:'CAT', animalDescription:'قطة مصابة بعد سقوط', title:'قطة تحتاج تدخلاً بيطريًا', description:'تم علاج القطة واستقرار حالتها وإغلاق البلاغ.', governorate:'حلب', city:'الموكامبو', address:'شارع الموكامبو', latitude:36.2044, longitude:37.1309, reporter:{id:'USR-1222',name:'نسرين كيالي',phone:'+963 944 210 771',isGuest:false}, assignedOrganization:{id:'ORG-003',name:'فريق أمان للإنقاذ'}, verifiedAt:daysAgo(3,180), assignedAt:daysAgo(3,150), closedAt:daysAgo(1,20), internalNotesCount:2, createdMinutes:4490, updatedMinutes:1460, mediaAnimal:'cat' },
  { id:'RQ-2026-00503', status:'EN_ROUTE', severity:'LOW', animalType:'OTHER', animalDescription:'سلحفاة قرب طريق عام', title:'حيوان صغير في مسار المركبات', description:'سلحفاة على جانب طريق فرعي وقد تتعرض للدهس.', governorate:'ريف دمشق', city:'قدسيا', address:'طريق قدسيا - الهامة', latitude:33.5680, longitude:36.1910, reporter:{id:'GUEST-503',name:'ولاء السيد',phone:'+963 938 701 604',isGuest:true}, internalNotesCount:0, createdMinutes:4750, mediaAnimal:'bird' },
  { id:'RQ-2026-00504', status:'EN_ROUTE', severity:'CRITICAL', animalType:'DOG', animalDescription:'كلب ينزف قرب منشأة', title:'إصابة حادة تحتاج إسنادًا سريعًا', description:'تم التحقق من الحالة ويجب تأمين جهة استلام فورًا.', governorate:'دمشق', city:'برزة', address:'طريق مشفى تشرين', latitude:33.5593, longitude:36.3159, reporter:{id:'USR-1241',name:'هبة فواز',phone:'+963 951 224 880',email:'hiba.f@example.com',isGuest:false}, verifiedAt:daysAgo(3,360), internalNotesCount:2, createdMinutes:4940, updatedMinutes:4680, mediaAnimal:'dog', mediaCount:3 },
];

let reports: Report[] = seeds.map(({ createdMinutes, updatedMinutes, mediaAnimal, mediaCount, ...report }) => ({
  ...report,
  status: report.status === 'EN_ROUTE' && !report.assignedOrganization ? undefined : report.status,
  media: media(report.id, mediaAnimal, mediaCount),
  createdAt: minutesAgo(createdMinutes),
  updatedAt: minutesAgo(updatedMinutes ?? createdMinutes),
}));

const buildEligibleOrganizations = (): EligibleOrganization[] => organizationFixtures.filter((org) => org.status === 'ACTIVE' && org.verificationStatus === 'VERIFIED').map((org, index): EligibleOrganization => ({ id:org.id, name:org.name, governorate:org.governorate, distanceKm:[4.2,7.8,5.1,9.4,11.2,8.6][index], activeReports:[3,5,2,4,6,1][index] ?? 1, availability:index === 1 || index === 4 ? 'LIMITED' : 'AVAILABLE' }));
export const eligibleOrganizations: EligibleOrganization[] = buildEligibleOrganizations();

const timelineByReport = new Map<string, ReportTimelineEvent[]>();
const notesByReport = new Map<string, ReportNote[]>();

for (const report of reports) {
  const events: ReportTimelineEvent[] = [
    {
      id: `${report.id}-created`,
      action: 'تم نشر البلاغ',
      actor: report.reporter.name,
      timestamp: report.createdAt,
      details: report.title,
      tone: 'info',
    },
  ];

  if (report.assignedAt && report.assignedOrganization) {
    events.push({
      id: `${report.id}-assigned`,
      action: 'تم استلام البلاغ من الجمعية',
      actor: report.assignedOrganization.name,
      timestamp: report.assignedAt,
      details: `الجمعية الحالية: ${report.assignedOrganization.name}.`,
      tone: 'pending',
    });
  }

  if (report.status === 'RECEIVED') {
    events.push({
      id: `${report.id}-received`,
      action: 'تم استلام الحالة',
      actor: report.assignedOrganization?.name,
      timestamp: report.receivedAt ?? report.updatedAt,
      tone: 'success',
    });
  }

  if (report.status === 'CLOSED') {
    events.push({
      id: `${report.id}-closed`,
      action: 'تم إغلاق الحالة',
      actor: report.assignedOrganization?.name ?? 'فريق الإدارة',
      timestamp: report.closedAt ?? report.updatedAt,
      tone: 'neutral',
    });
  }

  timelineByReport.set(
    report.id,
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  );

  notesByReport.set(
    report.id,
    report.internalNotesCount
      ? [{
          id: `${report.id}-note-1`,
          adminName: 'أحمد الخطيب',
          adminRole: 'مدير العمليات',
          createdAt: report.updatedAt,
          note: 'ملاحظة تشغيلية داخلية مرتبطة بمتابعة البلاغ.',
        }]
      : [],
  );
}

function findReport(id: string): Report | undefined { return reports.find((report) => report.id === id); }
function clone<T>(value: T): T { return structuredClone(value); }
function updateReport(id: string, updater: (report: Report) => Report): Report {
  const index = reports.findIndex((report) => report.id === id);
  const current = index >= 0 ? reports[index] : undefined;
  if (!current) throw new Error('REPORT_NOT_FOUND');
  const updated = updater(current);
  reports = reports.map((report, reportIndex) => reportIndex === index ? updated : report);
  return updated;
}
function addEvent(reportId: string, event: Omit<ReportTimelineEvent, 'id' | 'timestamp'>): void {
  const events = timelineByReport.get(reportId) ?? [];
  timelineByReport.set(reportId, [{ ...event, id:`${reportId}-event-${Date.now()}`, timestamp:new Date().toISOString() }, ...events]);
}

export async function getReports(filters: ReportFilters): Promise<ReportListResult> {
  await mockDelay(180);
  const normalized = filters.search.trim().toLocaleLowerCase('ar');

  let filtered = reports.filter((report) => {
    const searchable = [
      report.id,
      report.animalDescription,
      report.title,
      report.reporter.name,
      report.governorate,
      report.city,
      report.address,
      report.assignedOrganization?.name,
    ].filter(Boolean).join(' ').toLocaleLowerCase('ar');

    if (normalized && !searchable.includes(normalized)) return false;
    if (filters.status && report.status !== filters.status) return false;
    if (filters.animalType && report.animalType !== filters.animalType) return false;
    if (filters.governorate && report.governorate !== filters.governorate) return false;
    if (filters.organizationId === 'UNASSIGNED' && report.assignedOrganization) return false;
    if (
      filters.organizationId &&
      filters.organizationId !== 'UNASSIGNED' &&
      report.assignedOrganization?.id !== filters.organizationId
    ) return false;
    if (filters.userId && (report.reporter.isGuest || report.reporter.id !== filters.userId)) return false;
    if (filters.dateFrom && new Date(report.createdAt) < new Date(`${filters.dateFrom}T00:00:00`)) return false;
    if (filters.dateTo && new Date(report.createdAt) > new Date(`${filters.dateTo}T23:59:59`)) return false;
    return true;
  });

  filtered = filtered.sort((a, b) => {
    const direction = filters.sortDirection === 'asc' ? 1 : -1;
    if (filters.sortBy === 'status') return (a.status ?? '').localeCompare(b.status ?? '') * direction;
    const key = filters.sortBy === 'updatedAt' ? 'updatedAt' : 'createdAt';
    return (new Date(a[key]).getTime() - new Date(b[key]).getTime()) * direction;
  });

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(filters.page, pageCount);
  const start = (page - 1) * filters.pageSize;

  return {
    items: clone(filtered.slice(start, start + filters.pageSize)),
    total,
    page,
    pageSize: filters.pageSize,
    pageCount,
  };
}

export interface ReportOperationalSnapshot {
  todayCount: number;
  unassignedCount: number;
  enRouteCount: number;
  receivedTodayCount: number;
}

export async function getReportOperationalSnapshot(): Promise<ReportOperationalSnapshot> {
  await mockDelay(60);
  return {
    todayCount: reports.filter((report) => isTodayIso(report.createdAt)).length,
    unassignedCount: reports.filter((report) => report.status !== 'CLOSED' && !report.assignedOrganization).length,
    enRouteCount: reports.filter((report) => report.status === 'EN_ROUTE' && Boolean(report.assignedOrganization)).length,
    receivedTodayCount: reports.filter((report) => report.status === 'RECEIVED' && isTodayIso(report.updatedAt)).length,
  };
}

export async function getReportSummary(): Promise<ReportSummary> {
  await mockDelay(100);
  return getReportOperationalSnapshot();
}

export async function getReportById(reportId: string): Promise<ReportDetails | null> {
  await mockDelay(140);
  const report = findReport(reportId);
  if (!report) return null;
  return clone({
    report,
    timeline: timelineByReport.get(reportId) ?? [],
    notes: notesByReport.get(reportId) ?? [],
  });
}

export async function getEligibleOrganizations(search = ''): Promise<EligibleOrganization[]> {
  await mockDelay(100);
  const needle = search.trim().toLocaleLowerCase('ar');
  return clone(
    buildEligibleOrganizations().filter(
      (organization) =>
        !needle || organization.name.toLocaleLowerCase('ar').includes(needle),
    ),
  );
}

export async function assignReport(
  reportId: string,
  organizationId: string,
  actor: AdminSession,
): Promise<Report> {
  await mockDelay(130);

  const previous = findReport(reportId);
  const organization = buildEligibleOrganizations().find((item) => item.id === organizationId);

  if (!organization || organization.availability === 'UNAVAILABLE') {
    throw new Error('ORGANIZATION_NOT_AVAILABLE');
  }

  const assignedAt = new Date().toISOString();

  const report = updateReport(reportId, (current) => {
    if (current.status === 'CLOSED') throw new Error('INVALID_REPORT_STATE');

    return {
      ...current,
      assignedOrganization: { id: organization.id, name: organization.name },
      status: current.status === 'RECEIVED' ? 'RECEIVED' : 'EN_ROUTE',
      assignedAt,
      updatedAt: assignedAt,
    };
  });

  addEvent(reportId, {
    action: previous?.assignedOrganization
      ? 'تم تغيير الجمعية المسؤولة'
      : 'تم تعيين الجمعية المسؤولة',
    actor: actor.name,
    details: previous?.assignedOrganization
      ? `من ${previous.assignedOrganization.name} إلى ${organization.name}.`
      : `الجمعية الحالية: ${organization.name}.`,
    tone: 'info',
  });

  recordAdminAuditEvent(actor, {
    action: previous?.assignedOrganization
      ? 'REPORT_ORGANIZATION_CHANGED'
      : 'REPORT_ORGANIZATION_ASSIGNED',
    resource: { type: 'REPORT', id: reportId, label: report.title },
    previousValue: { organization: previous?.assignedOrganization?.name ?? 'غير مسند' },
    newValue: { organization: organization.name },
    metadata: { source: 'تشغيل البلاغات', relatedResourceIds: [organization.id] },
  });

  return clone(report);
}

export async function adminOverrideReportStatus(
  reportId: string,
  input: AdminStatusOverrideInput,
  actor: AdminSession,
): Promise<Report> {
  await mockDelay(120);

  const previous = findReport(reportId);
  const updatedAt = new Date().toISOString();

  const report = updateReport(reportId, (current) => ({
    ...current,
    status: input.status,
    receivedAt:
      input.status === 'RECEIVED'
        ? current.receivedAt ?? updatedAt
        : current.receivedAt,
    closedAt: input.status === 'CLOSED' ? updatedAt : undefined,
    updatedAt,
  }));

  const label =
    input.status === 'EN_ROUTE'
      ? 'يتم التوجه لمكان البلاغ'
      : input.status === 'RECEIVED'
        ? 'تم الاستلام'
        : 'إغلاق الحالة';

  addEvent(reportId, {
    action: 'تجاوز إداري لحالة البلاغ',
    actor: actor.name,
    details: `${label} — ${input.reason}`,
    tone:
      input.status === 'CLOSED'
        ? 'neutral'
        : input.status === 'RECEIVED'
          ? 'success'
          : 'pending',
  });

  recordAdminAuditEvent(actor, {
    action: 'REPORT_STATUS_ADMIN_OVERRIDE',
    resource: { type: 'REPORT', id: reportId, label: report.title },
    reason: input.reason,
    previousValue: { status: previous?.status ?? '—' },
    newValue: { status: input.status },
    metadata: { source: 'تشغيل البلاغات', override: true },
  });

  return clone(report);
}

export async function deleteReport(
  reportId: string,
  input: DeleteReportInput,
  actor: AdminSession,
): Promise<void> {
  await mockDelay(120);

  const report = findReport(reportId);
  if (!report) throw new Error('REPORT_NOT_FOUND');

  reports = reports.filter((item) => item.id !== reportId);
  timelineByReport.delete(reportId);
  notesByReport.delete(reportId);

  recordAdminAuditEvent(actor, {
    action: 'REPORT_DELETED',
    resource: { type: 'REPORT', id: reportId, label: report.title },
    reason: input.reason,
    previousValue: {
      status: report.status,
      organization: report.assignedOrganization?.name ?? 'غير مسند',
    },
    metadata: { source: 'تشغيل البلاغات', destructive: true },
  });
}

export async function addReportNote(reportId: string, note: string, actor: AdminSession): Promise<ReportNote> {
  await mockDelay(90);
  if (!findReport(reportId)) throw new Error('REPORT_NOT_FOUND');
  const created: ReportNote = { id:`NOTE-${Date.now()}`, adminName:actor.name, adminRole:actor.roleLabel, createdAt:new Date().toISOString(), note };
  notesByReport.set(reportId, [created, ...(notesByReport.get(reportId) ?? [])]);
  updateReport(reportId, (current) => ({ ...current, internalNotesCount:(current.internalNotesCount ?? 0) + 1, updatedAt:created.createdAt }));
  addEvent(reportId, { action:'أضيفت ملاحظة داخلية', actor:actor.name, details:'الملاحظة مرئية لفريق الإدارة فقط.', tone:'neutral' });
  return clone(created);
}

/**
 * Organization-side seam: this is the normal place where report status changes.
 * The admin UI only exposes a clearly labelled emergency override.
 */
export function syncReportOrganizationStatus(
  reportId: string,
  status: 'EN_ROUTE' | 'RECEIVED' | 'CLOSED',
  actorName: string,
  details?: string,
): void {
  const updatedAt = new Date().toISOString();

  updateReport(reportId, (current) => ({
    ...current,
    status,
    receivedAt:
      status === 'RECEIVED'
        ? current.receivedAt ?? updatedAt
        : current.receivedAt,
    closedAt: status === 'CLOSED' ? updatedAt : undefined,
    updatedAt,
  }));

  addEvent(reportId, {
    action:
      status === 'EN_ROUTE'
        ? 'الفريق في الطريق إلى الحالة'
        : status === 'RECEIVED'
          ? 'تم استلام الحالة'
          : 'تم إغلاق الحالة',
    actor: actorName,
    details,
    tone:
      status === 'RECEIVED'
        ? 'success'
        : status === 'CLOSED'
          ? 'neutral'
          : 'pending',
  });
}

/** Keeps report assignment aligned with its rescue mission. */
export function syncReportMissionAssignment(
  reportId: string,
  organization: { id: string; name: string },
  actorName: string,
): void {
  const updatedAt = new Date().toISOString();

  updateReport(reportId, (current) => ({
    ...current,
    assignedOrganization: organization,
    status:
      current.status === 'CLOSED' || current.status === 'RECEIVED'
        ? current.status
        : 'EN_ROUTE',
    assignedAt: current.assignedAt ?? updatedAt,
    updatedAt,
  }));

  addEvent(reportId, {
    action: 'تحديث الجمعية المسؤولة',
    actor: actorName,
    details: `الجمعية الحالية: ${organization.name}.`,
    tone: 'info',
  });
}

/** Mission completion means the organization received the case; cancellation returns it to active follow-up. */
export function syncReportMissionOutcome(
  reportId: string,
  outcome: 'COMPLETED' | 'CANCELLED',
  actorName: string,
  details?: string,
): void {
  if (outcome === 'COMPLETED') {
    syncReportOrganizationStatus(reportId, 'RECEIVED', actorName, details);
    return;
  }

  syncReportOrganizationStatus(
    reportId,
    'EN_ROUTE',
    actorName,
    details ?? 'ألغيت المهمة الحالية وأعيد البلاغ للمتابعة التشغيلية.',
  );
}
