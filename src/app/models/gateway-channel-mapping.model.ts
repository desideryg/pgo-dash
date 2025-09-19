export interface GatewayChannelMapping {
  id: string;
  uid: string;
  paymentGatewayId: string;
  paymentGatewayUid: string;
  paymentGatewayCode: string;
  paymentGatewayName: string;
  paymentChannelId: string;
  paymentChannelUid: string;
  paymentChannelCode: string;
  paymentChannelName: string;
  payCode: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface CreateMappingRequest {
  payCode: string;
  provider: string;
}

export interface CreateMappingResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: GatewayChannelMapping;
}

export interface MappingApiResponse<T> {
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

export interface MappingFilters {
  gatewayId?: string;
  channelId?: string;
  active?: boolean;
  search?: string;
}
