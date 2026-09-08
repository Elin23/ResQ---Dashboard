import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { env } from '@/config/env';
import { clearAuthTokens, getAccessToken } from '@/services/api/auth-tokens';
import { AUTH_EXPIRED_EVENT } from '@/services/api/auth-events';
import { getDevelopmentAdminForRole } from './mock-auth';
import { getCurrentAdmin, loginAdmin, logoutAdmin } from './auth.api';
import { type AdminRole } from './permissions';

export interface AdminSession {
  id: string;
  name: string;
  username: string;
  role: AdminRole;
  roleLabel: string;
  permissions: string[];
  avatarUrl?: string;
}

interface SessionContextValue {
  session: AdminSession | null;
  isBootstrapping: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  setDevelopmentRole: (role: AdminRole) => void;
}

const STORAGE_KEY = 'resq-admin-session';
const SessionContext = createContext<SessionContextValue | null>(null);

function safeStorageGet(storage: Storage, key: string): string | null {
  try { return storage.getItem(key); } catch { return null; }
}
function safeStorageSet(storage: Storage, key: string, value: string): boolean {
  try { storage.setItem(key, value); return true; } catch { return false; }
}
function safeStorageRemove(storage: Storage, key: string): void {
  try { storage.removeItem(key); } catch { /* noop */ }
}

const storedSessionSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  username: z.string().trim().min(1),
  role: z.string().trim().min(1),
  roleLabel: z.string().trim().min(1),
  permissions: z.array(z.string()).default([]),
  avatarUrl: z.string().url().optional(),
}).strip();

function readStoredSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  const raw = safeStorageGet(window.localStorage, STORAGE_KEY) ?? safeStorageGet(window.sessionStorage, STORAGE_KEY);
  if (!raw) return null;

  try {
    const result = storedSessionSchema.safeParse(JSON.parse(raw));
    if (!result.success) return null;
    return result.data as AdminSession;
  } catch {
    return null;
  }
}

function clearStoredSession() {
  if (typeof window === 'undefined') return;
  safeStorageRemove(window.localStorage, STORAGE_KEY);
  safeStorageRemove(window.sessionStorage, STORAGE_KEY);
}

function persistSession(session: AdminSession, remember: boolean): boolean {
  clearStoredSession();
  return safeStorageSet(remember ? window.localStorage : window.sessionStorage, STORAGE_KEY, JSON.stringify(session));
}

function isPersistentSession(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(safeStorageGet(window.localStorage, STORAGE_KEY));
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<AdminSession | null>(() => readStoredSession());
  const [isBootstrapping, setIsBootstrapping] = useState(env.dataSource === 'api' && Boolean(getAccessToken()));

  useEffect(() => {
    if (env.dataSource !== 'api' || !getAccessToken()) {
      setIsBootstrapping(false);
      return;
    }

    let active = true;
    getCurrentAdmin()
      .then((current) => {
        if (!active) return;
        persistSession(current, isPersistentSession());
        setSession(current);
      })
      .catch(() => {
        if (!active) return;
        clearStoredSession();
        clearAuthTokens();
        setSession(null);
      })
      .finally(() => {
        if (active) setIsBootstrapping(false);
      });

    return () => { active = false; };
  }, []);

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const authenticated = await loginAdmin(email, password, remember);
    if (!authenticated) return false;
    if (!persistSession(authenticated, remember)) return false;
    // A fresh login must never inherit cached server state from a previous administrator.
    queryClient.clear();
    setSession(authenticated);
    return true;
  }, [queryClient]);

  const logout = useCallback(async () => {
    clearStoredSession();
    setSession(null);
    queryClient.clear();
    await logoutAdmin();
  }, [queryClient]);

  const setDevelopmentRole = useCallback((role: AdminRole) => {
    if (env.dataSource !== 'mock') return;
    const next = getDevelopmentAdminForRole(role);
    const sessionWithPermissions: AdminSession = { ...next, permissions: [] };
    clearStoredSession();
    if (!safeStorageSet(window.sessionStorage, STORAGE_KEY, JSON.stringify(sessionWithPermissions))) return;
    setSession(sessionWithPermissions);
  }, []);

  useEffect(() => {
    const onAuthExpired = () => {
      clearStoredSession();
      clearAuthTokens();
      queryClient.clear();
      setSession(null);
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);
  }, [queryClient]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setSession(readStoredSession());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo<SessionContextValue>(() => ({ session, isBootstrapping, login, logout, setDevelopmentRole }), [session, isBootstrapping, login, logout, setDevelopmentRole]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used within SessionProvider');
  return value;
}
