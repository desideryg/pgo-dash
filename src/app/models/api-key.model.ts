export interface ApiKey {
  apiKey: string;
  secretKey: string | null; // null when fetching list, populated when creating
  expiresAt: string;
  status: string | null;
  createdAt?: string;
  lastUsedAt?: string;
  merchantUid?: string;
}

export interface CreateApiKeyRequest {
  // Empty body for API key creation
}

export interface CreateApiKeyResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: ApiKey;
}

export interface ApiKeyApiResponse<T> {
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

export const API_KEY_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED'
} as const;
