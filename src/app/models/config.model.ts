export interface ConfigOption {
  value: string;
  displayName: string;
  description: string;
}

export interface StatusOption extends ConfigOption {
  colorCode: string;
}

export interface ConfigData {
  userTypes: ConfigOption[];
  userRoles: ConfigOption[];
  paymentChannelTypes: ConfigOption[];
  transactionStatuses: StatusOption[];
  disbursementStatuses: StatusOption[];
  cryptoKeyTypes: ConfigOption[];
  cryptoKeyStatuses: ConfigOption[];
  permissionActionTypes: ConfigOption[];
  permissionResourceTypes: ConfigOption[];
  permissionScopeTypes: ConfigOption[];
}

export interface ConfigResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: ConfigData;
}

// Constants for easy access
export const USER_TYPES = {
  ADMIN: 'ADMIN',
  MERCHANT_USER: 'MERCHANT_USER',
  SUPPORT: 'SUPPORT',
  AUDITOR: 'AUDITOR',
  VIEW_ONLY: 'VIEW_ONLY'
} as const;

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  SECURITY_ADMIN: 'SECURITY_ADMIN',
  BUSINESS_ADMIN: 'BUSINESS_ADMIN',
  FINANCE_ADMIN: 'FINANCE_ADMIN',
  COMPLIANCE_ADMIN: 'COMPLIANCE_ADMIN',
  MERCHANT_ADMIN: 'MERCHANT_ADMIN',
  MERCHANT_USER: 'MERCHANT_USER',
  MERCHANT_FINANCE: 'MERCHANT_FINANCE',
  MERCHANT_SUPPORT: 'MERCHANT_SUPPORT',
  PAYMENT_OPERATOR: 'PAYMENT_OPERATOR',
  PAYMENT_ANALYST: 'PAYMENT_ANALYST',
  SETTLEMENT_OPERATOR: 'SETTLEMENT_OPERATOR',
  RECONCILIATION_USER: 'RECONCILIATION_USER',
  SUPPORT_AGENT: 'SUPPORT_AGENT',
  SUPPORT_SUPERVISOR: 'SUPPORT_SUPERVISOR',
  ESCALATION_MANAGER: 'ESCALATION_MANAGER',
  TECHNICAL_ADMIN: 'TECHNICAL_ADMIN',
  DEVELOPER: 'DEVELOPER',
  SYSTEM_MONITOR: 'SYSTEM_MONITOR',
  AUDITOR: 'AUDITOR',
  COMPLIANCE_OFFICER: 'COMPLIANCE_OFFICER',
  RISK_ANALYST: 'RISK_ANALYST'
} as const;

export const PAYMENT_CHANNEL_TYPES = {
  MNO: 'MNO',
  BANK: 'BANK',
  CARD: 'CARD',
  WALLET: 'WALLET'
} as const;

export const TRANSACTION_STATUSES = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  EXPIRED: 'EXPIRED'
} as const;

export const DISBURSEMENT_STATUSES = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  RETRY_ATTEMPTED: 'RETRY_ATTEMPTED',
  CHAINED: 'CHAINED',
  REJECTED: 'REJECTED',
  REVERSED: 'REVERSED',
  REIMBURSED: 'REIMBURSED'
} as const;

export const CRYPTO_KEY_TYPES = {
  PUBLIC_KEY: 'PUBLIC_KEY',
  PRIVATE_KEY: 'PRIVATE_KEY'
} as const;

export const CRYPTO_KEY_STATUSES = {
  PENDING: 'PENDING',
  CURRENT: 'CURRENT',
  PREVIOUS: 'PREVIOUS',
  REVOKED: 'REVOKED'
} as const;
