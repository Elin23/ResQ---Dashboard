import { Bell, LogOut, Menu, Settings, UserRound, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, IconButton } from '@/components/ui';
import { usePermission } from '@/features/auth/rbac';
import { useSession } from '@/features/auth/session';
import { useNotificationSummary } from '@/features/notifications/hooks';
import { isNotificationSoundEnabled, playNotificationChime, setNotificationSoundEnabled } from '@/features/notifications/services/notification-sound';
import { allModuleRoutes } from '@/routes/module-routes';

function resolveCurrentRoute(pathname: string) {
  return allModuleRoutes
    .filter((route) => pathname === route.path || pathname.startsWith(`${route.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0];
}

function attentionStorageKey(adminId?: string) {
  return `resq-notification-attention-seen:${adminId ?? 'anonymous'}`;
}

export function Header({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, logout } = useSession();
  const canReadNotifications = usePermission('notifications.read');
  const canReadAdmins = usePermission('admins.read');
  const current = resolveCurrentRoute(location.pathname);
  const notificationSummary = useNotificationSummary(canReadNotifications);
  const attentionCount = notificationSummary.data?.partiallySent ?? 0;
  const [acknowledgedAttentionCount, setAcknowledgedAttentionCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(() => isNotificationSoundEnabled());
  const unreadAttentionCount = Math.max(0, attentionCount - acknowledgedAttentionCount);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(attentionStorageKey(session?.id)) ?? 0);
    setAcknowledgedAttentionCount(Number.isFinite(stored) ? Math.max(0, stored) : 0);
  }, [session?.id]);

  useEffect(() => {
    if (attentionCount < acknowledgedAttentionCount) {
      window.localStorage.setItem(attentionStorageKey(session?.id), String(attentionCount));
      setAcknowledgedAttentionCount(attentionCount);
    }
  }, [acknowledgedAttentionCount, attentionCount, session?.id]);

  useEffect(() => {
    if (!location.pathname.startsWith('/notifications') || attentionCount <= acknowledgedAttentionCount) {
      return;
    }

    window.localStorage.setItem(attentionStorageKey(session?.id), String(attentionCount));
    setAcknowledgedAttentionCount(attentionCount);
  }, [acknowledgedAttentionCount, attentionCount, location.pathname, session?.id]);

  const acknowledgeNotifications = () => {
    window.localStorage.setItem(attentionStorageKey(session?.id), String(attentionCount));
    setAcknowledgedAttentionCount(attentionCount);
  };

  const toggleSound = () => {
    const next = !soundEnabled;

    setNotificationSoundEnabled(next);
    setSoundEnabled(next);

    if (next) {
      playNotificationChime();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-header items-center gap-3 border-b border-border/40 bg-white/95 px-4 backdrop-blur-sm sm:px-6">
      <IconButton label="فتح القائمة" className="lg:hidden" onClick={onOpenSidebar}>
        <Menu className="size-5" />
      </IconButton>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[15px] font-bold text-foreground">{current?.label ?? 'لوحة ResQ'}</h1>
        <p className="mt-0.5 hidden truncate text-xs text-muted-foreground/80 sm:block">{current?.description ?? 'إدارة ومتابعة عمليات المنصة'}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {canReadNotifications && (
          <IconButton
            label={soundEnabled ? 'كتم نغمة الإشعارات' : 'تفعيل نغمة الإشعارات'}
            className="hidden rounded-xl text-muted-foreground transition-colors duration-150 hover:bg-primary/5 hover:text-primary focus-visible:ring-primary/40 sm:inline-flex"
            onClick={toggleSound}
          >
            {soundEnabled ? <Volume2 className="size-[18px]" /> : <VolumeX className="size-[18px]" />}
          </IconButton>
        )}

        {canReadNotifications && (
          <Link
            to="/notifications"
            onClick={acknowledgeNotifications}
            aria-label={unreadAttentionCount > 0 ? `فتح الإشعارات، ${unreadAttentionCount} غير مقروءة` : 'فتح الإشعارات'}
            className="relative inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Bell className="size-[18px]" />

            {unreadAttentionCount > 0 && (
              <span className="absolute -end-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-critical px-1 text-[9px] font-bold leading-4 text-white ring-2 ring-white" aria-hidden="true">
                {unreadAttentionCount > 9 ? '9+' : unreadAttentionCount}
              </span>
            )}
          </Link>
        )}

        {session && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`فتح قائمة حساب ${session.name}`}
                className="ms-1 inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/10 bg-primary/[0.055] text-primary transition-colors duration-150 hover:border-primary/20 hover:bg-primary/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
              >
                {session.avatarUrl ? (
                  <img src={session.avatarUrl} alt="" className="size-full object-cover" />
                ) : (
                  <UserRound className="size-[19px]" strokeWidth={1.8} />
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              <div className="px-3 py-2.5">
                <p className="truncate text-sm font-semibold text-foreground">{session.name}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{session.roleLabel}</p>
              </div>

              <div className="my-1 h-px bg-border/60" />

              {canReadAdmins && (
                <DropdownMenuItem onSelect={() => navigate(`/settings/admin-users/${session.id}`)}>
                  <Settings className="size-4" />
                  إدارة الحساب
                </DropdownMenuItem>
              )}

              {canReadNotifications && (
                <DropdownMenuItem onSelect={toggleSound}>
                  {soundEnabled ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                  {soundEnabled ? 'كتم نغمة الإشعارات' : 'تفعيل نغمة الإشعارات'}
                </DropdownMenuItem>
              )}

              <DropdownMenuItem className="text-critical data-[highlighted]:bg-critical/[0.07] data-[highlighted]:text-critical" onSelect={handleLogout}>
                <LogOut className="size-4" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
