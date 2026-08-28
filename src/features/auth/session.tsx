import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { z } from 'zod';

import { roleLabels, roles, type AdminRole } from './permissions';
import { authenticateMockAdmin, getDevelopmentAdminForRole, type AuthenticatedAdmin } from './mock-auth';

export interface AdminSession extends AuthenticatedAdmin {
  avatarUrl?: string;
}

interface SessionContextValue {
  session: AdminSession | null;
  login: (username: string, password: string, remember: boolean) => boolean;
  logout: () => void;
  setDevelopmentRole: (role: AdminRole) => void;
}

const STORAGE_KEY = 'resq-admin-session';
const SessionContext = createContext<SessionContextValue | null>(null);

function safeStorageGet(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(storage: Storage, key: string, value: string): boolean {
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeStorageRemove(storage: Storage, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // Storage can be unavailable in hardened browser contexts.
  }
}

const storedSessionSchema = z
  .object({
    id: z.string().trim().min(1),
    name: z.string().trim().min(1),
    username: z.string().trim().min(1),
    role: z.enum(roles),
    avatarUrl: z.string().url().optional(),
  })
  .strip();

function readStoredSession(): AdminSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw =
    safeStorageGet(window.localStorage, STORAGE_KEY) ??
    safeStorageGet(window.sessionStorage, STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const result = storedSessionSchema.safeParse(JSON.parse(raw));

    if (!result.success) {
      clearStoredSession();
      return null;
    }

    return {
      ...result.data,
      roleLabel: roleLabels[result.data.role],
    };
  } catch {
    clearStoredSession();
    return null;
  }
}

function clearStoredSession() {
  if (typeof window === 'undefined') {
    return;
  }

  safeStorageRemove(window.localStorage, STORAGE_KEY);
  safeStorageRemove(window.sessionStorage, STORAGE_KEY);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(() => readStoredSession());

  const login = useCallback((username: string, password: string, remember: boolean) => {
    const authenticated = authenticateMockAdmin(username, password);

    if (!authenticated) {
      return false;
    }

    // Remove any older session before writing the new one.
    clearStoredSession();

    const storage = remember ? window.localStorage : window.sessionStorage;
    const stored = safeStorageSet(storage, STORAGE_KEY, JSON.stringify(authenticated));

    if (!stored) {
      return false;
    }

    setSession(authenticated);
    return true;
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setSession(null);
  }, []);

  const setDevelopmentRole = useCallback((role: AdminRole) => {
    const next = getDevelopmentAdminForRole(role);

    clearStoredSession();

    if (!safeStorageSet(window.sessionStorage, STORAGE_KEY, JSON.stringify(next))) {
      return;
    }

    setSession(next);
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) {
        return;
      }

      // Keep identity and permissions in sync when another tab changes the session.
      setSession(readStoredSession());
    };

    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      login,
      logout,
      setDevelopmentRole,
    }),
    [session, login, logout, setDevelopmentRole],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);

  if (!value) {
    throw new Error('useSession must be used within SessionProvider');
  }

  return value;
}