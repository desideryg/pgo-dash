export interface Transaction {
  id: string;
  uid: string;
  internalTransactionId: string;
  externalTransactionId: string;
  merchantTransactionId: string;
  pspTransactionId: string;
  amount: string;
  currency: string;
  customerIdentifier: string;
  paymentMethod: string;
  customerName: string;
  status: TransactionStatus;
  colorCode: string;
  errorCode: string;
  errorMessage: string;
  description: string;
  pgoId: string;
  pgoName: string;
  merchantId: string;
  merchantName: string;
  createdAt: string;
  updatedAt: string;
}

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface TransactionResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: Transaction[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface TransactionFilters {
  page?: number;
  size?: number;
  status?: TransactionStatus;
  merchantId?: string;
  pgoId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}
