import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PaymentGateway,
  PaymentGatewayApiResponse,
  CreatePaymentGatewayRequest,
  CreatePaymentGatewayResponse,
  UpdatePaymentGatewayRequest,
  UpdatePaymentGatewayResponse
} from '../models/payment-gateway.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentGatewayService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get all payment gateways
   */
  getPaymentGateways(): Observable<PaymentGatewayApiResponse<PaymentGateway[]>> {
    return this.http.get<PaymentGatewayApiResponse<PaymentGateway[]>>(`${this.API_URL}/admin/v1/payment-gateways`);
  }

  /**
   * Get payment gateway by ID
   */
  getPaymentGatewayById(id: string): Observable<PaymentGatewayApiResponse<PaymentGateway>> {
    return this.http.get<PaymentGatewayApiResponse<PaymentGateway>>(`${this.API_URL}/admin/v1/payment-gateways/${id}`);
  }

  /**
   * Get payment gateway by UID
   */
  getPaymentGatewayByUid(uid: string): Observable<PaymentGatewayApiResponse<PaymentGateway>> {
    return this.http.get<PaymentGatewayApiResponse<PaymentGateway>>(`${this.API_URL}/admin/v1/payment-gateways/uid/${uid}`);
  }

  /**
   * Create a new payment gateway
   */
  createPaymentGateway(paymentGatewayData: CreatePaymentGatewayRequest): Observable<CreatePaymentGatewayResponse> {
    return this.http.post<CreatePaymentGatewayResponse>(`${this.API_URL}/admin/v1/payment-gateways`, paymentGatewayData);
  }

  /**
   * Update payment gateway
   */
  updatePaymentGateway(uid: string, paymentGatewayData: UpdatePaymentGatewayRequest): Observable<UpdatePaymentGatewayResponse> {
    return this.http.put<UpdatePaymentGatewayResponse>(`${this.API_URL}/admin/v1/payment-gateways/uid/${uid}`, paymentGatewayData);
  }

  /**
   * Delete payment gateway
   */
  deletePaymentGateway(uid: string): Observable<PaymentGatewayApiResponse<boolean>> {
    return this.http.delete<PaymentGatewayApiResponse<boolean>>(`${this.API_URL}/admin/v1/payment-gateways/uid/${uid}`);
  }

  /**
   * Activate payment gateway
   */
  activatePaymentGateway(uid: string): Observable<PaymentGatewayApiResponse<PaymentGateway>> {
    return this.http.post<PaymentGatewayApiResponse<PaymentGateway>>(`${this.API_URL}/admin/v1/payment-gateways/uid/${uid}/activate`, {});
  }

  /**
   * Deactivate payment gateway
   */
  deactivatePaymentGateway(uid: string): Observable<PaymentGatewayApiResponse<PaymentGateway>> {
    return this.http.post<PaymentGatewayApiResponse<PaymentGateway>>(`${this.API_URL}/admin/v1/payment-gateways/uid/${uid}/deactivate`, {});
  }
}
