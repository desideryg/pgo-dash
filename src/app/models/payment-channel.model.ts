export interface PaymentChannel {
  id: string;
  uid: string;
  code: string;
  name: string;
  paymentChannelType: 'MNO' | 'CARD' | 'BANK' | 'WALLET';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentChannelApiResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: PaymentChannel[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CreatePaymentChannelRequest {
  code: string;
  name: string;
  paymentChannelType: 'MNO' | 'CARD' | 'BANK' | 'WALLET';
  isActive?: boolean;
}

export interface CreatePaymentChannelResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: PaymentChannel;
}

export interface UpdatePaymentChannelRequest {
  code?: string;
  name?: string;
  paymentChannelType?: 'MNO' | 'CARD' | 'BANK' | 'WALLET';
  isActive?: boolean;
}

export interface UpdatePaymentChannelResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: PaymentChannel;
}

export interface DeletePaymentChannelResponse {
  status: boolean;
  statusCode: number;
  message: string;
}
