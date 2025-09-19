import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Disbursement, DisbursementResponse, DisbursementFilters } from '../models/disbursement.model';

@Injectable({
  providedIn: 'root'
})
export class DisbursementService {
  private apiUrl = `${environment.apiUrl}/admin/v1/disbursements`;

  constructor(private http: HttpClient) {}

  /**
   * Get disbursements by transaction UID
   */
  getDisbursementsByTransaction(transactionUid: string): Observable<DisbursementResponse> {
    return this.http.get<DisbursementResponse>(`${this.apiUrl}/transaction/uid/${transactionUid}`);
  }

  /**
   * Get all disbursements with filters
   */
  getDisbursements(filters: DisbursementFilters = {}): Observable<DisbursementResponse> {
    let params = new HttpParams();

    // Convert page to 0-based for Spring Boot
    const page = filters.page ? (filters.page - 1).toString() : '0';
    params = params.set('page', page);

    if (filters.size) {
      params = params.set('size', filters.size.toString());
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.merchantId) {
      params = params.set('merchantId', filters.merchantId);
    }
    if (filters.pgoId) {
      params = params.set('pgoId', filters.pgoId);
    }
    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }

    return this.http.get<DisbursementResponse>(this.apiUrl, { params });
  }

  /**
   * Get disbursement by ID
   */
  getDisbursementById(id: string): Observable<Disbursement> {
    return this.http.get<Disbursement>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get disbursement by UID
   */
  getDisbursementByUid(uid: string): Observable<Disbursement> {
    return this.http.get<Disbursement>(`${this.apiUrl}/uid/${uid}`);
  }

  /**
   * Retry a failed disbursement
   */
  retryDisbursement(uid: string): Observable<{status: boolean, statusCode: number, message: string, data: any}> {
    return this.http.post<{status: boolean, statusCode: number, message: string, data: any}>(
      `${this.apiUrl}/uid/${uid}/retry`,
      {}
    );
  }
}
