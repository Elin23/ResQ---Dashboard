import { Navigate, useLocation } from 'react-router';
import type { ReactNode } from 'react';
import { permissionDefinitions, rolePermissions, roles, type AdminRole, type Permission } from './permissions';
import { useSession } from './session';

const validRoles = new Set<AdminRole>(roles);

function permissionsForRole(role: AdminRole | string | undefined) {
  return role && validRoles.has(role as AdminRole) ? rolePermissions[role as AdminRole] : null;
}

export function usePermission(permission: Permission): boolean {
  const { session } = useSession();
  return permissionsForRole(session?.role)?.has(permission) ?? false;
}

export function useAnyPermission(required: readonly Permission[]): boolean {
  const { session } = useSession();
  const granted = permissionsForRole(session?.role);
  return granted ? required.some((permission) => granted.has(permission)) : false;
}

export function PermissionGuard({ permission, children, fallback = null }: { permission: Permission; children: ReactNode; fallback?: ReactNode }) {
  return usePermission(permission) ? children : fallback;
}

export function ProtectedRoute({ children, permission }: { children: ReactNode; permission?: Permission }) {
  const { session } = useSession();
  const location = useLocation();
  if (!session) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  const granted = permissionsForRole(session.role);
  if (!granted) return <Navigate to="/login" replace state={{ sessionInvalid: true }} />;
  if (permission && !granted.has(permission)) {
    const definition = permissionDefinitions.find((item) => item.key === permission);
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname, permission, permissionLabel: definition?.label }} />;
  }
  return children;
}
