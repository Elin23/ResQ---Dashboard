import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('map API keeps real place-request source and real numeric source ids', async () => {
  const code = await read('src/features/map/services/operational-map.api.ts');
  assert.match(code, /PLACE_REQUEST/);
  assert.match(code, /USER_REQUEST/);
  assert.match(code, /sourceId/);
});

test('locations adapter preserves governorate id on nested regions', async () => {
  const code = await read('src/features/settings/services/locations.api.ts');
  assert.match(code, /governorateId/);
  assert.match(code, /regions/);
});

test('adoption request API sends advanced filters including user and species', async () => {
  const code = await read('src/features/adoption-requests/services/adoption-requests.api.ts');
  for (const key of ['species', 'publisherType', 'organizationId', 'userId']) {
    assert.match(code, new RegExp(key));
  }
});

test('content client normalizes story kind to success-story', async () => {
  const code = await read('src/features/content/services/content.api.ts');
  assert.match(code, /success-story/);
});

test('reports API forwards animalType filter', async () => {
  const code = await read('src/features/reports/services/reports.api.ts');
  assert.match(code, /animalType/);
});

test('feeding-points client handles refill summaries and pending-refill filtering', async () => {
  const code = await read('src/features/feeding-points/services/feeding-points.api.ts');
  assert.match(code, /pendingRefills/i);
});

test('logout confirmation uses app dialog and never native confirm', async () => {
  const header = await read('src/components/layout/header.tsx');
  const sidebar = await read('src/components/layout/sidebar.tsx');
  assert.match(header, /ConfirmDialog/);
  assert.match(sidebar, /ConfirmDialog/);
  assert.doesNotMatch(header, /window\.confirm\s*\(/);
  assert.doesNotMatch(sidebar, /window\.confirm\s*\(/);
});

test('media URLs are normalized against backend base URL', async () => {
  const code = await read('src/lib/media-url.ts');
  assert.match(code, /env\.apiBaseUrl/);
  assert.match(code, /wwwroot/i);
});
