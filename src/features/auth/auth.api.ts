import { z } from 'zod';
import { env } from '@/config/env';
import { apiClient } from '@/services/api/client';
import { clearAuthTokens, setAuthTokens } from '@/services/api/auth-tokens';
import { authenticateMockAdmin, type AuthenticatedAdmin } from './mock-auth';
import { roleLabels, type AdminRole } from './permissions';

const tokenResponseSchema = z.object({
  accessToken: z.string().optional(),
  token: z.string().optional(),
  jwt: z.string().optional(),
  access_token: z.string().optional(),
  refreshToken: z.string().optional(),
  refresh_token: z.string().optional(),
}).passthrough();

function unwrap(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  const record = value as Record<string, unknown>;
  return record.data ?? record.result ?? value;
}

function readString(record: Record<string, unknown>, names: readonly string[]): string | undefined {
  for (const name of names) {
    const value = record[name];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}


function readRoleName(record: Record<string, unknown>): string | undefined {
  const direct = readString(record, ['roleName']);
  if (direct) return direct;

  const role = record.role;
  if (typeof role === 'string' && role.trim()) return role.trim();
  if (role && typeof role === 'object') {
    const nested = role as Record<string, unknown>;
    const nestedName = readString(nested, ['name', 'roleName', 'code']);
    if (nestedName) return nestedName;
  }

  const roles = record.roles;
  if (Array.isArray(roles)) {
    for (const item of roles) {
      if (typeof item === 'string' && item.trim()) return item.trim();
      if (item && typeof item === 'object') {
        const nestedName = readString(item as Record<string, unknown>, ['name', 'roleName', 'code']);
        if (nestedName) return nestedName;
      }
    }
  }

  return undefined;
}

function readPermissions(record: Record<string, unknown>): string[] {
  const direct = record.permissions;
  if (Array.isArray(direct)) return direct.filter((item): item is string => typeof item === 'string');

  const role = record.role;
  if (role && typeof role === 'object') {
    const nested = (role as Record<string, unknown>).permissions;
    if (Array.isArray(nested)) return nested.filter((item): item is string => typeof item === 'string');
  }

  const roles = record.roles;
  if (Array.isArray(roles)) {
    const merged = new Set<string>();
    for (const item of roles) {
      if (!item || typeof item !== 'object') continue;
      const nested = (item as Record<string, unknown>).permissions;
      if (!Array.isArray(nested)) continue;
      for (const permission of nested) {
        if (typeof permission === 'string' && permission.trim()) merged.add(permission.trim());
      }
    }
    if (merged.size) return [...merged];
  }

  return [];
}

export interface ApiAdminSession extends AuthenticatedAdmin {
  permissions: string[];
  avatarUrl?: string;
}

export async function loginAdmin(email: string, password: string, remember: boolean): Promise<ApiAdminSession | null> {
  if (env.dataSource === 'mock') {
    const mock = authenticateMockAdmin(email, password);
    return mock ? { ...mock, permissions: [] } : null;
  }

  const raw = await apiClient.request<unknown>('/api/dashboard/auth/login', {
    method: 'POST',
    body: { email, password },
    skipAuth: true,
    skipRefresh: true,
  });

  const payload = unwrap(raw);
  const parsed = tokenResponseSchema.safeParse(payload);
  const tokenRecord = parsed.success ? parsed.data : {};
  const accessToken = tokenRecord.accessToken ?? tokenRecord.token ?? tokenRecord.jwt ?? tokenRecord.access_token;
  const refreshToken = tokenRecord.refreshToken ?? tokenRecord.refresh_token;

  if (!accessToken) throw new Error('لم يرسل الخادم رمز تسجيل دخول صالحًا. حاول تسجيل الدخول مرة أخرى.');
  setAuthTokens({ accessToken, refreshToken }, remember);

  try {
    return await getCurrentAdmin();
  } catch (error) {
    clearAuthTokens();
    throw error;
  }
}

export async function getCurrentAdmin(): Promise<ApiAdminSession> {
  const raw = await apiClient.get<unknown>('/api/dashboard/auth/me');
  const payload = unwrap(raw);
  if (!payload || typeof payload !== 'object') throw new Error('تعذر قراءة بيانات الحساب من الخادم.');

  const record = payload as Record<string, unknown>;
  const id = readString(record, ['id', 'userId', 'adminId']) ?? '';
  const email = readString(record, ['email', 'username', 'userName']) ?? '';
  const name = readString(record, ['name', 'fullName', 'displayName']) ?? email;
  const roleName = readRoleName(record) ?? 'ADMIN';
  const avatarUrl = readString(record, ['avatarUrl', 'imageUrl', 'photoUrl']);

  if (!id || !email) throw new Error('بيانات الحساب المستلمة من الخادم غير مكتملة.');

  return {
    id,
    name,
    username: email,
    role: roleName as AdminRole,
    roleLabel: roleLabels[roleName as AdminRole] ?? roleName,
    permissions: readPermissions(record),
    avatarUrl,
  };
}

export async function logoutAdmin(): Promise<void> {
  if (env.dataSource === 'api') {
    try {
      await apiClient.post('/api/dashboard/auth/logout');
    } catch {
      // Local sign-out must still succeed if the backend session is already expired.
    }
  }
  clearAuthTokens();
}
