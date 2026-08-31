import { DatabaseBackup, MapPinned, PhoneCall, ShieldCheck, UsersRound } from 'lucide-react';
import { Link } from 'react-router';
import { Card, PageHeader } from '@/components/ui';
import { PermissionGuard } from '@/features/auth/rbac';

const cards = [
  {
    title: 'إدارة المسؤولين',
    description: 'حسابات فريق الإدارة وحالة الوصول والأدوار الممنوحة.',
    href: '/settings/admin-users',
    icon: UsersRound,
    permission: 'admins.read' as const,
  },
  {
    title: 'الأدوار والصلاحيات',
    description: 'إدارة الأدوار والصلاحيات الإدارية لكل مسؤول.',
    href: '/settings/roles',
    icon: ShieldCheck,
    permission: 'roles.read' as const,
  },
  {
    title: 'المحافظات والمناطق',
    description: 'إدارة المحافظات والمناطق النشطة وربط كل منطقة بمحافظتها.',
    href: '/settings/locations',
    icon: MapPinned,
    permission: 'settings.read' as const,
  },
  {
    title: 'جهات اتصال الطوارئ',
    description: 'إضافة وتعديل وتعطيل أرقام وجهات الطوارئ الظاهرة للمستخدمين.',
    href: '/settings/emergency-contacts',
    icon: PhoneCall,
    permission: 'settings.read' as const,
  },
  {
    title: 'النسخ الاحتياطي',
    description: 'إدارة الجدولة وسياسة الاحتفاظ وإنشاء نسخة احتياطية يدوية.',
    href: '/settings/backups',
    icon: DatabaseBackup,
    permission: 'settings.read' as const,
  },
];

export function SettingsLandingPage() {
  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="الإعدادات"
        description="إدارة الوصول الإداري، المواقع المرجعية، جهات اتصال الطوارئ والنسخ الاحتياطي."
        breadcrumbs={[
          { label: 'الرئيسية', href: '/dashboard' },
          { label: 'الإعدادات' },
        ]}
      />

      {/* Show only the settings sections allowed by the current admin permissions. */}
      <div className="grid gap-3 md:grid-cols-2">
        {cards.map(({ title, description, href, icon: Icon, permission }) => (
          <PermissionGuard key={href} permission={permission}>
            <Link
              to={href}
              className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              <Card className="h-full rounded-xl border-border/45 bg-white p-4 shadow-none transition-[border-color,background-color] duration-200 group-hover:border-primary/20 group-hover:bg-primary/[0.02]">
                <div className="flex items-start gap-3.5">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.07] text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-4" strokeWidth={1.7} />
                  </span>

                  <div className="min-w-0">
                    <h2 className="text-[14px] font-semibold text-foreground">{title}</h2>
                    <p className="mt-1.5 text-[12px] leading-5 text-muted-foreground">{description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          </PermissionGuard>
        ))}
      </div>
    </div>
  );
}