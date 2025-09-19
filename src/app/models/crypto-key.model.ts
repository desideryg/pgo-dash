export interface CryptoKey {
  uid: string;
  merchantUid: string;
  merchantName: string;
  keyType: string;
  keyStatus: string;
  keyName: string;
  keyAlgorithm: string;
  keySize: number;
  keyFingerprint: string;
  isActive: boolean;
  activatedAt?: string;
  expiresAt: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CreateCryptoKeyRequest {
  keyName?: string;
  publicKey?: string;
  privateKey?: string;
  keyAlgorithm?: string;
  keySize?: number;
  expiresAt?: string;
  notes?: string;
  activateImmediately?: boolean;
}

export interface RevokeCryptoKeyRequest {
  reason: string;
}

export interface ValidatePublicKeyRequest {
  publicKey: string;
}

export interface CurrentCryptoKey {
  merchantUid: string;
  publicKey: string;
}

export interface PreviousCryptoKey {
  merchantUid: string;
  publicKey: string;
}

export interface CryptoKeyStatistics {
  merchantUid: string;
  merchantName: string;
  totalKeys: number;
  activeKeys: number;
  keysByStatus: { [status: string]: number };
  keysByAlgorithm: { [algorithm: string]: number };
  averageUsageCount: number;
  totalUsageCount: number;
  keysExpiringSoon: number;
  oldestKeyAge: number;
  newestKeyAge: number;
  lastKeyActivation: string;
  generatedAt: string;
}

export interface CreateCryptoKeyResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: CryptoKey;
}

export interface CryptoKeyApiResponse<T> {
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

export const CRYPTO_KEY_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  CURRENT: 'CURRENT',
  INACTIVE: 'INACTIVE',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED'
} as const;

export const CRYPTO_KEY_TYPES = {
  PUBLIC_KEY: 'PUBLIC_KEY',
  PRIVATE_KEY: 'PRIVATE_KEY'
} as const;

export const CRYPTO_KEY_ALGORITHMS = {
  RSA: 'RSA',
  EC: 'EC',
  EdDSA: 'EdDSA'
} as const;
