import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ConfigData, ConfigResponse, ConfigOption, StatusOption } from '../models/config.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly API_URL = environment.apiUrl;
  private configData: ConfigData | null = null;
  private configSubject = new BehaviorSubject<ConfigData | null>(null);
  private isLoading = false;

  constructor(private http: HttpClient) {}

  /**
   * Get configuration data from API
   */
  getConfig(): Observable<ConfigResponse> {
    return this.http.get<ConfigResponse>(`${this.API_URL}/admin/v1/config`);
  }

  /**
   * Load and cache configuration data
   */
  loadConfig(): Observable<ConfigData | null> {
    if (this.configData) {
      return of(this.configData);
    }

    if (this.isLoading) {
      return this.configSubject.asObservable();
    }

    this.isLoading = true;
    return this.getConfig().pipe(
      tap(response => {
        if (response.status && response.data) {
          this.configData = response.data;
          this.configSubject.next(this.configData);
        }
        this.isLoading = false;
      }),
      catchError(error => {
        console.error('Error loading configuration:', error);
        this.isLoading = false;
        this.configSubject.next(null);
        return of(null);
      }),
      map(response => response?.data || null)
    );
  }

  /**
   * Get cached configuration data
   */
  getConfigData(): ConfigData | null {
    return this.configData;
  }

  /**
   * Get configuration data as observable
   */
  getConfigData$(): Observable<ConfigData | null> {
    return this.configSubject.asObservable();
  }

  /**
   * Get user types
   */
  getUserTypes(): ConfigOption[] {
    return this.configData?.userTypes || [];
  }

  /**
   * Get user roles
   */
  getUserRoles(): ConfigOption[] {
    return this.configData?.userRoles || [];
  }

  /**
   * Get payment channel types
   */
  getPaymentChannelTypes(): ConfigOption[] {
    return this.configData?.paymentChannelTypes || [];
  }

  /**
   * Get transaction statuses
   */
  getTransactionStatuses(): StatusOption[] {
    return this.configData?.transactionStatuses || [];
  }

  /**
   * Get disbursement statuses
   */
  getDisbursementStatuses(): StatusOption[] {
    return this.configData?.disbursementStatuses || [];
  }

  /**
   * Get crypto key types
   */
  getCryptoKeyTypes(): ConfigOption[] {
    return this.configData?.cryptoKeyTypes || [];
  }

  /**
   * Get crypto key statuses
   */
  getCryptoKeyStatuses(): ConfigOption[] {
    return this.configData?.cryptoKeyStatuses || [];
  }

  /**
   * Get permission action types
   */
  getPermissionActionTypes(): ConfigOption[] {
    return this.configData?.permissionActionTypes || [];
  }

  /**
   * Get permission resource types
   */
  getPermissionResourceTypes(): ConfigOption[] {
    return this.configData?.permissionResourceTypes || [];
  }

  /**
   * Get permission scope types
   */
  getPermissionScopeTypes(): ConfigOption[] {
    return this.configData?.permissionScopeTypes || [];
  }

  /**
   * Get user type by value
   */
  getUserTypeByValue(value: string): ConfigOption | undefined {
    return this.getUserTypes().find(type => type.value === value);
  }

  /**
   * Get user role by value
   */
  getUserRoleByValue(value: string): ConfigOption | undefined {
    return this.getUserRoles().find(role => role.value === value);
  }

  /**
   * Get transaction status by value
   */
  getTransactionStatusByValue(value: string): StatusOption | undefined {
    return this.getTransactionStatuses().find(status => status.value === value);
  }

  /**
   * Get disbursement status by value
   */
  getDisbursementStatusByValue(value: string): StatusOption | undefined {
    return this.getDisbursementStatuses().find(status => status.value === value);
  }

  /**
   * Get crypto key type by value
   */
  getCryptoKeyTypeByValue(value: string): ConfigOption | undefined {
    return this.getCryptoKeyTypes().find(type => type.value === value);
  }

  /**
   * Get crypto key status by value
   */
  getCryptoKeyStatusByValue(value: string): ConfigOption | undefined {
    return this.getCryptoKeyStatuses().find(status => status.value === value);
  }

  /**
   * Refresh configuration data
   */
  refreshConfig(): Observable<ConfigData | null> {
    this.configData = null;
    return this.loadConfig();
  }

  /**
   * Check if configuration is loaded
   */
  isConfigLoaded(): boolean {
    return this.configData !== null;
  }

  /**
   * Get role class for styling
   */
  getRoleClass(role: string): string {
    const roleData = this.getUserRoleByValue(role);
    if (!roleData) return 'role-default';

    // Map roles to CSS classes
    if (role.includes('ADMIN')) return 'role-admin';
    if (role.includes('MERCHANT')) return 'role-merchant';
    if (role.includes('SUPPORT')) return 'role-support';
    if (role.includes('PAYMENT')) return 'role-payment';
    if (role.includes('SETTLEMENT')) return 'role-settlement';
    if (role.includes('COMPLIANCE')) return 'role-compliance';
    if (role.includes('AUDITOR')) return 'role-auditor';
    if (role.includes('TECHNICAL')) return 'role-technical';
    if (role.includes('DEVELOPER')) return 'role-developer';
    if (role.includes('MONITOR')) return 'role-monitor';
    if (role.includes('RISK')) return 'role-risk';
    
    return 'role-default';
  }

  /**
   * Get status color for styling
   */
  getStatusColor(status: string, type: 'transaction' | 'disbursement' = 'transaction'): string {
    let statusData: StatusOption | undefined;
    
    if (type === 'transaction') {
      statusData = this.getTransactionStatusByValue(status);
    } else {
      statusData = this.getDisbursementStatusByValue(status);
    }

    return statusData?.colorCode || '#6c757d';
  }
}
