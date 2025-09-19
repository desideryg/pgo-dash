import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Permission, 
  CreatePermissionRequest, 
  UpdatePermissionRequest,
  CreatePermissionResponse, 
  PermissionListResponse,
  AvailablePermissionsResponse,
  ApiResponse 
} from '../models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Create a new permission
   */
  createPermission(permissionData: CreatePermissionRequest): Observable<CreatePermissionResponse> {
    return this.http.post<CreatePermissionResponse>(`${this.API_URL}/admin/v1/permissions`, permissionData);
  }

  /**
   * Get all permissions with pagination
   */
  getPermissions(page: number = 0, size: number = 20, sort: string = 'name,asc'): Observable<PermissionListResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    
    return this.http.get<PermissionListResponse>(`${this.API_URL}/admin/v1/permissions`, { params });
  }

  /**
   * Get permission by ID
   */
  getPermissionById(id: number): Observable<ApiResponse<Permission>> {
    return this.http.get<ApiResponse<Permission>>(`${this.API_URL}/admin/v1/permissions/${id}`);
  }

  /**
   * Update permission
   */
  updatePermission(id: number, permissionData: UpdatePermissionRequest): Observable<ApiResponse<Permission>> {
    return this.http.put<ApiResponse<Permission>>(`${this.API_URL}/admin/v1/permissions/${id}`, permissionData);
  }

  /**
   * Delete permission
   */
  deletePermission(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/admin/v1/permissions/${id}`);
  }

  /**
   * Search permissions by name
   */
  searchPermissions(query: string, page: number = 0, size: number = 20): Observable<PermissionListResponse> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PermissionListResponse>(`${this.API_URL}/admin/v1/permissions/search`, { params });
  }

  /**
   * Get permissions by resource
   */
  getPermissionsByResource(resource: string, page: number = 0, size: number = 20): Observable<PermissionListResponse> {
    const params = new HttpParams()
      .set('resource', resource)
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PermissionListResponse>(`${this.API_URL}/admin/v1/permissions/resource`, { params });
  }

  /**
   * Get permissions by scope type
   */
  getPermissionsByScope(scopeType: string, page: number = 0, size: number = 20): Observable<PermissionListResponse> {
    const params = new HttpParams()
      .set('scopeType', scopeType)
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PermissionListResponse>(`${this.API_URL}/admin/v1/permissions/scope`, { params });
  }

  /**
   * Get global permissions
   */
  getGlobalPermissions(page: number = 0, size: number = 20): Observable<PermissionListResponse> {
    const params = new HttpParams()
      .set('global', 'true')
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PermissionListResponse>(`${this.API_URL}/admin/v1/permissions/global`, { params });
  }

  /**
   * Get scoped permissions
   */
  getScopedPermissions(page: number = 0, size: number = 20): Observable<PermissionListResponse> {
    const params = new HttpParams()
      .set('scoped', 'true')
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PermissionListResponse>(`${this.API_URL}/admin/v1/permissions/scoped`, { params });
  }

  /**
   * Check if permission exists by name
   */
  permissionExists(name: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.API_URL}/admin/v1/permissions/exists/${encodeURIComponent(name)}`);
  }

  /**
   * Get permissions by scope type and scope ID
   */
  getPermissionsByScoped(scopeType: string, scopeId: string): Observable<ApiResponse<Permission[]>> {
    return this.http.get<ApiResponse<Permission[]>>(`${this.API_URL}/admin/v1/permissions/scope/${scopeType}/${encodeURIComponent(scopeId)}`);
  }

  /**
   * Get all available permission combinations
   */
  getAvailablePermissions(): Observable<AvailablePermissionsResponse> {
    return this.http.get<AvailablePermissionsResponse>(`${this.API_URL}/admin/v1/permissions/available`);
  }
}
