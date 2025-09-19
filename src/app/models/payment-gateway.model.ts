export interface PaymentGateway {
  id: string;
  uid: string;
  code: string;
  name: string;
  productionApiBaseUrl: string | null;
  sandboxApiBaseUrl: string | null;
  activeStatus: string;
  supportedMethods: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentGatewayApiResponse<T> {
  status: boolean;
  statusCode: number;
  message: string;
  data: T;
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CreatePaymentGatewayRequest {
  code: string;
  name: string;
  productionApiBaseUrl?: string;
  sandboxApiBaseUrl?: string;
  activeStatus: string;
  supportedMethods: string[];
}

export interface CreatePaymentGatewayResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: PaymentGateway;
}

export interface UpdatePaymentGatewayRequest {
  name?: string;
  productionApiBaseUrl?: string;
  sandboxApiBaseUrl?: string;
  activeStatus?: string;
  supportedMethods?: string[];
}

export interface UpdatePaymentGatewayResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: PaymentGateway;
}

// Constants for payment gateway statuses
export const PAYMENT_GATEWAY_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  MAINTENANCE: 'Maintenance',
  SUSPENDED: 'Suspended'
} as const;

// Constants for supported payment methods
export const PAYMENT_METHODS = {
  MNO: 'MNO',
  CARD: 'CARD',
  BANK: 'BANK',
  WALLET: 'WALLET'
} as const;
