import { ShieldCheck } from 'lucide-react';
import { Select } from '@/components/ui';
import { roleLabels, roles } from '@/features/auth/permissions';
import { useSession } from '@/features/auth/session';

export function DevelopmentRoleSwitcher() {
  const { session, setDevelopmentRole } = useSession();
  if (!session) return null;
  return <div className="fixed bottom-4 end-4 z-40 hidden items-center gap-2 rounded-lg border bg-surface p-2 shadow-overlay md:flex"><ShieldCheck className="size-4 text-primary" /><span className="text-xs font-semibold">اختبار الصلاحيات</span><Select value={session.role} onValueChange={(value) => { const role = roles.find((item) => item === value); if (role) setDevelopmentRole(role); }} options={roles.map((role) => ({ value: role, label: roleLabels[role] }))} /></div>;
}
