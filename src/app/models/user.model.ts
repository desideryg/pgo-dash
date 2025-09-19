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
