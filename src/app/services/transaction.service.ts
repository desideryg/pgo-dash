import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, TransactionResponse, TransactionFilters } from '../models/transaction.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/admin/v1/transactions`;

  constructor(private http: HttpClient) {}

  getTransactions(filters: TransactionFilters = {}): Observable<TransactionResponse> {
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

    return this.http.get<TransactionResponse>(this.apiUrl, { params });
  }

  getTransactionById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  getTransactionByUid(uid: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/uid/${uid}`);
  }

  getTransactionByInternalId(internalTransactionId: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/internal/${internalTransactionId}`);
  }

  getTransactionByMerchantId(merchantTransactionId: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/merchant/${merchantTransactionId}`);
  }

  getTransactionByExternalId(externalTransactionId: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/external/${externalTransactionId}`);
  }

  getTransactionByPspId(pspTransactionId: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/psp/${pspTransactionId}`);
  }

  // Export transactions to CSV
  exportTransactions(filters: TransactionFilters = {}): Observable<Blob> {
    let params = new HttpParams();
    
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }
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

    return this.http.get(`${this.apiUrl}/export`, { 
      params,
      responseType: 'blob'
    });
  }
}
