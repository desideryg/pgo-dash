export interface User {
  id: string;
  uid: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  roles: string[];
  active: boolean;
  locked: boolean;
  associatedMerchantId?: string;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roleNames: string[];
  userType: string;
  associatedMerchantId?: string;
}

export interface CreateUserResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: User;
}

// Import necessary interfaces for user permission summary
import { Permission } from './permission.model';
import { Role } from './role.model';

export interface UserPermissionSummary {
  userId: number;
  userEmail: string;
  userFullName: string;
  roleBasedPermissions: Permission[];
  directPermissions: Permission[];
  allPermissions: Permission[];
  assignedRoles: Role[];
  roleBasedPermissionCount: number;
  directPermissionCount: number;
  totalUniquePermissions: number;
  hasPermissions: boolean;
}

export interface UserPermissionSummaryResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: UserPermissionSummary;
}

export interface UserPermissionAssignmentRequest {
  permissionIds: number[];
  reason?: string;
  expiresAt?: string;
}

export interface UserPermissionAssignmentResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: {
    userId: number;
    userEmail: string;
    userFullName: string;
    assignedPermissions: Permission[];
    revokedPermissions: Permission[] | null;
    currentDirectPermissions: Permission[];
    totalDirectPermissions: number;
    operationTime: string;
    performedBy: string;
    reason: string;
    expiresAt?: string;
  };
}

export interface BulkUserPermissionAssignmentRequest {
  userIds: number[];
  permissionIds: number[];
  reason?: string;
  expiresAt?: string;
}

export interface UserWithPermissions {
  id: string;
  uid: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  roles: string[];
  active: boolean;
  locked: boolean;
  associatedMerchantId: string | null;
  lastLoginAt: string | null;
  createdAt: string | null;
  directPermissions: string[];
  directPermissionCount: number;
}

export interface BulkUserPermissionAssignmentResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: {
    [userId: string]: UserWithPermissions;
  };
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

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER',
  MERCHANT: 'MERCHANT'
} as const;

export const USER_TYPES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  MERCHANT: 'MERCHANT'
} as const;
