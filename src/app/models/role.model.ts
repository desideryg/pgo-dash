// Import permission interface for role-permission relationships
import { Permission } from './permission.model';

export interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  permissions?: Permission[] | null;
  permissionCount?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | null;
  updatedBy?: string;
}

export interface CreateRoleRequest {
  name: string;
  displayName?: string;
  description?: string;
}

export interface UpdateRoleRequest {
  displayName?: string;
  description?: string;
}

export interface RolePermissionAssignmentRequest {
  permissionIds: number[];
  reason?: string;
}

export interface RolePermissionAssignmentResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: {
    roleId: number;
    roleName: string;
    assignedPermissions: Permission[];
    revokedPermissions: Permission[] | null;
    currentPermissions: Permission[];
    totalPermissions: number;
    operationTime: string;
    performedBy: string;
    reason: string;
  };
}

export interface BulkRolePermissionAssignmentRequest {
  roleIds: number[];
  permissionIds: number[];
  reason?: string;
}

export interface RoleWithPermissions {
  id: number;
  name: string;
  displayName: string;
  description: string;
  permissions: Permission[];
  permissionCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string;
}

export interface BulkRolePermissionAssignmentResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: {
    [roleId: string]: RoleWithPermissions;
  };
}

export interface CreateRoleResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: Role;
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

// Common predefined roles
export const PREDEFINED_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER',
  MERCHANT: 'MERCHANT',
  FINANCE_ADMIN: 'FINANCE_ADMIN',
  TECHNICAL_ADMIN: 'TECHNICAL_ADMIN',
  SUPPORT_ADMIN: 'SUPPORT_ADMIN',
  PAYMENT_ADMIN: 'PAYMENT_ADMIN',
  SETTLEMENT_ADMIN: 'SETTLEMENT_ADMIN',
  COMPLIANCE_ADMIN: 'COMPLIANCE_ADMIN',
  AUDITOR: 'AUDITOR',
  DEVELOPER: 'DEVELOPER',
  MONITOR: 'MONITOR',
  RISK_ADMIN: 'RISK_ADMIN'
} as const;

export type RoleName = typeof PREDEFINED_ROLES[keyof typeof PREDEFINED_ROLES];