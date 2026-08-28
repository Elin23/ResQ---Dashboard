import { ChevronLeft, ChevronRight, LogOut, X } from 'lucide-react';
import { NavLink } from 'react-router';

import { IconButton, Tooltip } from '@/components/ui';
import { routeGroups } from '@/routes/module-routes';
import { rolePermissions } from '@/features/auth/permissions';
import { useSession } from '@/features/auth/session';
import { cn } from '@/lib/cn';

function SidebarLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: (typeof routeGroups)[number]['items'][number];
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const content = (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group flex w-full items-center rounded-xl text-[13px] font-medium transition-colors duration-150',
          collapsed
            ? 'mx-auto size-10 justify-center px-0'
            : 'h-10 gap-2.5 px-3',
          isActive
            ? 'bg-primary/[0.09] text-primary'
            : 'text-muted-foreground hover:bg-muted/65 hover:text-foreground',
        )
      }
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg transition-colors duration-150',
          collapsed ? 'size-10' : 'size-8',
          'text-muted-foreground group-hover:text-foreground group-[.active]:text-primary',
        )}
      >
        <item.icon
          className="size-[17px]"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </span>

      {!collapsed && (
        <span className="min-w-0 flex-1 truncate">
          {item.label}
        </span>
      )}
    </NavLink>
  );

  return collapsed ? (
    <Tooltip content={item.label}>
      {content}
    </Tooltip>
  ) : (
    content
  );
}

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onMobileOpenChange,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}) {
  const { session, logout } = useSession();

  const visibleGroups = routeGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          !item.permission ||
          Boolean(
            session &&
              rolePermissions[session.role]?.has(item.permission),
          ),
      ),
    }))
    .filter((group) => group.items.length > 0);

  const aside = (mobile: boolean) => {
    const isCollapsed = collapsed && !mobile;

    return (
      <aside
        className={cn(
          'flex h-dvh flex-col border-s border-border/40 bg-white transition-[width] duration-200',
          !mobile && (collapsed ? 'w-[4.25rem]' : 'w-[15rem]'),
          mobile && 'w-[min(84vw,16rem)]',
        )}
      >
        <div
          className={cn(
            'flex h-header items-center border-b border-border/40 px-3',
            isCollapsed ? 'justify-center' : 'gap-2',
          )}
        >
          <div
            className={cn(
              'flex min-w-0 items-center',
              isCollapsed ? 'justify-center' : 'flex-1 gap-3',
            )}
          >
            <div
              dir="ltr"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/[0.07] text-xs font-bold tracking-[-0.04em] text-primary"
            >
              RQ
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  ResQ
                </p>

                <p className="mt-0.5 truncate text-[10px] font-normal text-muted-foreground/65">
                  لوحة الإدارة
                </p>
              </div>
            )}
          </div>

          {mobile ? (
            <IconButton
              label="إغلاق القائمة"
              onClick={() => onMobileOpenChange(false)}
            >
              <X className="size-[18px]" />
            </IconButton>
          ) : (
            !isCollapsed && (
              <button
                type="button"
                onClick={onToggleCollapsed}
                aria-label="طي القائمة"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-[background-color,color,transform] duration-150 hover:scale-[1.03] hover:bg-primary/[0.055] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
              >
                <ChevronRight
                  className="size-4"
                  strokeWidth={1.75}
                />
              </button>
            )
          )}
        </div>

        {isCollapsed && !mobile && (
          <div className="flex justify-center px-2 pt-3">
            <Tooltip content="توسيع القائمة">
              <button
                type="button"
                onClick={onToggleCollapsed}
                aria-label="توسيع القائمة"
                className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-[background-color,color,transform] duration-150 hover:scale-[1.03] hover:bg-primary/[0.055] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
              >
                <ChevronLeft
                  className="size-4"
                  strokeWidth={1.75}
                />
              </button>
            </Tooltip>
          </div>
        )}

        <nav
          aria-label="التنقل الرئيسي"
          className={cn(
            'min-h-0 flex-1 overflow-y-auto py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
            isCollapsed ? 'px-2' : 'px-2.5',
          )}
        >
          {visibleGroups.map((group, groupIndex) => (
            <div
              key={group.label}
              className={cn(
                groupIndex < visibleGroups.length - 1 && 'mb-5',
              )}
            >
              {!isCollapsed && (
                <h2 className="mb-2 px-3 text-[10px] font-normal tracking-normal text-muted-foreground/55">
                  {group.label}
                </h2>
              )}

              <div className="space-y-1">
                {group.items.map((item) => (
                  <SidebarLink
                    key={item.path}
                    item={item}
                    collapsed={isCollapsed}
                    onNavigate={
                      mobile
                        ? () => onMobileOpenChange(false)
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {session && (
          <div
            className={cn(
              'border-t border-border/40',
              isCollapsed ? 'p-2' : 'p-2.5',
            )}
          >
            {isCollapsed ? (
              <Tooltip content="تسجيل الخروج">
                <button
                  type="button"
                  onClick={logout}
                  aria-label="تسجيل الخروج"
                  className="mx-auto flex size-10 items-center justify-center rounded-xl bg-critical/[0.07] text-critical transition-[background-color,color,transform] duration-150 hover:scale-[1.04] hover:bg-critical/[0.14] hover:text-critical focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-critical/25"
                >
                  <LogOut
                    className="size-[17px]"
                    strokeWidth={1.8}
                  />
                </button>
              </Tooltip>
            ) : (
              <button
                type="button"
                onClick={logout}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-critical/[0.07] px-3 text-[13px] font-medium text-critical transition-[background-color,color,transform] duration-150 hover:-translate-y-px hover:bg-critical/[0.14] hover:text-critical focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-critical/25"
              >
                <LogOut
                  className="size-[16px]"
                  strokeWidth={1.8}
                />

                تسجيل الخروج
              </button>
            )}
          </div>
        )}
      </aside>
    );
  };

  return (
    <>
      <div className="hidden h-dvh shrink-0 lg:block">
        {aside(false)}
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="إغلاق القائمة"
            className="absolute inset-0 bg-black/10"
            onClick={() => onMobileOpenChange(false)}
          />

          <div className="absolute inset-y-0 end-0">
            {aside(true)}
          </div>
        </div>
      )}
    </>
  );
}