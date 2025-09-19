export interface Permission {
  id: number;
  name: string;
  action: string;
  resource: string;
  scopeId: string | null;
  scopeType: string;
  description: string;
  springSecurityPermission: string;
  scoped: boolean;
  global: boolean;
  merchantScoped: boolean;
  userScoped: boolean;
  assignedRoles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionRequest {
  name?: string;
  action: string;
  resource: string;
  scopeId?: string;
  scopeType: string;
  description: string;
}

export interface UpdatePermissionRequest {
  description?: string;
}

export interface CreatePermissionResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: Permission;
}

export interface PermissionListResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: Permission[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface AvailablePermission {
  action: string;
  actionDisplayName: string;
  actionDescription: string;
  resource: string;
  resourceDisplayName: string;
  resourceDescription: string;
  permissionName: string;
  springSecurityPermission: string;
  existsInDatabase: boolean;
  crudOperation: boolean;
  userRelated: boolean;
  merchantRelated: boolean;
  paymentRelated: boolean;
}

export interface AvailablePermissionsResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: AvailablePermission[];
}

export interface ApiResponse<T> {
  status: boolean;
  statusCode: number;
  message: string;
  data: T;
  pageNumber?: number;
  pageSize?: number;
  totalElements?: number;
  totalPages?: number;
  last?: boolean;
}

// Common permission actions
export const PERMISSION_ACTIONS = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT',
  AUDIT: 'AUDIT',
  MONITOR: 'MONITOR',
  REFUND: 'REFUND',
  SETTLE: 'SETTLE',
  RECONCILE: 'RECONCILE'
} as const;

// Common resources
export const PERMISSION_RESOURCES = {
  USER: 'USER',
  ROLE: 'ROLE',
  PERMISSION: 'PERMISSION',
  MERCHANT: 'MERCHANT',
  TRANSACTION: 'TRANSACTION',
  PAYMENT: 'PAYMENT',
  SETTLEMENT: 'SETTLEMENT',
  REPORT: 'REPORT',
  AUDIT_LOG: 'AUDIT_LOG',
  SYSTEM_HEALTH: 'SYSTEM_HEALTH',
  API_KEY: 'API_KEY',
  CRYPTO_KEY: 'CRYPTO_KEY',
  PAYMENT_CHANNEL: 'PAYMENT_CHANNEL',
  PAYMENT_GATEWAY: 'PAYMENT_GATEWAY',
  DISBURSEMENT: 'DISBURSEMENT'
} as const;

// Scope types
export const SCOPE_TYPES = {
  GLOBAL: 'GLOBAL',
  MERCHANT: 'MERCHANT',
  USER: 'USER'
} as const;

export type PermissionAction = typeof PERMISSION_ACTIONS[keyof typeof PERMISSION_ACTIONS];
export type PermissionResource = typeof PERMISSION_RESOURCES[keyof typeof PERMISSION_RESOURCES];
export type ScopeType = typeof SCOPE_TYPES[keyof typeof SCOPE_TYPES];
