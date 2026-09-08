import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { permissionDefinitions, rolePermissions, type Permission } from './permissions';
import { useSession, type AdminSession } from './session';

function sessionHasPermission(session: AdminSession | null, permission: Permission): boolean {
  if (!session) return false;

  // Prefer the permissions returned by the backend. Fall back to the legacy
  // role matrix only when the backend does not expose permissions yet.
  if (session.permissions.length > 0) {
    return session.permissions.includes(permission) || session.permissions.includes('*');
  }

  return rolePermissions[session.role]?.has(permission) ?? false;
}

export function hasPermission(session: AdminSession | null, permission: Permission): boolean {
  return sessionHasPermission(session, permission);
}

export function usePermission(permission: Permission): boolean {
  const { session } = useSession();
  return sessionHasPermission(session, permission);
}

export function useAnyPermission(required: readonly Permission[]): boolean {
  const { session } = useSession();
  return required.some((permission) => sessionHasPermission(session, permission));
}

export function PermissionGuard({ permission, children, fallback = null }: { permission: Permission; children: ReactNode; fallback?: ReactNode }) {
  return usePermission(permission) ? children : fallback;
}

export function ProtectedRoute({ children, permission }: { children: ReactNode; permission?: Permission }) {
  const { session, isBootstrapping } = useSession();
  const location = useLocation();

  if (isBootstrapping && !session) return null;

  if (!session) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (permission && !sessionHasPermission(session, permission)) {
    const definition = permissionDefinitions.find((item) => item.key === permission);
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location.pathname, permission, permissionLabel: definition?.label }}
      />
    );
  }

  return children;
}
