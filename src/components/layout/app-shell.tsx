import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { RouteRenderBoundary } from '@/routes/route-boundary';

const SIDEBAR_STORAGE_KEY = 'resq-admin-sidebar-collapsed';

function readCollapsedState() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeCollapsedState(collapsed: boolean) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  } catch {
    // The sidebar still works when persistent browser storage is unavailable.
  }
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(readCollapsedState);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();

  const toggleCollapsed = useCallback(() => {
    setCollapsed((value) => {
      const next = !value;
      writeCollapsedState(next);
      return next;
    });
  }, []);

  const openMobileSidebar = useCallback(() => {
    setMobileOpen(true);
  }, []);

  // Reset the page scroll and close transient navigation whenever the route changes.
  useLayoutEffect(() => {
    setMobileOpen(false);

    const main = mainRef.current;

    if (!main) {
      return;
    }

    main.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="relative flex h-dvh overflow-hidden bg-background">
      <Sidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} />

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header onOpenSidebar={openMobileSidebar} />

        <main ref={mainRef} id="main-content" className="resq-scroll-region relative min-h-0 flex-1 overflow-y-auto">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48 overflow-hidden sm:h-56" aria-hidden="true">
            <div className="resq-surface-grid absolute inset-0 opacity-45 sm:opacity-55" />
            <div className="absolute -end-24 -top-36 size-80 rounded-full bg-[radial-gradient(circle,hsl(var(--color-primary)/0.10),transparent_68%)]" />
          </div>

          <div className="relative mx-auto w-full max-w-[104rem] px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-7 xl:px-8 xl:py-8">
            <RouteRenderBoundary>
              <Outlet />
            </RouteRenderBoundary>
          </div>
        </main>
      </div>

      {/* <DevelopmentRoleSwitcher /> */}
    </div>
  );
}
