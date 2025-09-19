import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { 
  PaymentChannel, 
  PaymentChannelApiResponse, 
  CreatePaymentChannelRequest, 
  CreatePaymentChannelResponse,
  UpdatePaymentChannelRequest,
  UpdatePaymentChannelResponse,
  DeletePaymentChannelResponse
} from '../models/payment-channel.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentChannelService {
  private apiUrl = '/api/admin/v1/payment-channels';
  private paymentChannelsSubject = new BehaviorSubject<PaymentChannel[]>([]);
  public paymentChannels$ = this.paymentChannelsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all payment channels with pagination and filtering
   */
  getPaymentChannels(
    page: number = 0, 
    size: number = 20, 
    search?: string, 
    type?: string, 
    status?: string
  ): Observable<PaymentChannelApiResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }
    if (type) {
      params = params.set('type', type);
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaymentChannelApiResponse>(this.apiUrl, { params })
      .pipe(
        tap(response => {
          if (response.status && response.data) {
            this.paymentChannelsSubject.next(response.data);
          }
        }),
        catchError(error => {
          console.error('Error fetching payment channels:', error);
          throw error;
        })
      );
  }

  /**
   * Get a specific payment channel by UID
   */
  getPaymentChannel(uid: string): Observable<PaymentChannelApiResponse> {
    return this.http.get<PaymentChannelApiResponse>(`${this.apiUrl}/uid/${uid}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching payment channel:', error);
          throw error;
        })
      );
  }

  /**
   * Create a new payment channel
   */
  createPaymentChannel(request: CreatePaymentChannelRequest): Observable<CreatePaymentChannelResponse> {
    return this.http.post<CreatePaymentChannelResponse>(this.apiUrl, request)
      .pipe(
        tap(response => {
          if (response.status && response.data) {
            // Refresh the payment channels list
            this.getPaymentChannels().subscribe();
          }
        }),
        catchError(error => {
          console.error('Error creating payment channel:', error);
          throw error;
        })
      );
  }

  /**
   * Update an existing payment channel
   */
  updatePaymentChannel(uid: string, request: UpdatePaymentChannelRequest): Observable<UpdatePaymentChannelResponse> {
    return this.http.put<UpdatePaymentChannelResponse>(`${this.apiUrl}/uid/${uid}`, request)
      .pipe(
        tap(response => {
          if (response.status && response.data) {
            // Refresh the payment channels list
            this.getPaymentChannels().subscribe();
          }
        }),
        catchError(error => {
          console.error('Error updating payment channel:', error);
          throw error;
        })
      );
  }

  /**
   * Delete a payment channel
   */
  deletePaymentChannel(uid: string): Observable<DeletePaymentChannelResponse> {
    return this.http.delete<DeletePaymentChannelResponse>(`${this.apiUrl}/uid/${uid}`)
      .pipe(
        tap(response => {
          if (response.status) {
            // Refresh the payment channels list
            this.getPaymentChannels().subscribe();
          }
        }),
        catchError(error => {
          console.error('Error deleting payment channel:', error);
          throw error;
        })
      );
  }

  /**
   * Toggle payment channel status (activate/deactivate)
   */
  togglePaymentChannelStatus(uid: string, isActive: boolean): Observable<UpdatePaymentChannelResponse> {
    return this.updatePaymentChannel(uid, { isActive });
  }

  /**
   * Get payment channel types for dropdowns
   */
  getPaymentChannelTypes(): string[] {
    return ['MNO', 'CARD', 'BANK', 'WALLET'];
  }

  /**
   * Get payment channel type display name
   */
  getPaymentChannelTypeDisplayName(type: string): string {
    const typeMap: { [key: string]: string } = {
      'MNO': 'Mobile Network Operator',
      'CARD': 'Card Payment',
      'BANK': 'Bank Transfer',
      'WALLET': 'Digital Wallet'
    };
    return typeMap[type] || type;
  }

  /**
   * Get payment channel type icon
   */
  getPaymentChannelTypeIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'MNO': 'fas fa-mobile-alt',
      'CARD': 'fas fa-credit-card',
      'BANK': 'fas fa-university',
      'WALLET': 'fas fa-wallet'
    };
    return iconMap[type] || 'fas fa-circle';
  }

  /**
   * Get payment channel type color class
   */
  getPaymentChannelTypeClass(type: string): string {
    const classMap: { [key: string]: string } = {
      'MNO': 'type-mno',
      'CARD': 'type-card',
      'BANK': 'type-bank',
      'WALLET': 'type-wallet'
    };
    return classMap[type] || 'type-default';
  }
}
