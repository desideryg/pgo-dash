import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  User, 
  CreateUserRequest, 
  CreateUserResponse, 
  ApiResponse 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Create a new user
   */
  createUser(userData: CreateUserRequest): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(`${this.API_URL}/admin/v1/users`, userData);
  }

  /**
   * Get all users
   */
  getUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.API_URL}/admin/v1/users`);
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.API_URL}/admin/v1/users/${id}`);
  }

  /**
   * Update user
   */
  updateUser(id: string, userData: Partial<CreateUserRequest>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.API_URL}/admin/v1/users/${id}`, userData);
  }

  /**
   * Delete user
   */
  deleteUser(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/admin/v1/users/${id}`);
  }

  /**
   * Activate user
   */
  activateUser(uid: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.API_URL}/admin/v1/users/uid/${uid}/activate`, {});
  }

  /**
   * Deactivate user
   */
  deactivateUser(uid: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.API_URL}/admin/v1/users/uid/${uid}/deactivate`, {});
  }

  /**
   * Lock user
   */
  lockUser(uid: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.API_URL}/admin/v1/users/uid/${uid}/lock`, {});
  }

  /**
   * Unlock user
   */
  unlockUser(uid: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.API_URL}/admin/v1/users/uid/${uid}/unlock`, {});
  }
}
