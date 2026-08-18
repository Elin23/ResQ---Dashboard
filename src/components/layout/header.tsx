import {
  Bell,
  Menu,
  UserRound,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useState } from 'react';
import {
  Link,
  useLocation,
} from 'react-router';

import {
  IconButton,
} from '@/components/ui';

import {
  usePermission,
} from '@/features/auth/rbac';

import {
  useSession,
} from '@/features/auth/session';

import {
  isNotificationSoundEnabled,
  playNotificationChime,
  setNotificationSoundEnabled,
} from '@/features/notifications/services/notification-sound';

import {
  allModuleRoutes,
} from '@/routes/module-routes';

function resolveCurrentRoute(
  pathname: string,
) {
  return allModuleRoutes
    .filter(
      (route) =>
        pathname === route.path ||
        pathname.startsWith(`${route.path}/`),
    )
    .sort(
      (a, b) =>
        b.path.length - a.path.length,
    )[0];
}

export function Header({
  onOpenSidebar,
}: {
  onOpenSidebar: () => void;
}) {
  const location = useLocation();
  const { session } = useSession();

  const canReadNotifications =
    usePermission('notifications.read');

  const current =
    resolveCurrentRoute(location.pathname);

  const [
    soundEnabled,
    setSoundEnabled,
  ] = useState(() =>
    isNotificationSoundEnabled(),
  );

  const toggleSound = () => {
    const next = !soundEnabled;

    setNotificationSoundEnabled(next);
    setSoundEnabled(next);

    if (next) {
      playNotificationChime();
    }
  };

  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        h-header
        items-center
        gap-3
        border-b
        border-border/40
        bg-white/95
        px-4
        sm:px-6
      "
    >
      <IconButton
        label="فتح القائمة"
        className="lg:hidden"
        onClick={onOpenSidebar}
      >
        <Menu className="size-5" />
      </IconButton>

      <div className="min-w-0 flex-1">
        <h1
          className="
            truncate
            text-[15px]
            font-bold
            text-foreground
          "
        >
          {current?.label ?? 'لوحة ResQ'}
        </h1>

        <p
          className="
            mt-0.5
            hidden
            truncate
            text-xs
            text-muted-foreground/80
            sm:block
          "
        >
          {current?.description ??
            'الإدارة المركزية للمنصة'}
        </p>
      </div>

      <div
        className="
          flex
          shrink-0
          items-center
          gap-1.5
        "
      >
        {canReadNotifications && (
  <IconButton
    label={
      soundEnabled
        ? 'كتم نغمة الإشعارات'
        : 'تفعيل نغمة الإشعارات'
    }
    className="
      hidden
      rounded-xl
      text-muted-foreground
      transition-colors
      duration-150
      hover:bg-primary/5
      hover:text-primary
      focus-visible:ring-primary/40
      sm:inline-flex
    "
    onClick={toggleSound}
  >
    {soundEnabled ? (
      <Volume2 className="size-[18px]" />
    ) : (
      <VolumeX className="size-[18px]" />
    )}
  </IconButton>
)}
        {canReadNotifications && (
          <Link
            to="/notifications"
            aria-label="فتح الإشعارات"
            className="
              relative
              inline-flex
              size-10
              items-center
              justify-center
              rounded-full
              text-muted-foreground
              transition-colors
              duration-150
              hover:bg-primary/5
              hover:text-primary
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary/40
            "
          >
            <Bell className="size-[18px]" />

            <span
              className="
                absolute
                end-2
                top-2
                size-1.5
                rounded-full
                bg-critical
                ring-2
                ring-white
              "
              aria-hidden="true"
            />
          </Link>
        )}

        {session && (
          <button
            type="button"
            aria-label={`حساب ${session.name}`}
            className="
              ms-1
              inline-flex
              size-10
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-full
              border
              border-primary/10
              bg-primary/[0.055]
              text-primary
              transition-colors
              duration-150
              hover:border-primary/20
              hover:bg-primary/[0.09]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary/30
              focus-visible:ring-offset-2
            "
          >
            {session.avatarUrl ? (
              <img
                src={session.avatarUrl}
                alt={session.name}
                className="
                  size-full
                  object-cover
                "
              />
            ) : (
              <UserRound
                className="size-[19px]"
                strokeWidth={1.8}
              />
            )}
          </button>
        )}
      </div>
    </header>
  );
}