import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

export interface ChangePasswordResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: boolean;
}

export interface LoginResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: {
    authMessage: string;
    token: string;
    refreshToken: string;
    id: string;
    uid: string;
    username: string;
    name: string;
    email: string;
    requirePasswordChange: boolean;
    roles: string[];
  };
}

export interface User {
  id: string;
  uid: string;
  username: string;
  name: string;
  email: string;
  requirePasswordChange?: boolean;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_BASE_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize user from localStorage on service creation
    this.initializeUser();
  }

  private initializeUser(): void {
    const token = this.getToken();
    const user = this.getUser();
    
    if (token && user) {
      this.currentUserSubject.next(user);
    } else {
      this.logout();
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Development authentication bypass
    if (environment.enableDevAuth && 
        credentials.username === environment.devCredentials?.username && 
        credentials.password === environment.devCredentials?.password) {
      
      const mockResponse: LoginResponse = {
        status: true,
        statusCode: 200,
        message: 'Development login successful',
        data: {
          authMessage: 'Development mode authentication',
          token: this.generateDevToken(),
          refreshToken: this.generateDevToken(),
          id: 'dev-user-1',
          uid: 'dev-uid-1',
          username: credentials.username,
          name: 'Development User',
          email: 'dev@example.com',
          requirePasswordChange: false,
          roles: ['ADMIN', 'USER']
        }
      };
      
      this.setToken(mockResponse.data.token);
      this.setRefreshToken(mockResponse.data.refreshToken);
      this.setUser(mockResponse.data);
      this.currentUserSubject.next(mockResponse.data);
      
      return new Observable(observer => {
        observer.next(mockResponse);
        observer.complete();
      });
    }

    // Production authentication
    return this.http.post<LoginResponse>(`${this.API_BASE_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.status && response.data) {
            this.setToken(response.data.token);
            this.setRefreshToken(response.data.refreshToken);
            this.setUser(response.data);
            this.currentUserSubject.next(response.data);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Check if token is expired
    return !this.isTokenExpired();
  }

  private generateDevToken(): string {
    // Generate a simple development token
    const payload = {
      sub: 'dev-user',
      exp: Date.now() / 1000 + (24 * 60 * 60), // 24 hours
      iat: Date.now() / 1000,
      roles: ['ADMIN', 'USER']
    };
    
    // Simple base64 encoding for development
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payloadEncoded = btoa(JSON.stringify(payload));
    const signature = btoa('dev-signature');
    
    return `dev-token-${header}.${payloadEncoded}.${signature}`;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private setUser(user: User | any): void {
    // Ensure we store the complete user object including requirePasswordChange
    const userToStore: User = {
      id: user.id,
      uid: user.uid,
      username: user.username,
      name: user.name,
      email: user.email,
      requirePasswordChange: user.requirePasswordChange || false,
      roles: user.roles || []
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(userToStore));
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.roles.includes(role) : false;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Refresh the access token using the refresh token
   */
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    // Development mode - generate new dev token
    if (environment.enableDevAuth && refreshToken.startsWith('dev-token-')) {
      const newToken = this.generateDevToken();
      const newRefreshToken = this.generateDevToken();
      
      this.setToken(newToken);
      this.setRefreshToken(newRefreshToken);
      
      const mockResponse: LoginResponse = {
        status: true,
        statusCode: 200,
        message: 'Token refreshed successfully',
        data: {
          authMessage: 'Development token refreshed',
          token: newToken,
          refreshToken: newRefreshToken,
          id: 'dev-user-1',
          uid: 'dev-uid-1',
          username: 'developer',
          name: 'Development User',
          email: 'dev@example.com',
          requirePasswordChange: false,
          roles: ['ADMIN', 'USER']
        }
      };
      
      return new Observable(observer => {
        observer.next(mockResponse);
        observer.complete();
      });
    }

    // Production mode - call the refresh endpoint
    return this.http.post<LoginResponse>(`${this.API_BASE_URL}/auth/refresh`, {}, {
      headers: {
        'X-REFRESH-TOKEN': refreshToken
      }
    }).pipe(
      tap(response => {
        if (response.status && response.data) {
          this.setToken(response.data.token);
          this.setRefreshToken(response.data.refreshToken);
          this.setUser(response.data);
          this.currentUserSubject.next(response.data);
        }
      })
    );
  }

  /**
   * Check if the current token is expired
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    // Development mode - never expired
    if (environment.enableDevAuth && token.startsWith('dev-token-')) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp <= currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Change user password
   */
  changePassword(request: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    // Always call the real API endpoint for password changes
    // This is a critical security operation that should always go through the server
    console.log('Calling password change API:', `${this.API_BASE_URL}/admin/v1/users/change-password`);
    console.log('Request payload:', request);
    
    return this.http.post<ChangePasswordResponse>(`${this.API_BASE_URL}/admin/v1/users/change-password`, request);
  }

  /**
   * Update user data in localStorage and BehaviorSubject
   */
  updateUserData(user: User): void {
    this.setUser(user);
    this.currentUserSubject.next(user);
  }
}
