import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Role, 
  CreateRoleRequest, 
  UpdateRoleRequest,
  CreateRoleResponse, 
  ApiResponse,
  RolePermissionAssignmentRequest,
  RolePermissionAssignmentResponse,
  BulkRolePermissionAssignmentRequest,
  BulkRolePermissionAssignmentResponse 
} from '../models/role.model';
import { Permission } from '../models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Create a new role
   */
  createRole(roleData: CreateRoleRequest): Observable<CreateRoleResponse> {
    return this.http.post<CreateRoleResponse>(`${this.API_URL}/admin/v1/roles`, roleData);
  }

  /**
   * Get all roles
   */
  getRoles(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(`${this.API_URL}/admin/v1/roles`);
  }

  /**
   * Get role by ID
   */
  getRoleById(id: number): Observable<ApiResponse<Role>> {
    return this.http.get<ApiResponse<Role>>(`${this.API_URL}/admin/v1/roles/${id}`);
  }

  /**
   * Update role
   */
  updateRole(id: number, roleData: UpdateRoleRequest): Observable<ApiResponse<Role>> {
    return this.http.put<ApiResponse<Role>>(`${this.API_URL}/admin/v1/roles/${id}`, roleData);
  }

  /**
   * Delete role
   */
  deleteRole(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/admin/v1/roles/${id}`);
  }

  /**
   * Get role by name
   */
  getRoleByName(name: string): Observable<ApiResponse<Role>> {
    return this.http.get<ApiResponse<Role>>(`${this.API_URL}/admin/v1/roles/name/${name}`);
  }

  /**
   * Check if role exists
   */
  roleExists(name: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.API_URL}/admin/v1/roles/exists/${name}`);
  }

  /**
   * Get permissions assigned to a role
   */
  getRolePermissions(roleId: number): Observable<ApiResponse<Permission[]>> {
    return this.http.get<ApiResponse<Permission[]>>(`${this.API_URL}/admin/v1/roles/${roleId}/permissions`);
  }

  /**
   * Assign permissions to a role
   */
  assignPermissionsToRole(roleId: number, permissionIds: number[], reason?: string): Observable<RolePermissionAssignmentResponse> {
    const request: RolePermissionAssignmentRequest = { 
      permissionIds,
      ...(reason && { reason })
    };
    return this.http.post<RolePermissionAssignmentResponse>(`${this.API_URL}/admin/v1/roles/${roleId}/permissions`, request);
  }

  /**
   * Remove permissions from a role (bulk operation)
   */
  removePermissionsFromRole(roleId: number, permissionIds: number[], reason?: string): Observable<RolePermissionAssignmentResponse> {
    const request: RolePermissionAssignmentRequest = { 
      permissionIds,
      ...(reason && { reason })
    };
    return this.http.delete<RolePermissionAssignmentResponse>(`${this.API_URL}/admin/v1/roles/${roleId}/permissions`, { body: request });
  }

  /**
   * Remove a specific permission from a role
   */
  removePermissionFromRole(roleId: number, permissionId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/admin/v1/roles/${roleId}/permissions/${permissionId}`);
  }

  /**
   * Get roles that have a specific permission
   */
  getRolesByPermission(permissionId: number): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(`${this.API_URL}/admin/v1/permissions/${permissionId}/roles`);
  }

  /**
   * Bulk assign permissions to multiple roles
   */
  bulkAssignPermissionsToRoles(roleIds: number[], permissionIds: number[], reason?: string): Observable<BulkRolePermissionAssignmentResponse> {
    const request: BulkRolePermissionAssignmentRequest = {
      roleIds,
      permissionIds,
      ...(reason && { reason })
    };
    return this.http.post<BulkRolePermissionAssignmentResponse>(`${this.API_URL}/admin/v1/roles/bulk-assign-permissions`, request);
  }

  /**
   * Check if a role has a specific permission
   */
  roleHasPermission(roleId: number, permissionId: number): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.API_URL}/admin/v1/roles/${roleId}/permissions/${permissionId}/exists`);
  }
}
