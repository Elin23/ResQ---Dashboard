import { roleLabels, type AdminRole } from './permissions';

export interface MockAdminCredential {
  id: string;
  name: string;
  username: string;
  password: string;
  role: AdminRole;
}

export const mockAdminCredentials: readonly MockAdminCredential[] = [
  { id: 'ADM-006', name: 'ميساء الدروبي', username: 'superadmin', password: 'ResQ@Super2026', role: 'SUPER_ADMIN' },
  { id: 'ADM-001', name: 'أحمد الخطيب', username: 'operations', password: 'ResQ@Ops2026', role: 'OPERATIONS_ADMIN' },
  { id: 'ADM-002', name: 'رنا محمد', username: 'reviewer', password: 'ResQ@Review2026', role: 'ORGANIZATION_REVIEWER' },
  { id: 'ADM-003', name: 'ليان يوسف', username: 'content', password: 'ResQ@Content2026', role: 'CONTENT_MANAGER' },
  { id: 'ADM-004', name: 'سامر حسن', username: 'support', password: 'ResQ@Support2026', role: 'SUPPORT_AGENT' },
  { id: 'ADM-005', name: 'نور المصري', username: 'finance', password: 'ResQ@Finance2026', role: 'FINANCE_ADMIN' },
] as const;

export interface AuthenticatedAdmin {
  id: string;
  name: string;
  username: string;
  role: AdminRole;
  roleLabel: string;
}

export function authenticateMockAdmin(username: string, password: string): AuthenticatedAdmin | null {
  const normalizedUsername = username.trim().toLowerCase();
  const credential = mockAdminCredentials.find((item) => item.username === normalizedUsername && item.password === password);
  if (!credential) return null;
  return {
    id: credential.id,
    name: credential.name,
    username: credential.username,
    role: credential.role,
    roleLabel: roleLabels[credential.role],
  };
}

export function getDevelopmentAdminForRole(role: AdminRole): AuthenticatedAdmin {
  const credential = mockAdminCredentials.find((item) => item.role === role);
  if (!credential) throw new Error('لم يتم العثور على حساب تجريبي لهذا الدور.');
  return {
    id: credential.id,
    name: credential.name,
    username: credential.username,
    role: credential.role,
    roleLabel: roleLabels[credential.role],
  };
}
