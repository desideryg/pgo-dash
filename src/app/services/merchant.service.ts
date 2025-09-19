import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Merchant, 
  CreateMerchantRequest, 
  CreateMerchantResponse, 
  MerchantApiResponse 
} from '../models/merchant.model';
import { 
  ApiKey, 
  CreateApiKeyRequest, 
  CreateApiKeyResponse, 
  ApiKeyApiResponse 
} from '../models/api-key.model';
import { 
  CryptoKey, 
  CreateCryptoKeyRequest, 
  CreateCryptoKeyResponse, 
  CryptoKeyApiResponse,
  RevokeCryptoKeyRequest,
  CurrentCryptoKey,
  PreviousCryptoKey,
  CryptoKeyStatistics,
  ValidatePublicKeyRequest 
} from '../models/crypto-key.model';

@Injectable({
  providedIn: 'root'
})
export class MerchantService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get all merchants
   */
  getMerchants(): Observable<MerchantApiResponse<Merchant[]>> {
    return this.http.get<MerchantApiResponse<Merchant[]>>(`${this.API_URL}/admin/v1/merchants`);
  }

  /**
   * Get merchant by ID
   */
  getMerchantById(id: string): Observable<MerchantApiResponse<Merchant>> {
    return this.http.get<MerchantApiResponse<Merchant>>(`${this.API_URL}/admin/v1/merchants/${id}`);
  }

  /**
   * Get merchant by UID
   */
  getMerchantByUid(uid: string): Observable<MerchantApiResponse<Merchant>> {
    return this.http.get<MerchantApiResponse<Merchant>>(`${this.API_URL}/admin/v1/merchants/uid/${uid}`);
  }

  /**
   * Create a new merchant
   */
  createMerchant(merchantData: CreateMerchantRequest): Observable<CreateMerchantResponse> {
    return this.http.post<CreateMerchantResponse>(`${this.API_URL}/admin/v1/merchants`, merchantData);
  }

  /**
   * Update merchant
   */
  updateMerchant(id: string, merchantData: Partial<CreateMerchantRequest>): Observable<MerchantApiResponse<Merchant>> {
    return this.http.put<MerchantApiResponse<Merchant>>(`${this.API_URL}/admin/v1/merchants/${id}`, merchantData);
  }

  /**
   * Delete merchant
   */
  deleteMerchant(id: string): Observable<MerchantApiResponse<void>> {
    return this.http.delete<MerchantApiResponse<void>>(`${this.API_URL}/admin/v1/merchants/${id}`);
  }

  /**
   * Activate merchant
   */
  activateMerchant(uid: string): Observable<MerchantApiResponse<boolean>> {
    return this.http.post<MerchantApiResponse<boolean>>(`${this.API_URL}/admin/v1/merchants/uid/${uid}/activate`, {});
  }

  /**
   * Deactivate merchant
   */
  deactivateMerchant(uid: string): Observable<MerchantApiResponse<boolean>> {
    return this.http.post<MerchantApiResponse<boolean>>(`${this.API_URL}/admin/v1/merchants/uid/${uid}/deactivate`, {});
  }

  /**
   * Suspend merchant
   */
  suspendMerchant(uid: string): Observable<MerchantApiResponse<boolean>> {
    return this.http.post<MerchantApiResponse<boolean>>(`${this.API_URL}/admin/v1/merchants/uid/${uid}/suspend`, {});
  }

  /**
   * Verify merchant
   */
  verifyMerchant(uid: string): Observable<MerchantApiResponse<boolean>> {
    return this.http.post<MerchantApiResponse<boolean>>(`${this.API_URL}/admin/v1/merchants/uid/${uid}/verify`, {});
  }

  // API Key Management Methods

  /**
   * Create crypto key for merchant
   */
  createApiKey(merchantUid: string): Observable<CreateApiKeyResponse> {
    return this.http.post<CreateApiKeyResponse>(`${this.API_URL}/v1/merchants/uid/${merchantUid}/crypto-keys`, {});
  }

  /**
   * Get crypto keys for merchant
   */
  getApiKeys(merchantUid: string): Observable<ApiKeyApiResponse<ApiKey[]>> {
    return this.http.get<ApiKeyApiResponse<ApiKey[]>>(`${this.API_URL}/v1/merchants/uid/${merchantUid}/crypto-keys`);
  }

  /**
   * Revoke crypto key
   */
  revokeApiKey(merchantUid: string, apiKey: string): Observable<ApiKeyApiResponse<boolean>> {
    return this.http.delete<ApiKeyApiResponse<boolean>>(`${this.API_URL}/v1/merchants/uid/${merchantUid}/crypto-keys/${apiKey}`);
  }

  /**
   * Regenerate crypto key (if endpoint exists)
   * Note: This endpoint might not be implemented yet
   */
  regenerateApiKey(merchantUid: string, apiKey: string): Observable<CreateApiKeyResponse> {
    return this.http.post<CreateApiKeyResponse>(`${this.API_URL}/v1/merchants/uid/${merchantUid}/crypto-keys/${apiKey}/regenerate`, {});
  }

  // Crypto Key Management Methods

  /**
   * Create crypto key for merchant
   */
  createCryptoKey(merchantUid: string, keyData?: CreateCryptoKeyRequest): Observable<CreateCryptoKeyResponse> {
    const requestBody = keyData || {};
    return this.http.post<CreateCryptoKeyResponse>(`${this.API_URL}/admin/v1/merchants/uid/${merchantUid}/crypto-keys`, requestBody);
  }

  /**
   * Get crypto keys for merchant
   */
  getCryptoKeys(merchantUid: string): Observable<CryptoKeyApiResponse<CryptoKey[]>> {
    return this.http.get<CryptoKeyApiResponse<CryptoKey[]>>(`${this.API_URL}/admin/v1/merchants/uid/${merchantUid}/crypto-keys`);
  }

  /**
   * Get crypto keys for merchant with pagination
   */
  getCryptoKeysPaginated(merchantUid: string, page: number = 0, size: number = 10): Observable<CryptoKeyApiResponse<CryptoKey[]>> {
    return this.http.get<CryptoKeyApiResponse<CryptoKey[]>>(`${this.API_URL}/admin/v1/merchants/uid/${merchantUid}/crypto-keys?page=${page}&size=${size}`);
  }

  /**
   * Get crypto keys by status for merchant
   */
  getCryptoKeysByStatus(merchantUid: string, status: string, page: number = 0, size: number = 10): Observable<CryptoKeyApiResponse<CryptoKey[]>> {
    return this.http.get<CryptoKeyApiResponse<CryptoKey[]>>(`${this.API_URL}/admin/v1/merchants/uid/${merchantUid}/crypto-keys/status/${status}?page=${page}&size=${size}`);
  }

  /**
   * Get current crypto key for merchant
   */
  getCurrentCryptoKey(merchantUid: string): Observable<CryptoKeyApiResponse<CurrentCryptoKey>> {
    return this.http.get<CryptoKeyApiResponse<CurrentCryptoKey>>(`${this.API_URL}/admin/v1/merchants/uid/${merchantUid}/crypto-keys/current`);
  }

  /**
   * Get previous crypto key for merchant
   */
  getPreviousCryptoKey(merchantUid: string): Observable<CryptoKeyApiResponse<PreviousCryptoKey>> {
    return this.http.get<CryptoKeyApiResponse<PreviousCryptoKey>>(`${this.API_URL}/admin/v1/merchants/uid/${merchantUid}/crypto-keys/previous`);
  }

  /**
   * Get crypto key statistics for merchant
   */
  getCryptoKeyStatistics(merchantUid: string): Observable<CryptoKeyApiResponse<CryptoKeyStatistics>> {
    return this.http.get<CryptoKeyApiResponse<CryptoKeyStatistics>>(`${this.API_URL}/admin/v1/merchants/uid/${merchantUid}/crypto-keys/stats`);
  }

  /**
   * Check if merchant has active crypto keys
   */
  hasActiveCryptoKeys(merchantUid: string): Observable<CryptoKeyApiResponse<boolean>> {
    return this.http.get<CryptoKeyApiResponse<boolean>>(`${this.API_URL}/admin/v1/merchants/uid/${merchantUid}/crypto-keys/has-active`);
  }

  /**
   * Validate public key format
   */
  validatePublicKey(merchantUid: string, publicKey: string): Observable<CryptoKeyApiResponse<boolean>> {
    const requestBody: ValidatePublicKeyRequest = { publicKey };
    return this.http.post<CryptoKeyApiResponse<boolean>>(`${this.API_URL}/admin/v1/merchants/uid/${merchantUid}/crypto-keys/validate`, requestBody);
  }

  /**
   * Get crypto key fingerprint
   */
  getCryptoKeyFingerprint(merchantUid: string, keyUid: string): Observable<CryptoKeyApiResponse<string>> {
    return this.http.get<CryptoKeyApiResponse<string>>(`${this.API_URL}/admin/v1/merchants/uid/${merchantUid}/crypto-keys/uid/${keyUid}/fingerprint`);
  }

  /**
   * Extend crypto key expiry
   */
  extendCryptoKeyExpiry(merchantUid: string, keyUid: string, newExpiry: string): Observable<CryptoKeyApiResponse<CryptoKey>> {
    return this.http.put<CryptoKeyApiResponse<CryptoKey>>(`${this.API_URL}/admin/v1/merchants/uid/${merchantUid}/crypto-keys/uid/${keyUid}/extend-expiry?newExpiry=${newExpiry}`, {});
  }

  /**
   * Get crypto key by UID
   */
  getCryptoKeyByUid(merchantUid: string, keyUid: string): Observable<CryptoKeyApiResponse<CryptoKey>> {
    return this.http.get<CryptoKeyApiResponse<CryptoKey>>(`${this.API_URL}/admin/v1/merchants/uid/${merchantUid}/crypto-keys/${keyUid}`);
  }

  /**
   * Activate crypto key
   */
  activateCryptoKey(merchantUid: string, keyUid: string): Observable<CryptoKeyApiResponse<CryptoKey>> {
    return this.http.put<CryptoKeyApiResponse<CryptoKey>>(`${this.API_URL}/admin/v1/merchants/uid/${merchantUid}/crypto-keys/uid/${keyUid}/activate`, {});
  }

  /**
   * Deactivate crypto key
   */
  deactivateCryptoKey(merchantUid: string, keyUid: string): Observable<CryptoKeyApiResponse<CryptoKey>> {
    return this.http.put<CryptoKeyApiResponse<CryptoKey>>(`${this.API_URL}/admin/v1/merchants/uid/${merchantUid}/crypto-keys/uid/${keyUid}/deactivate`, {});
  }

  /**
   * Revoke crypto key
   */
  revokeCryptoKey(merchantUid: string, keyUid: string, reason: string): Observable<CryptoKeyApiResponse<any>> {
    const requestBody: RevokeCryptoKeyRequest = { reason };
    return this.http.put<CryptoKeyApiResponse<any>>(`${this.API_URL}/admin/v1/merchants/uid/${merchantUid}/crypto-keys/uid/${keyUid}/revoke`, requestBody);
  }
}
