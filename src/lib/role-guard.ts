import { UserRole } from '@/types'

export const rolePermissions: Record<UserRole, string[]> = {
  ADMIN: ['*'],
  PRODUCTION_COORDINATOR: [
    'orders:create',
    'orders:read',
    'orders:update',
    'orders:ship',
    'tasks:read',
    'tasks:assign',
    'bom:read'
  ],
  PROCUREMENT_SPECIALIST: [
    'orders:read',
    'bom:read',
    'bom:approve',
    'bom:update',
    'procurement:manage'
  ],
  QC_SPECIALIST: [
    'orders:read',
    'qc:create',
    'qc:read',
    'qc:update',
    'tasks:read'
  ],
  ASSEMBLER: [
    'orders:read',
    'tasks:read',
    'tasks:update',
    'tasks:complete',
    'work-instructions:read'
  ],
  SERVICE_DEPARTMENT: [
    'parts:order',
    'inventory:read'
  ]
}

export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissions = rolePermissions[userRole]
  return permissions.includes('*') || permissions.includes(permission)
}

export function requirePermission(userRole: UserRole, permission: string) {
  if (!hasPermission(userRole, permission)) {
    throw new Error(`Access denied. Required permission: ${permission}`)
  }
}