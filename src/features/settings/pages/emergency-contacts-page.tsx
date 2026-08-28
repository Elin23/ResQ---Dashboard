import { PhoneCall } from 'lucide-react';

import { ErrorState, PageHeader, Skeleton } from '@/components/ui';
import { PermissionGuard } from '@/features/auth/rbac';

import { EmergencyContactsManager } from '../components/settings-components';
import { useSystemSettings } from '../hooks';

export function EmergencyContactsPage() {
  const query = useSystemSettings();

  if (query.isLoading) {
    return <Skeleton className="h-[30rem] rounded-xl" />;
  }

  if (query.isError) {
    return (
      <ErrorState
        title="تعذر تحميل جهات اتصال الطوارئ"
        description="تعذر قراءة جهات الاتصال الحالية. حاول إعادة التحميل."
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (!query.data) {
    return null;
  }

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="جهات اتصال الطوارئ"
        description="إدارة الجهات والأرقام التي يمكن إظهارها للمستخدمين عند الحاجة إلى مساعدة طارئة."
        breadcrumbs={[
          { label: 'الإعدادات', href: '/settings' },
          { label: 'جهات اتصال الطوارئ' },
        ]}
        actions={
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary/[0.07] text-primary">
            <PhoneCall className="size-4" strokeWidth={1.7} />
          </span>
        }
      />

      {/* Keep emergency contacts visible even when the user has read-only access. */}
      <PermissionGuard
        permission="settings.update"
        fallback={
          <EmergencyContactsManager
            settings={query.data}
            readOnly
          />
        }
      >
        <EmergencyContactsManager settings={query.data} />
      </PermissionGuard>
    </div>
  );
}