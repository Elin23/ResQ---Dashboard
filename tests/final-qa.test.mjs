import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const root = new URL('../', import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), 'utf8');

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const sourceFiles = walk(join(root, 'src')).filter((path) => /\.(ts|tsx|css)$/u.test(path));
const source = sourceFiles.map((path) => readFileSync(path, 'utf8')).join('\n');

test('final routes are explicitly registered', () => {
  const router = read('src/routes/app-router.tsx');
  const required = ['dashboard','reports/:reportId','adoption-requests/:requestId','organizations/:organizationId','users/:userId','feeding-points/:feedingPointId','donations/:donationId','advertisements/:advertisementId','content/articles/new','content/success-stories','content/awareness','content/faq','notifications/new','map','support/:ticketId','analytics','audit-log','settings/admin-users/:adminId','settings/roles/:roleId','settings/system'];
  for (const route of required) assert.match(router, new RegExp(`path=["']${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'u'), route);
  assert.doesNotMatch(router, /ModulePlaceholderPage/u);
});

test('browser-native operational dialogs and unsafe escapes are absent', () => {
  assert.doesNotMatch(source, /window\.(?:alert|confirm)\s*\(/u);
  assert.doesNotMatch(source, /\bas any\b|\bas never\b|@ts-ignore|@ts-expect-error/u);
  assert.doesNotMatch(source, /console\.(?:log|debug|warn)\s*\(/u);
});

test('client environment example contains no secret-class variables', () => {
  const envExample = read('.env.example');
  assert.match(envExample, /VITE_API_BASE_URL=/u);
  assert.match(envExample, /VITE_DATA_SOURCE=mock/u);
  assert.doesNotMatch(envExample, /JWT_SECRET|DATABASE_URL|PRIVATE_KEY|SERVER_KEY|PASSWORD=/u);
});

test('settings and audit permissions use the centralized registry', () => {
  const permissions = read('src/features/auth/permissions.ts');
  for (const key of ['audit.read','audit.export','audit.technical.read','admins.read','admins.suspend','roles.update','settings.update']) assert.match(permissions, new RegExp(key.replace('.', '\\.'), 'u'));
  assert.doesNotMatch(permissions, /community:view|content:manage/u);
});

test('static internal links target known application modules', () => {
  const knownBases = ['/dashboard','/reports','/adoption-requests','/organizations','/users','/feeding-points','/donations','/advertisements','/content','/notifications','/map','/support','/analytics','/audit-log','/settings','/404','/unauthorized','/login'];
  const linkPattern = /\bto="(\/[^"?#]*)/gu;
  for (const path of sourceFiles.filter((file) => file.endsWith('.tsx'))) {
    const text = readFileSync(path, 'utf8');
    for (const match of text.matchAll(linkPattern)) {
      const target = match[1];
      assert.ok(target && knownBases.some((base) => target === base || target.startsWith(`${base}/`)), `Unknown static route ${target} in ${path}`);
    }
  }
});


test('analytics constants preserve the public feature contract', () => {
  const constants = read('src/features/analytics/constants/index.ts');
  for (const name of ['analyticsRangeOptions', 'chartPalette', 'metricDefinitions']) {
    assert.ok(constants.includes(`export const ${name}`), `missing analytics export ${name}`);
  }
  for (const key of ['reportCompletionRate', 'rescueCompletionRate', 'adoptionCompletionRate']) {
    assert.ok(constants.includes(`${key}:`), `missing metric definition ${key}`);
  }
  assert.ok(constants.includes("export { operationalTargets } from '@/features/settings/services/settings.mock';"));
});


test('mock authentication exposes one credential per established admin role', () => {
  const auth = read('src/features/auth/mock-auth.ts');
  const router = read('src/routes/app-router.tsx');
  for (const role of ['SUPER_ADMIN','OPERATIONS_ADMIN','ORGANIZATION_REVIEWER','CONTENT_MANAGER','SUPPORT_AGENT','FINANCE_ADMIN']) {
    assert.match(auth, new RegExp(`role: '${role}'`, 'u'), `missing mock credential for ${role}`);
  }
  assert.match(router, /path="\/login"/u);
  assert.match(read('src/features/auth/rbac.tsx'), /Navigate to="\/login"/u);
});

test('package scripts expose test and unified check commands', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(typeof pkg.scripts.test, 'string');
  assert.equal(typeof pkg.scripts.check, 'string');
  assert.match(pkg.scripts.check, /typecheck.*lint.*test.*build/u);
});

test('package 22 keeps the sidebar viewport-fixed and removes empty unauthorized groups', () => {
  const shell = read('src/components/layout/app-shell.tsx');
  const sidebar = read('src/components/layout/sidebar.tsx');
  assert.match(shell, /h-dvh overflow-hidden/u);
  assert.match(shell, /resq-scroll-region min-h-0 flex-1 overflow-y-auto/u);
  assert.match(sidebar, /visibleGroups/u);
  assert.match(sidebar, /filter\(\(group\) => group\.items\.length > 0\)/u);
  assert.match(sidebar, /collapsed && 'mx-auto size-10 justify-center/u);
});

test('package 22 defines restrained hover transitions across interactive controls', () => {
  const css = read('src/index.css');
  assert.match(css, /@media \(hover: hover\)/u);
  assert.match(css, /transition-duration: 160ms/u);
  assert.match(css, /prefers-reduced-motion: reduce/u);
});

test('package 23 provides splash/loading feedback and notification sound without external audio assets', () => {
  const app = read('src/app/app.tsx');
  const splash = read('src/components/feedback/app-splash.tsx');
  const sound = read('src/features/notifications/services/notification-sound.ts');
  assert.match(app, /AppSplashScreen/u);
  assert.match(splash, /AppInlineLoader/u);
  assert.match(sound, /createOscillator/u);
  assert.doesNotMatch(sound, /\.mp3|\.wav|https?:\/\//u);
});

test('package 23 keeps dashboard numerals Latin and donation finance SYP-only', () => {
  assert.doesNotMatch(source, /Intl\.NumberFormat\(['"]ar-(?:SY|SA)['"]/u);
  assert.doesNotMatch(source, /toLocaleString\(['"]ar-(?:SY|SA)['"]/u);
  const donationTypes = read('src/features/donations/types/index.ts');
  const donationService = read('src/features/donations/services/donations.mock.ts');
  const analyticsTypes = read('src/features/analytics/types/index.ts');
  assert.match(donationTypes, /donationCurrencies=\['SYP'\]/u);
  assert.doesNotMatch(donationService, /currency:'USD'/u);
  assert.doesNotMatch(analyticsTypes, /'USD'/u);
});

test('package 24 separates management reports from analytics and keeps report domains permission-aware', () => {
  const page = read('src/features/analytics/pages/analytics-page.tsx');
  const reports = read('src/features/analytics/components/management-reports-view.tsx');
  const service = read('src/features/analytics/services/management-reports.mock.ts');
  assert.match(page, /TabsTrigger value="reports">التقارير/u);
  assert.match(page, /TabsTrigger value="analytics">الإحصائيات/u);
  for (const label of ['حالات الإنقاذ','التبرعات','الإعلانات','الجمعيات','التبني','الدعم','المستخدمون']) assert.match(reports, new RegExp(label, 'u'));
  assert.match(page, /usePermission\('advertisements\.read'\)/u);
  assert.match(page, /usePermission\('support\.read'\)/u);
  assert.match(page, /usePermission\('donations\.read'\)/u);
  assert.match(service, /getAdvertisements/u);
  assert.match(service, /getSupportTickets/u);
});

test('package 25 keeps every literal permission usage inside the centralized registry', () => {
  const permissionsSource = read('src/features/auth/permissions.ts');
  const registryMatch = permissionsSource.match(/export const permissions = \[(.*?)\] as const;/su);
  assert.ok(registryMatch, 'permission registry not found');
  const allowed = new Set([...registryMatch[1].matchAll(/'([^']+)'/gu)].map((match) => match[1]));
  const usagePatterns = [
    /permission="([^"]+)"/gu,
    /permission='([^']+)'/gu,
    /usePermission\('([^']+)'\)/gu,
    /usePermission\("([^"]+)"\)/gu,
  ];
  for (const path of sourceFiles.filter((file) => /\.(?:ts|tsx)$/u.test(file))) {
    const text = readFileSync(path, 'utf8');
    for (const pattern of usagePatterns) {
      for (const match of text.matchAll(pattern)) {
        assert.ok(allowed.has(match[1]), `Unknown permission ${match[1]} in ${path}`);
      }
    }
  }
});

test('package 25 guards the requested finance and numeral policy', () => {
  const financeFiles = sourceFiles.filter((file) => /features\/(?:donations|analytics)/u.test(file));
  const financeSource = financeFiles.map((file) => readFileSync(file, 'utf8')).join('\n');
  assert.doesNotMatch(financeSource, /\bUSD\b|دولار/u);
  assert.doesNotMatch(source, /[٠-٩]/u);
});

test('router transitions do not replace the current page with a lazy-route fallback', () => {
  const router = read('src/routes/app-router.tsx');
  const main = read('src/main.tsx');
  const sidebar = read('src/components/layout/sidebar.tsx');
  assert.doesNotMatch(router, /\blazy\s*\(|<Suspense|RouteLoadingPage/u);
  assert.doesNotMatch(sidebar, /preloadRoute/u);
  assert.doesNotMatch(main, /StrictMode/u);
  assert.equal(sourceFiles.some((file) => file.endsWith('/routes/route-preload.ts')), false);
});

test('package 25 preserves auth, protected-route and hidden-sidebar behavior together', () => {
  const router = read('src/routes/app-router.tsx');
  const rbac = read('src/features/auth/rbac.tsx');
  const sidebar = read('src/components/layout/sidebar.tsx');
  assert.match(router, /path="\/login"/u);
  assert.match(rbac, /Navigate to="\/login" replace/u);
  assert.match(rbac, /Navigate to="\/unauthorized" replace/u);
  assert.match(sidebar, /rolePermissions\[session\.role\]\.has\(item\.permission\)/u);
  assert.match(sidebar, /collapsed && 'mx-auto size-10 justify-center gap-0 px-0'/u);
});

test('router stability hotfix keeps mock latency opt-in and avoids GPU-sensitive shell blur', () => {
  const delay = read('src/services/mock/delay.ts');
  const envConfig = read('src/config/env.ts');
  const envExample = read('.env.example');
  const header = read('src/components/layout/header.tsx');
  const css = read('src/index.css');
  const providers = read('src/providers/app-providers.tsx');
  assert.match(delay, /env\.mockLatencyMs/u);
  assert.match(delay, /configured <= 0\) return Promise\.resolve\(\)/u);
  assert.match(envConfig, /mockLatencyMs:/u);
  assert.match(envExample, /VITE_MOCK_LATENCY_MS=0/u);
  assert.doesNotMatch(header, /backdrop-blur/u);
  assert.doesNotMatch(css, /isolation:\s*isolate/u);
  assert.match(providers, /staleTime: env\.dataSource === 'mock' \? Infinity/u);
});

test('package 02 keeps DataTable controlled state event-driven without prop mirroring effects', () => {
  const table = read('src/components/ui/data-table.tsx');
  assert.match(table, /const search = state\?\.search \?\? localSearch/u);
  assert.match(table, /const sorting = state\?\.sorting \?\? localSorting/u);
  assert.doesNotMatch(table, /if \(state\?\.search !== undefined.*setSearch/su);
  assert.doesNotMatch(table, /if \(!state\?\.sorting\).*setSorting/su);
  assert.match(table, /DebouncedSearchInput/u);
});

test('package 02 debounces heavy list and map searches before URL or dataset updates', () => {
  const ui = read('src/components/ui/index.tsx');
  assert.match(ui, /export function DebouncedSearchInput/u);
  assert.match(ui, /window\.setTimeout/u);
  for (const file of [
    'src/features/reports/components/reports-filter-bar.tsx',
    'src/features/users/components/user-filter-bar.tsx',
    'src/features/support/components/support-filter-bar.tsx',
    'src/features/map/components/map-controls.tsx',
  ]) {
    assert.match(read(file), /DebouncedSearchInput/u, `${file} must use debounced search`);
  }
});

test('package 02 prunes stale server-side table selections and stabilizes parsed URL filters', () => {
  const table = read('src/components/ui/data-table.tsx');
  assert.match(table, /visibleIds/u);
  assert.match(table, /manualPagination && !manualFiltering/u);
  for (const file of [
    'src/features/users/pages/users-page.tsx',
    'src/features/organizations/pages/organizations-page.tsx',
  ]) {
    assert.match(read(file), /useMemo\(\(\)=>fromParams\(params\),\[params\]\)/u, `${file} should memoize parsed filters`);
  }
});

test('package 03 keeps Leaflet out of the dashboard preview', () => {
  const dashboard = read('src/features/dashboard/components/dashboard-sections.tsx');
  assert.doesNotMatch(dashboard, /MapCanvas|MapProvider|useOperationalMapData/u);
  assert.match(dashboard, /معاينة تشغيلية خفيفة/u);
});

test('package 03 stabilizes map viewport work and resizes Leaflet only when needed', () => {
  const map = read('src/components/map/MapCanvas.tsx');
  const marker = read('src/components/map/MapMarker.tsx');
  assert.match(map, /geometryKey/u);
  assert.match(map, /ResizeObserver/u);
  assert.match(map, /invalidateSize/u);
  assert.doesNotMatch(map, /\[map,\s*entities,\s*fitNonce,\s*focusEntity\]/u);
  assert.match(marker, /useMemo/u);
  assert.match(marker, /memo\(MapMarkerComponent/u);
});

test('package 03 debounces responsive chart resize work and memoizes chart components', () => {
  for (const file of [
    'src/features/dashboard/components/dashboard-sections.tsx',
    'src/features/analytics/components/analytics-charts.tsx',
    'src/features/donations/components/donation-analytics.tsx',
  ]) {
    const source = read(file);
    assert.match(source, /debounce=\{120\}/u, `${file} should debounce ResponsiveContainer resize work`);
    assert.match(source, /memo\(/u, `${file} should memoize expensive chart components`);
  }
});

test('package 04 loads Tajawal and keeps it as the primary Arabic UI font', () => {
  const html = read('index.html');
  const css = read('src/index.css');
  const tailwind = read('tailwind.config.ts');
  assert.match(html, /family=Tajawal:wght@400;500;600;700;800/u);
  assert.match(css, /'Tajawal'/u);
  assert.match(tailwind, /sans: \['Tajawal'/u);
});

test('package 04 defines a reusable visual system with responsive grid and motion safety', () => {
  const css = read('src/index.css');
  assert.match(css, /--shadow-card-hover:/u);
  assert.match(css, /--motion-normal: 160ms/u);
  assert.match(css, /\.resq-page-grid/u);
  assert.match(css, /grid-template-columns: repeat\(12, minmax\(0, 1fr\)\)/u);
  assert.match(css, /prefers-reduced-motion: reduce/u);
});

test('package 04 upgrades dashboard hierarchy without reintroducing the heavy map preview', () => {
  const dashboard = read('src/features/dashboard/dashboard-page.tsx');
  const sections = read('src/features/dashboard/components/dashboard-sections.tsx');
  assert.match(dashboard, /xl:grid-cols-12/u);
  assert.match(dashboard, /xl:col-span-8/u);
  assert.match(sections, /2xl:grid-cols-8/u);
  assert.match(sections, /resq-card-interactive/u);
  assert.doesNotMatch(sections, /MapCanvas|MapProvider|react-leaflet/u);
});


test('package 05 makes form controls responsive and visually consistent', () => {
  const ui = read('src/components/ui/index.tsx');
  assert.match(ui, /h-11 w-full rounded-xl/u);
  assert.match(ui, /Select\(\{ value, onValueChange, options, placeholder = 'اختر', className, disabled = false/u);
  assert.match(ui, /min-w-0 items-center justify-between/u);
  assert.match(ui, /resq-filter-bar/u);
  assert.doesNotMatch(ui, /min-w-40/u);
});

test('package 05 upgrades table hierarchy without regressing controlled-state behavior', () => {
  const table = read('src/components/ui/data-table.tsx');
  assert.match(table, /rounded-2xl border border-border\/80 bg-surface shadow-card/u);
  assert.match(table, /sticky top-0 z-10/u);
  assert.match(table, /border-b border-border\/60 px-4 py-3\.5/u);
  assert.match(table, /DebouncedSearchInput/u);
  assert.match(table, /const search = state\?\.search \?\? localSearch/u);
});

test('package 05 uses transform-opacity motion and keeps reduced-motion escape hatches', () => {
  const css = read('src/index.css');
  const sidebar = read('src/components/layout/sidebar.tsx');
  assert.match(css, /@keyframes resq-dialog-in/u);
  assert.match(css, /@keyframes resq-drawer-in/u);
  assert.match(css, /@keyframes resq-shimmer/u);
  assert.match(css, /resq-mobile-nav-panel/u);
  assert.match(css, /prefers-reduced-motion: reduce/u);
  assert.doesNotMatch(sidebar, /backdrop-blur-xl/u);
});

test('package 06 hardens the shell for narrow mobile widths without GPU blur', () => {
  const shell = read('src/components/layout/app-shell.tsx');
  const header = read('src/components/layout/header.tsx');
  assert.match(shell, /px-3 py-4 sm:px-4/u);
  assert.doesNotMatch(shell, /blur-3xl/u);
  assert.match(header, /px-2\.5/u);
  assert.match(header, /hidden sm:inline-flex/u);
  assert.match(header, /hidden items-center gap-2 rounded-xl sm:flex/u);
});

test('package 06 adds responsive grid, safe-area and overflow protections', () => {
  const css = read('src/index.css');
  assert.match(css, /env\(safe-area-inset-bottom\)/u);
  assert.match(css, /@media \(max-width: 639px\)/u);
  assert.match(css, /grid-template-columns: minmax\(0, 1fr\)/u);
  assert.match(css, /overflow-wrap: anywhere/u);
  assert.match(css, /@media \(pointer: coarse\)/u);
});

test('package 06 keeps dialogs and tables usable on phones and production build output explicit', () => {
  const ui = read('src/components/ui/index.tsx');
  const table = read('src/components/ui/data-table.tsx');
  const vite = read('vite.config.ts');
  assert.match(ui, /flex flex-col-reverse gap-2 sm:flex-row/u);
  assert.match(table, /min-w-\[42rem\].*sm:min-w-\[48rem\]/u);
  assert.match(vite, /target: 'es2022'/u);
  assert.match(vite, /cssCodeSplit: true/u);
  assert.match(vite, /sourcemap: false/u);
});

test('final hardening provides shared safe display/date/number guards', () => {
  const safety = read('src/lib/runtime-safety.ts');
  assert.match(safety, /safeDisplayText/u);
  assert.match(safety, /safeFiniteNumber/u);
  assert.match(safety, /safeDate/u);
  assert.match(safety, /safeFormatDate/u);
  assert.match(safety, /isValidCoordinate/u);
  assert.match(safety, /Number\.isFinite/u);
});

test('final hardening prevents malformed API values from crashing shared UI and statuses', () => {
  const ui = read('src/components/ui/index.tsx');
  const statuses = read('src/lib/statuses.ts');
  assert.match(ui, /safeDisplayText/u);
  assert.match(ui, /onError=\{\(\) => setImageFailed\(true\)\}/u);
  assert.match(statuses, /status: SemanticStatus \| string \| null \| undefined/u);
  assert.match(statuses, /label: 'غير معروف', tone: 'neutral'/u);
});

test('final hardening filters invalid map coordinates instead of passing them to Leaflet', () => {
  const map = read('src/components/map/MapCanvas.tsx');
  assert.match(map, /isValidCoordinate/u);
  assert.match(map, /safeEntities/u);
  assert.match(map, /invalidEntityCount/u);
  assert.match(map, /تم تجاهل \{invalidEntityCount\} عنصر/u);
});

test('final hardening tolerates storage failures and synchronizes session changes across tabs', () => {
  const session = read('src/features/auth/session.tsx');
  assert.match(session, /safeStorageGet/u);
  assert.match(session, /safeStorageSet/u);
  assert.match(session, /safeStorageRemove/u);
  assert.match(session, /window\.addEventListener\('storage', onStorage\)/u);
});

test('final hardening sanitizes DataTable runtime pagination and server data inputs', () => {
  const table = read('src/components/ui/data-table.tsx');
  assert.match(table, /const safeData = Array\.isArray\(data\) \? data : \[\]/u);
  assert.match(table, /safePageSizeOptions/u);
  assert.match(table, /Number\.isFinite\(pageCount\)/u);
});
