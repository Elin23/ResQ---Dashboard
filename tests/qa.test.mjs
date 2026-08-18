import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const root = new URL('../', import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), 'utf8');

test('navigation stability keeps table state event-driven and URL updates idempotent', () => {
  const dataTable = read('src/components/ui/data-table.tsx');
  const searchParams = read('src/lib/search-params.ts');
  assert.doesNotMatch(dataTable, /useEffect\(\(\) => \{\s*onStateChange\?\./);
  assert.match(dataTable, /onSortingChange:\s*changeSorting/);
  assert.match(dataTable, /onPaginationChange:\s*changePagination/);
  assert.match(searchParams, /searchParamsEqual/);
  assert.match(searchParams, /setSearchParams\(next, \{ replace \}\)/);
  for (const relative of [
    'src/features/reports/pages/reports-page.tsx',
    'src/features/feeding-points/pages/feeding-points-page.tsx',
    'src/features/advertisements/pages/advertisements-page.tsx',
    'src/features/donations/pages/donations-page.tsx',
    'src/features/notifications/pages/notifications-page.tsx',
    'src/features/support/pages/support-page.tsx',
  ]) {
    assert.match(read(relative), /commitSearchParams/);
  }
});
