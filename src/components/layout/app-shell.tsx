import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import {
  Outlet,
  useLocation,
} from 'react-router';

import {
  Header,
} from './header';

import {
  Sidebar,
} from './sidebar';

import {
  DevelopmentRoleSwitcher,
} from '@/features/foundation/development-role-switcher';

import {
  RouteRenderBoundary,
} from '@/routes/route-boundary';

export function AppShell() {
  const [
    collapsed,
    setCollapsed,
  ] = useState(false);

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const mainRef =
    useRef<HTMLElement>(
      null,
    );

  const location =
    useLocation();

  const toggleCollapsed =
    useCallback(
      () =>
        setCollapsed(
          (value) =>
            !value,
        ),
      [],
    );

  const openMobileSidebar =
    useCallback(
      () =>
        setMobileOpen(
          true,
        ),
      [],
    );

  useLayoutEffect(() => {
    const main =
      mainRef.current;

    if (!main) {
      return;
    }

    main.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    });
  }, [
    location.pathname,
  ]);

  return (
    <div
      className="
        relative
        flex
        h-dvh
        overflow-hidden
        bg-background
      "
    >
      <Sidebar
        collapsed={
          collapsed
        }
        onToggleCollapsed={
          toggleCollapsed
        }
        mobileOpen={
          mobileOpen
        }
        onMobileOpenChange={
          setMobileOpen
        }
      />

      <div
        className="
          relative
          flex
          min-w-0
          flex-1
          flex-col
          overflow-hidden
        "
      >
        <Header
          onOpenSidebar={
            openMobileSidebar
          }
        />

        <main
          ref={mainRef}
          id="main-content"
          className="
            resq-scroll-region
            relative
            min-h-0
            flex-1
            overflow-y-auto
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              h-48
              overflow-hidden
              sm:h-56
            "
            aria-hidden="true"
          >
            <div
              className="
                resq-surface-grid
                absolute
                inset-0
                opacity-45
                sm:opacity-55
              "
            />

            <div
              className="
                absolute
                -end-24
                -top-36
                size-80
                rounded-full
                bg-[radial-gradient(circle,hsl(var(--color-primary)/0.10),transparent_68%)]
              "
            />
          </div>

          <div
            className="
              relative
              mx-auto
              w-full
              max-w-[104rem]
              px-3
              py-4
              sm:px-4
              sm:py-5
              md:px-6
              md:py-7
              xl:px-8
              xl:py-8
            "
          >
            <RouteRenderBoundary>
              <Outlet />
            </RouteRenderBoundary>
          </div>
        </main>
      </div>

      <DevelopmentRoleSwitcher />
    </div>
  );
}