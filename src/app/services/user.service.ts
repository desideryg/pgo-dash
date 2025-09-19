import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  User, 
  CreateUserRequest, 
  CreateUserResponse, 
  ApiResponse,
  UserPermissionSummaryResponse,
  UserPermissionAssignmentRequest,
  UserPermissionAssignmentResponse,
  BulkUserPermissionAssignmentRequest,
  BulkUserPermissionAssignmentResponse 
} from '../models/user.model';
import { Permission } from '../models/permission.model';

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

  /**
   * Get direct permissions assigned to a user
   */
  getUserPermissions(userId: string): Observable<ApiResponse<Permission[]>> {
    return this.http.get<ApiResponse<Permission[]>>(`${this.API_URL}/admin/v1/users/${userId}/permissions`);
  }

  /**
   * Assign permissions directly to a user
   */
  assignPermissionsToUser(userId: string, permissionIds: number[], reason?: string, expiresAt?: string): Observable<UserPermissionAssignmentResponse> {
    const request: UserPermissionAssignmentRequest = { 
      permissionIds,
      ...(reason && { reason }),
      ...(expiresAt && { expiresAt })
    };
    return this.http.post<UserPermissionAssignmentResponse>(`${this.API_URL}/admin/v1/users/${userId}/permissions`, request);
  }

  /**
   * Remove permissions from a user (bulk operation)
   */
  removePermissionsFromUser(userId: string, permissionIds: number[], reason?: string): Observable<UserPermissionAssignmentResponse> {
    const request: UserPermissionAssignmentRequest = { 
      permissionIds,
      ...(reason && { reason })
    };
    return this.http.delete<UserPermissionAssignmentResponse>(`${this.API_URL}/admin/v1/users/${userId}/permissions`, { body: request });
  }

  /**
   * Remove a specific permission from a user
   */
  removePermissionFromUser(userId: string, permissionId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/admin/v1/users/${userId}/permissions/${permissionId}`);
  }

  /**
   * Check if a user has a specific permission from any source (direct or role-based)
   */
  userHasPermission(userId: string, permissionId: number): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.API_URL}/admin/v1/users/${userId}/permissions/${permissionId}/exists`);
  }

  /**
   * Check if a user has a specific permission directly assigned (not from roles)
   */
  userHasDirectPermission(userId: string, permissionId: number): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.API_URL}/admin/v1/users/${userId}/permissions/${permissionId}/direct-exists`);
  }

  /**
   * Get comprehensive user permission summary (role-based + direct permissions)
   */
  getUserPermissionSummary(userId: string): Observable<UserPermissionSummaryResponse> {
    return this.http.get<UserPermissionSummaryResponse>(`${this.API_URL}/admin/v1/users/${userId}/permissions/summary`);
  }

  /**
   * Bulk assign permissions to multiple users
   */
  bulkAssignPermissionsToUsers(userIds: number[], permissionIds: number[], reason?: string, expiresAt?: string): Observable<BulkUserPermissionAssignmentResponse> {
    const request: BulkUserPermissionAssignmentRequest = {
      userIds,
      permissionIds,
      ...(reason && { reason }),
      ...(expiresAt && { expiresAt })
    };
    return this.http.post<BulkUserPermissionAssignmentResponse>(`${this.API_URL}/admin/v1/users/bulk-assign-permissions`, request);
  }
}
