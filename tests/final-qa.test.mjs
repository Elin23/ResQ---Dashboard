import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const root = new URL('../', import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), 'utf8');
const walk = (dir) => readdirSync(join(root, dir)).flatMap((name) => {
  const relative = join(dir, name);
  return statSync(join(root, relative)).isDirectory() ? walk(relative) : [relative];
});
const sourceFiles = walk('src').filter((path) => /\.(?:ts|tsx)$/u.test(path));
const allSource = () => sourceFiles.map(read).join('\n');

test('hash routing has one router owner and recovery stays inside the hash route', () => {
  const providers = read('src/providers/app-providers.tsx');
  const main = read('src/main.tsx');
  const boundary = read('src/app/error-boundary.tsx');
  assert.match(providers, /HashRouter/u);
  assert.doesNotMatch(providers, /BrowserRouter/u);
  assert.doesNotMatch(main, /(?:HashRouter|BrowserRouter)/u);
  assert.match(boundary, /location\.assign\('\/#\/dashboard'\)/u);
});

test('removed standalone features are not imported or routed', () => {
  const source = allSource();
  assert.doesNotMatch(source, /@\/features\/(?:rescue-missions|animals|clinics)/u);
  assert.doesNotMatch(read('src/routes/app-router.tsx'), /path="(?:rescue-missions|animals|clinics)/u);
  for (const path of ['src/features/rescue-missions','src/features/animals','src/features/clinics']) {
    assert.equal(existsSync(join(root, path)), false, `${path} should remain removed`);
  }
});

test('standalone reports and analytics page is removed while report operations stay internally clean', () => {
  const service = read('src/features/report-operations/services/report-operations.mock.ts');
  const types = read('src/features/report-operations/types/index.ts');
  const hooks = read('src/features/report-operations/hooks/index.ts');
  const router = read('src/routes/app-router.tsx');
  const modules = read('src/routes/module-routes.ts');
  assert.equal(existsSync(join(root, 'src/features/analytics')), false);
  assert.doesNotMatch(router, /AnalyticsPage|path="analytics"/u);
  assert.doesNotMatch(modules, /\/analytics|التقارير/u);
  assert.match(service, /getReportOperations/u);
  assert.match(types, /ReportOperationStatus/u);
  assert.match(hooks, /reportOperationKeys/u);
  assert.doesNotMatch(service + types + hooks, /getRescueMissions|RescueMissionCompat|missionKeys/u);
});

test('audit log no longer exposes removed rescue-mission resources or permissions', () => {
  const types = read('src/features/audit-log/types/index.ts');
  const constants = read('src/features/audit-log/constants/index.ts');
  const utils = read('src/features/audit-log/utils/index.ts');
  assert.doesNotMatch(types + constants + utils, /RESCUE_MISSION|MISSION_REASSIGNED|MISSION_CANCELLED|missions:view/u);
  assert.match(utils, /SYSTEM_SETTING'\)return'\/settings'/u);
});

test('content success stories reference reports and organizations without obsolete mission ids', () => {
  const contentFiles = sourceFiles.filter((path) => path.includes('features/content/'));
  const source = contentFiles.map(read).join('\n');
  assert.doesNotMatch(source, /missionId|مهمة الإنقاذ|MS-2026-/u);
  assert.match(read('src/features/content/types/index.ts'), /reportId\?:string/u);
  assert.match(read('src/features/content/types/index.ts'), /organizationId\?:string/u);
});

test('permission registry contains no removed mission permissions', () => {
  assert.doesNotMatch(read('src/features/auth/permissions.ts'), /['"]missions[.:]/u);
});

test('settings expose only the current landing destinations and keep the legacy redirect safe', () => {
  const router = read('src/routes/app-router.tsx');
  assert.match(router, /settings\/emergency-contacts/u);
  assert.match(router, /settings\/backups/u);
  assert.match(router, /path="settings\/system" element=\{<Navigate to="\/settings" replace\/>\}/u);
});

test('page navigation resets the content scroller only when the pathname changes', () => {
  const shell = read('src/components/layout/app-shell.tsx');
  assert.match(shell, /main\.scrollTo\(\{/u);
  assert.match(shell, /\[\s*location\.pathname,?\s*\]/u);
});

test('development role switcher remains mounted in the authenticated shell for the current review build', () => {
  const shell = read('src/components/layout/app-shell.tsx');
  assert.match(shell, /<DevelopmentRoleSwitcher \/>/u);
});

test('DataTable remains RTL, vertically aligned and event-driven', () => {
  const table = read('src/components/ui/data-table.tsx');
  assert.match(table, /dir="rtl"/u);
  assert.match(table, /align-middle/u);
  assert.match(table, /onSortingChange:\s*changeSorting/u);
  assert.match(table, /onPaginationChange:\s*changePagination/u);
});

test('native alert and confirm APIs are not used by application source', () => {
  const source = allSource();
  assert.doesNotMatch(source, /(?:window|globalThis)\.(?:alert|confirm)\s*\(/u);
});

test('internal source imports do not point at the removed rescue feature', () => {
  for (const path of sourceFiles) {
    const source = read(path);
    assert.doesNotMatch(source, /features\/rescue-missions/u, path);
  }
});

test('latest simplification removes adoption internal notes and uses clear advertisement payment and image fields', () => {
  const adoptionDetails = read('src/features/adoption-requests/pages/adoption-request-details-page.tsx');
  const adCreate = read('src/features/advertisements/components/advertisement-create-dialog.tsx');
  const adDetails = read('src/features/advertisements/pages/advertisement-details-page.tsx');
  const adTypes = read('src/features/advertisements/types/index.ts');
  assert.doesNotMatch(adoptionDetails, /AdoptionInternalNotesCard|ملاحظات داخلية/u);
  assert.match(adCreate, /type="file"/u);
  assert.match(adCreate, /multiple/u);
  assert.match(adCreate, /رقم الحوالة/u);
  assert.doesNotMatch(adCreate + adDetails + adTypes, /رقم الدفعة|paymentReference|targetUrl|رابط الوجهة/u);
  assert.match(adCreate + adDetails, /الموقع الإلكتروني/u);
  assert.match(adTypes, /paymentMethod: AdvertisementPaymentMethod/u);
});
