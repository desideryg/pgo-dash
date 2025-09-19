export interface Disbursement {
  id: string;
  uid: string;
  pspDisbursementId: string;
  merchantDisbursementId: string;
  sourceTransactionId: string;
  amount: string;
  currency: string;
  disbursementChannel: string;
  recipientAccount: string;
  recipientName: string;
  status: DisbursementStatus;
  colorCode: string;
  description: string;
  responseCode: string;
  responseMessage: string;
  errorCode: string;
  errorMessage: string;
  pgoId: string;
  pgoName: string;
  merchantId: string;
  createdAt: string;
  updatedAt: string;
}

export enum DisbursementStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface DisbursementResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: Disbursement[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface DisbursementFilters {
  transactionUid?: string;
  status?: DisbursementStatus;
  merchantId?: string;
  pgoId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  size?: number;
}
