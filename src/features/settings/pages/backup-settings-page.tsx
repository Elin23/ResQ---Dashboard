import { DatabaseBackup } from 'lucide-react';
import { ErrorState, PageHeader, Skeleton } from '@/components/ui';
import { PermissionGuard } from '@/features/auth/rbac';
import { BackupSettingsManager } from '../components/settings-components';
import { useSystemSettings } from '../hooks';

export function BackupSettingsPage() {
  const query = useSystemSettings();

  if (query.isLoading) {
    return <Skeleton className="h-[32rem] rounded-xl" />;
  }

  if (query.isError) {
    return (
      <ErrorState
        title="تعذر تحميل إعدادات النسخ الاحتياطي"
        description="تعذر قراءة إعدادات النسخ الحالية. حاول إعادة التحميل."
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (!query.data) return null;

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="النسخ الاحتياطي"
        description="إدارة النسخ التلقائية وسياسة الاحتفاظ وإنشاء نسخة يدوية عند الحاجة."
        breadcrumbs={[
          { label: 'الإعدادات', href: '/settings' },
          { label: 'النسخ الاحتياطي' },
        ]}
        actions={
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary/[0.07] text-primary">
            <DatabaseBackup className="size-4" strokeWidth={1.7} />
          </span>
        }
      />

      <PermissionGuard
        permission="settings.update"
        fallback={<BackupSettingsManager settings={query.data} readOnly />}
      >
        <BackupSettingsManager settings={query.data} />
      </PermissionGuard>
    </div>
  );
}
