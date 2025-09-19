import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  GatewayChannelMapping, 
  CreateMappingRequest, 
  CreateMappingResponse, 
  MappingApiResponse,
  MappingFilters 
} from '../models/gateway-channel-mapping.model';

@Injectable({
  providedIn: 'root'
})
export class GatewayChannelMappingService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Create a new gateway-channel mapping
   */
  createMapping(
    gatewayUid: string, 
    channelUid: string, 
    mappingData: CreateMappingRequest
  ): Observable<CreateMappingResponse> {
    return this.http.post<CreateMappingResponse>(
      `${this.API_URL}/admin/v1/gateway-channels/gateway/uid/${gatewayUid}/channel/uid/${channelUid}`,
      mappingData
    );
  }

  /**
   * Get all gateway-channel mappings
   * Note: This method requires a gateway UID to be specified in filters
   */
  getMappings(filters: MappingFilters = {}): Observable<MappingApiResponse<GatewayChannelMapping[]>> {
    // If no gatewayId is specified, we need to get mappings for all gateways
    // For now, let's use a default gateway or return empty array
    if (!filters.gatewayId) {
      // Return empty response if no gateway is specified
      return new Observable(observer => {
        observer.next({
          status: true,
          statusCode: 200,
          message: "No gateway specified",
          data: [],
          pageNumber: 0,
          pageSize: 20,
          totalElements: 0,
          totalPages: 0,
          last: true
        });
        observer.complete();
      });
    }

    // Use the getMappingsByGateway method when gatewayId is specified
    return this.getMappingsByGateway(filters.gatewayId);
  }

  /**
   * Get mapping by ID
   */
  getMappingById(id: string): Observable<MappingApiResponse<GatewayChannelMapping>> {
    return this.http.get<MappingApiResponse<GatewayChannelMapping>>(
      `${this.API_URL}/admin/v1/gateway-channels/${id}`
    );
  }

  /**
   * Get mapping by UID
   */
  getMappingByUid(uid: string): Observable<MappingApiResponse<GatewayChannelMapping>> {
    return this.http.get<MappingApiResponse<GatewayChannelMapping>>(
      `${this.API_URL}/admin/v1/gateway-channels/uid/${uid}`
    );
  }

  /**
   * Get mappings by gateway UID
   */
  getMappingsByGateway(gatewayUid: string): Observable<MappingApiResponse<GatewayChannelMapping[]>> {
    return this.http.get<MappingApiResponse<GatewayChannelMapping[]>>(
      `${this.API_URL}/admin/v1/gateway-channels/gateway/uid/${gatewayUid}`
    );
  }

  /**
   * Get mappings by channel UID
   */
  getMappingsByChannel(channelUid: string): Observable<MappingApiResponse<GatewayChannelMapping[]>> {
    return this.http.get<MappingApiResponse<GatewayChannelMapping[]>>(
      `${this.API_URL}/admin/v1/gateway-channels/channel/uid/${channelUid}`
    );
  }

  /**
   * Update mapping
   */
  updateMapping(
    uid: string, 
    mappingData: Partial<CreateMappingRequest>
  ): Observable<MappingApiResponse<GatewayChannelMapping>> {
    return this.http.put<MappingApiResponse<GatewayChannelMapping>>(
      `${this.API_URL}/admin/v1/gateway-channels/uid/${uid}`,
      mappingData
    );
  }

  /**
   * Activate mapping
   */
  activateMapping(uid: string): Observable<MappingApiResponse<GatewayChannelMapping>> {
    return this.http.post<MappingApiResponse<GatewayChannelMapping>>(
      `${this.API_URL}/admin/v1/gateway-channels/uid/${uid}/activate`,
      {}
    );
  }

  /**
   * Deactivate mapping
   */
  deactivateMapping(uid: string): Observable<MappingApiResponse<GatewayChannelMapping>> {
    return this.http.post<MappingApiResponse<GatewayChannelMapping>>(
      `${this.API_URL}/admin/v1/gateway-channels/uid/${uid}/deactivate`,
      {}
    );
  }

  /**
   * Delete mapping
   */
  deleteMapping(uid: string): Observable<MappingApiResponse<boolean>> {
    return this.http.delete<MappingApiResponse<boolean>>(
      `${this.API_URL}/admin/v1/gateway-channels/uid/${uid}`
    );
  }

  /**
   * Check if mapping exists
   */
  checkMappingExists(gatewayUid: string, channelUid: string): Observable<MappingApiResponse<boolean>> {
    return this.http.get<MappingApiResponse<boolean>>(
      `${this.API_URL}/admin/v1/gateway-channels/gateway/uid/${gatewayUid}/channel/uid/${channelUid}/exists`
    );
  }
}
