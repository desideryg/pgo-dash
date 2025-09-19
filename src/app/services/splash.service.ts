import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SplashResponse } from '../models/splash.model';

@Injectable({
  providedIn: 'root'
})
export class SplashService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get API splash information
   */
  getSplashInfo(): Observable<SplashResponse> {
    return this.http.get<SplashResponse>(`${this.API_URL}/public/v1/splash`);
  }
}
