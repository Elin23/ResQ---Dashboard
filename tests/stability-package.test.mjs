import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');

test('stability package keeps the full-screen splash exclusive to bootstrap', () => {
  const app = read('src/app/app.tsx');
  const splash = read('src/components/feedback/app-splash.tsx');
  assert.match(app, /if \(isBootstrapping\)[\s\S]*return <AppSplashScreen/u);
  assert.match(app, /return <AppRouter/u);
  assert.doesNotMatch(app, /<AppRouter[\s\S]*<AppSplashScreen/u);
  assert.doesNotMatch(splash, /blur-3xl/u);
});

test('stability package contains route-local render recovery', () => {
  const shell = read('src/components/layout/app-shell.tsx');
  const boundary = read('src/routes/route-boundary.tsx');
  assert.match(shell, /<RouteRenderBoundary>[\s\S]*<Outlet \/>/u);
  assert.match(boundary, /getDerivedStateFromError/u);
  assert.match(boundary, /componentDidCatch/u);
  assert.match(boundary, /previousProps\.resetKey !== this\.props\.resetKey/u);
});

test('stored sessions are schema validated before RBAC rendering', () => {
  const session = read('src/features/auth/session.tsx');
  const rbac = read('src/features/auth/rbac.tsx');
  assert.match(session, /storedSessionSchema/u);
  assert.match(session, /z\.enum\(roles\)/u);
  assert.match(session, /safeParse/u);
  assert.match(session, /roleLabel: roleLabels\[result\.data\.role\]/u);
  assert.match(rbac, /permissionsForRole/u);
});

test('viewport surfaces and modal positioning avoid black-frame and RTL centering traps', () => {
  const css = read('src/index.css');
  const ui = read('src/components/ui/core/overlays.tsx');
  assert.match(css, /html,[\s\S]*body,[\s\S]*#root \{[\s\S]*border: 0;[\s\S]*outline: 0;[\s\S]*box-shadow: none;/u);
  assert.match(css, /overscroll-behavior: none/u);
  assert.match(ui, /fixed left-1\/2 top-1\/2/u);
  assert.doesNotMatch(ui, /fixed start-1\/2 top-1\/2/u);
});
