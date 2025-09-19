export interface Merchant {
  id: string;
  uid: string;
  name: string;
  code: string;
  businessName: string;
  businessRegistrationNumber: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessPostalCode: string;
  businessCountry: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl?: string;
  merchantType: string;
  status: string;
  merchantRole?: string;
  kycVerified: boolean;
  kycVerifiedAt?: string;
  kycVerifiedBy?: string;
  parentMerchantUid?: string;
  parentMerchantName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMerchantRequest {
  merchantName: string;
  merchantCode: string;
  businessName: string;
  businessRegistrationNumber: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessPostalCode: string;
  businessCountry: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl?: string;
  merchantType: string;
  merchantRole: string;
  parentMerchantId?: string;
}

export interface CreateMerchantResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: Merchant;
}

export interface MerchantApiResponse<T> {
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

export const MERCHANT_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED'
} as const;

export const MERCHANT_TYPES = {
  TRAVEL: 'TRAVEL',
  RETAIL: 'RETAIL',
  WHOLESALE: 'WHOLESALE',
  SERVICE: 'SERVICE',
  MANUFACTURING: 'MANUFACTURING',
  TECHNOLOGY: 'TECHNOLOGY',
  HEALTHCARE: 'HEALTHCARE',
  EDUCATION: 'EDUCATION',
  FINANCE: 'FINANCE',
  OTHER: 'OTHER'
} as const;

export const MERCHANT_ROLES = {
  PLATFORM: 'PLATFORM',
  SUB_MERCHANT: 'SUB_MERCHANT',
  PARTNER: 'PARTNER',
  AFFILIATE: 'AFFILIATE'
} as const;
