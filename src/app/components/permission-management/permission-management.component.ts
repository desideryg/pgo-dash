import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PermissionService } from '../../services/permission.service';
import { RoleService } from '../../services/role.service';
import { UserService } from '../../services/user.service';
import { MerchantService } from '../../services/merchant.service';
import { 
  Permission, 
  CreatePermissionRequest,
  AvailablePermission
} from '../../models/permission.model';
import { Role } from '../../models/role.model';
import { User, UserPermissionSummary } from '../../models/user.model';
import { ConfigService } from '../../services/config.service';
import { ConfigOption } from '../../models/config.model';

@Component({
  selector: 'app-permission-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './permission-management.component.html',
  styleUrls: ['./permission-management.component.css']
})
export class PermissionManagementComponent implements OnInit {
  permissions: Permission[] = [];
  filteredPermissions: Permission[] = [];
  availablePermissions: AvailablePermission[] = [];
  filteredAvailablePermissions: AvailablePermission[] = [];
  loading = false;
  error = '';
  success = '';
  searchTerm = '';
  showCreateForm = false;
  selectedPermission: Permission | null = null;
  showDetailsModal = false;
  showEditForm = false;
  editingPermission: Permission | null = null;
  showAvailablePermissions = false;

  // Role permissions functionality
  showRolePermissions = false;
  roles: Role[] = [];
  selectedRole: Role | null = null;
  rolePermissions: Permission[] = [];
  showRolePermissionModal = false;
  loadingRolePermissions = false;
  
  // Permission assignment functionality
  showAssignPermissionsForm = false;
  availablePermissionsForAssignment: Permission[] = [];
  selectedPermissionsForAssignment: number[] = [];
  assignmentReason = '';
  loadingAssignment = false;
  
  // Permission removal functionality
  showRemovePermissionsForm = false;
  selectedPermissionsForRemoval: number[] = [];
  removalReason = '';
  loadingRemoval = false;
  
  // Bulk role-permission assignment functionality
  showBulkAssignmentForm = false;
  selectedRolesForBulkAssignment: number[] = [];
  selectedPermissionsForBulkAssignment: number[] = [];
  bulkAssignmentReason = '';
  loadingBulkAssignment = false;
  showOnlyAssignablePermissions = true;
  
  // Permission validation cache
  rolePermissionCache = new Map<string, boolean>();
  
  // Permission-to-roles functionality
  showPermissionRolesModal = false;
  selectedPermissionForRoles: Permission | null = null;
  permissionRoles: Role[] = [];
  loadingPermissionRoles = false;
  
  // Permission-to-users functionality
  showPermissionUsersModal = false;
  selectedPermissionForUsers: Permission | null = null;
  permissionUsers: User[] = [];
  loadingPermissionUsers = false;
  
  // User permissions functionality
  showUserPermissions = false;
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  userPermissionSummary: UserPermissionSummary | null = null;
  showUserPermissionModal = false;
  loadingUserPermissions = false;
  userSearchTerm = '';
  selectedUserStatus = '';
  loadingUsers = false;
  activePermissionTab = 'all'; // 'all', 'role-based', 'direct'
  
  // User permission assignment functionality
  showAssignUserPermissionsForm = false;
  availablePermissionsForUserAssignment: Permission[] = [];
  selectedPermissionsForUserAssignment: number[] = [];
  userAssignmentReason = '';
  userAssignmentExpiresAt = '';
  loadingUserAssignment = false;
  
  // User permission checking functionality
  showPermissionCheckModal = false;
  selectedPermissionForCheck: Permission | null = null;
  selectedUserForPermissionCheck: User | null = null;
  permissionCheckResult: boolean | null = null;
  directPermissionCheckResult: boolean | null = null;
  loadingPermissionCheck = false;
  loadingDirectPermissionCheck = false;
  
  // User permission removal functionality
  showRemoveUserPermissionsForm = false;
  selectedPermissionsForUserRemoval: number[] = [];
  userRemovalReason = '';
  loadingUserRemoval = false;
  
  // Bulk user permission assignment functionality
  showBulkUserAssignmentForm = false;
  selectedUsersForBulkAssignment: string[] = [];
  selectedPermissionsForBulkUserAssignment: number[] = [];
  bulkUserAssignmentReason = '';
  bulkUserAssignmentExpiresAt = '';
  loadingBulkUserAssignment = false;
  
  // Helper property for date input minimum value
  get todayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Filter options
  selectedResource = '';
  selectedScopeType = '';
  selectedAction = '';
  scopeIdFilter = '';
  showAdvancedFilters = false;

  // Configuration data
  permissionActions: ConfigOption[] = [];
  permissionResources: ConfigOption[] = [];
  permissionScopeTypes: ConfigOption[] = [];
  
  // Scope ID selection data
  availableMerchants: any[] = [];
  availableUsers: User[] = [];
  loadingMerchants = false;
  showManualScopeInput = false;
  
  createPermissionForm: FormGroup;
  editPermissionForm: FormGroup;

  // Pagination
  currentPage = 0;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  constructor(
    private permissionService: PermissionService,
    private roleService: RoleService,
    private userService: UserService,
    private merchantService: MerchantService,
    private configService: ConfigService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.createPermissionForm = this.fb.group({
      name: [''],
      action: ['', [Validators.required]],
      resource: ['', [Validators.required]],
      scopeType: ['', [Validators.required]],
      scopeId: [''],
      description: ['', [Validators.required]]
    });

    this.editPermissionForm = this.fb.group({
      description: ['', [Validators.required]]
    });

    // Watch for scope type changes to handle scope ID requirement
    this.createPermissionForm.get('scopeType')?.valueChanges.subscribe(scopeType => {
      const scopeIdControl = this.createPermissionForm.get('scopeId');
      if (scopeType === 'GLOBAL') {
        scopeIdControl?.clearValidators();
        scopeIdControl?.setValue('');
      } else {
        const validators = [Validators.required];
        
        // Add pattern validation based on scope type
        if (scopeType === 'MERCHANT') {
          validators.push(Validators.pattern(/^merchant:[A-Z0-9]{26}$/));
        } else if (scopeType === 'USER') {
          validators.push(Validators.pattern(/^user:[A-Z0-9]{26}$/));
        }
        
        scopeIdControl?.setValidators(validators);
      }
      scopeIdControl?.updateValueAndValidity();
      
      // Load appropriate data for scope selection
      this.onScopeTypeChange(scopeType);
    });
  }

  ngOnInit(): void {
    this.loadConfiguration();
    this.loadPermissions();
    this.loadAvailablePermissions();
    this.loadRoles();
    this.loadUsers();
  }

  loadConfiguration(): void {
    this.configService.loadConfig().subscribe({
      next: (config) => {
        if (config) {
          this.permissionActions = this.configService.getPermissionActionTypes();
          this.permissionResources = this.configService.getPermissionResourceTypes();
          this.permissionScopeTypes = this.configService.getPermissionScopeTypes();
          
          
          // Set default scope type to GLOBAL if available
          const globalScope = this.permissionScopeTypes.find(scope => scope.value === 'GLOBAL');
          if (globalScope) {
            this.createPermissionForm.patchValue({ scopeType: globalScope.value });
          }
        }
      },
      error: (error) => {
        console.error('Error loading configuration:', error);
        this.error = 'Failed to load permission configuration';
      }
    });
  }

  loadPermissions(): void {
    this.loading = true;
    this.error = '';

    this.permissionService.getPermissions(this.currentPage, this.itemsPerPage, 'name,asc').subscribe({
      next: (response) => {
        if (response.status) {
          this.permissions = response.data;
          this.totalItems = response.totalElements;
          this.totalPages = response.totalPages;
          this.applyFilters();
        } else {
          this.error = response.message || 'Failed to load permissions';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.error = 'Failed to load permissions. Please try again.';
        this.loading = false;
      }
    });
  }

  loadAvailablePermissions(): void {
    this.permissionService.getAvailablePermissions().subscribe({
      next: (response) => {
        if (response.status) {
          this.availablePermissions = response.data;
          this.applyAvailablePermissionsFilters();
        } else {
          this.error = response.message || 'Failed to load available permissions';
        }
      },
      error: (error) => {
        console.error('Error loading available permissions:', error);
        this.error = 'Failed to load available permissions. Please try again.';
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.permissions];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(permission =>
        permission.name.toLowerCase().includes(search) ||
        permission.description.toLowerCase().includes(search) ||
        permission.action.toLowerCase().includes(search) ||
        permission.resource.toLowerCase().includes(search)
      );
    }

    // Apply resource filter
    if (this.selectedResource) {
      filtered = filtered.filter(permission => permission.resource === this.selectedResource);
    }

    // Apply scope type filter
    if (this.selectedScopeType) {
      filtered = filtered.filter(permission => permission.scopeType === this.selectedScopeType);
    }

    // Apply action filter
    if (this.selectedAction) {
      filtered = filtered.filter(permission => permission.action === this.selectedAction);
    }

    // Apply scope ID filter
    if (this.scopeIdFilter.trim()) {
      const scopeSearch = this.scopeIdFilter.toLowerCase();
      filtered = filtered.filter(permission => 
        permission.scopeId && permission.scopeId.toLowerCase().includes(scopeSearch)
      );
    }

    this.filteredPermissions = filtered;
  }

  applyAvailablePermissionsFilters(): void {
    let filtered = [...this.availablePermissions];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(permission =>
        permission.permissionName.toLowerCase().includes(search) ||
        permission.actionDisplayName.toLowerCase().includes(search) ||
        permission.resourceDisplayName.toLowerCase().includes(search) ||
        permission.actionDescription.toLowerCase().includes(search) ||
        permission.resourceDescription.toLowerCase().includes(search)
      );
    }

    // Apply resource filter
    if (this.selectedResource) {
      filtered = filtered.filter(permission => permission.resource === this.selectedResource);
    }

    // Apply action filter
    if (this.selectedAction) {
      filtered = filtered.filter(permission => permission.action === this.selectedAction);
    }

    this.filteredAvailablePermissions = filtered;
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadPermissions();
    }
  }

  showCreatePermissionForm(): void {
    this.showCreateForm = true;
    
    // Reset form with default scope type
    const globalScope = this.permissionScopeTypes.find(scope => scope.value === 'GLOBAL');
    this.createPermissionForm.reset({
      scopeType: globalScope?.value || ''
    });
    
    this.error = '';
    this.success = '';
  }

  hideCreateForm(): void {
    this.showCreateForm = false;
    this.createPermissionForm.reset();
  }

  createPermission(): void {
    if (this.createPermissionForm.valid) {
      this.loading = true;
      this.error = '';

      const formValue = this.createPermissionForm.value;
      const permissionData: CreatePermissionRequest = {
        action: formValue.action,
        resource: formValue.resource,
        scopeType: formValue.scopeType,
        description: formValue.description
      };

      // Include custom name if provided (but avoid role names that might cause backend validation issues)
      if (formValue.name && formValue.name.trim()) {
        const customName = formValue.name.trim();
        const roleNames = [
          'SUPER_ADMIN', 'SYSTEM_ADMIN', 'SECURITY_ADMIN', 'BUSINESS_ADMIN', 'FINANCE_ADMIN', 
          'COMPLIANCE_ADMIN', 'MERCHANT_ADMIN', 'MERCHANT_USER', 'MERCHANT_FINANCE', 
          'MERCHANT_SUPPORT', 'PAYMENT_OPERATOR', 'PAYMENT_ANALYST', 'SETTLEMENT_OPERATOR', 
          'RECONCILIATION_USER', 'SUPPORT_AGENT', 'SUPPORT_SUPERVISOR', 'ESCALATION_MANAGER', 
          'TECHNICAL_ADMIN', 'DEVELOPER', 'SYSTEM_MONITOR', 'AUDITOR', 'COMPLIANCE_OFFICER', 
          'RISK_ANALYST'
        ];
        
        if (roleNames.includes(customName.toUpperCase())) {
          this.error = `Custom permission name "${customName}" conflicts with existing role names. Please choose a different name.`;
          this.loading = false;
          return;
        }
        
        permissionData.name = customName;
      }

      // Only include scopeId if it's not global scope
      if (formValue.scopeType !== 'GLOBAL' && formValue.scopeId) {
        permissionData.scopeId = formValue.scopeId;
      }

      // Debug: Log the request data
      console.log('Creating permission with data:', permissionData);

      this.permissionService.createPermission(permissionData).subscribe({
        next: (response) => {
          if (response.status) {
            this.success = 'Permission created successfully!';
            this.hideCreateForm();
            this.loadPermissions();
          } else {
            this.error = response.message || 'Failed to create permission';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating permission:', error);
          console.error('Full error object:', error);
          console.error('Request data that caused error:', permissionData);
          
          // Enhanced error message
          let errorMessage = 'Failed to create permission. Please try again.';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
            
            // Check if this is the role validation error
            if (errorMessage.includes('Invalid value name') && errorMessage.includes('SUPER_ADMIN')) {
              errorMessage = `Backend validation error: The backend is incorrectly validating permission names against role names. This appears to be a backend issue. Error: ${errorMessage}`;
            }
          }
          
          this.error = errorMessage;
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.createPermissionForm);
    }
  }

  showPermissionDetails(permission: Permission): void {
    this.selectedPermission = permission;
    this.showDetailsModal = true;
  }

  hideDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedPermission = null;
  }

  showEditPermissionForm(permission: Permission): void {
    this.editingPermission = permission;
    this.showEditForm = true;
    this.showDetailsModal = false;
    this.editPermissionForm.patchValue({
      description: permission.description
    });
    this.error = '';
    this.success = '';
  }

  hideEditForm(): void {
    this.showEditForm = false;
    this.editingPermission = null;
    this.editPermissionForm.reset();
  }

  updatePermission(): void {
    if (this.editPermissionForm.valid && this.editingPermission) {
      this.loading = true;
      this.error = '';

      const updateData = {
        description: this.editPermissionForm.value.description
      };

      this.permissionService.updatePermission(this.editingPermission.id, updateData).subscribe({
        next: (response) => {
          if (response.status) {
            this.success = 'Permission updated successfully!';
            this.hideEditForm();
            this.loadPermissions();
          } else {
            this.error = response.message || 'Failed to update permission';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating permission:', error);
          this.error = error.error?.message || 'Failed to update permission. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.editPermissionForm);
    }
  }

  getScopeTypeClass(scopeType: string): string {
    switch (scopeType) {
      case 'GLOBAL': return 'scope-global';
      case 'MERCHANT': return 'scope-merchant';
      case 'USER': return 'scope-user';
      default: return 'scope-default';
    }
  }

  getScopeIdPlaceholder(): string {
    const scopeType = this.createPermissionForm.get('scopeType')?.value;
    switch (scopeType) {
      case 'MERCHANT':
        return 'e.g., merchant:01ARZ3NDEKTSV4RRFFQ69G5FAV';
      case 'USER':
        return 'e.g., user:01ARZ3NDEKTSV4RRFFQ69G5FAV';
      default:
        return 'Enter scope ID';
    }
  }

  getScopeIdHelpText(): string {
    const scopeType = this.createPermissionForm.get('scopeType')?.value;
    switch (scopeType) {
      case 'MERCHANT':
        return 'Enter merchant UID with "merchant:" prefix (e.g., merchant:01ARZ3NDEKTSV4RRFFQ69G5FAV)';
      case 'USER':
        return 'Enter user UID with "user:" prefix (e.g., user:01ARZ3NDEKTSV4RRFFQ69G5FAV)';
      default:
        return 'Specific ID for scoped permissions';
    }
  }

  /**
   * Format scope ID for better display
   */
  formatScopeId(scopeId: string | null): string {
    if (!scopeId) return '';
    
    // If it's the new format with prefix, make it more readable
    if (scopeId.includes(':')) {
      const [prefix, id] = scopeId.split(':');
      return `${prefix.toUpperCase()}: ${id}`;
    }
    
    // Legacy format - return as is
    return scopeId;
  }

  /**
   * Get scope type from scope ID (for new format)
   */
  getScopeTypeFromId(scopeId: string | null): string {
    if (!scopeId || !scopeId.includes(':')) return '';
    return scopeId.split(':')[0].toUpperCase();
  }

  /**
   * Get the actual ID part from scope ID (for new format)
   */
  getActualIdFromScopeId(scopeId: string | null): string {
    if (!scopeId) return '';
    if (!scopeId.includes(':')) return scopeId;
    return scopeId.split(':')[1];
  }

  /**
   * Load merchants for scope ID selection
   */
  loadMerchantsForScopeSelection(): void {
    this.loadingMerchants = true;
    this.merchantService.getMerchants().subscribe({
      next: (response) => {
        if (response.status) {
          this.availableMerchants = response.data;
        } else {
          console.error('Failed to load merchants:', response.message);
        }
        this.loadingMerchants = false;
      },
      error: (error) => {
        console.error('Error loading merchants:', error);
        this.loadingMerchants = false;
      }
    });
  }

  /**
   * Load users for scope ID selection (reuse existing users array)
   */
  loadUsersForScopeSelection(): void {
    if (this.users.length === 0) {
      this.loadUsers();
    }
  }

  /**
   * Generate scope ID based on selected entity
   */
  generateScopeId(entityType: string, entityUid: string): string {
    return `${entityType.toLowerCase()}:${entityUid}`;
  }

  /**
   * Handle scope type change and load appropriate data
   */
  onScopeTypeChange(scopeType: string): void {
    if (scopeType === 'MERCHANT') {
      this.loadMerchantsForScopeSelection();
    } else if (scopeType === 'USER') {
      this.loadUsersForScopeSelection();
    }
    
    // Reset scope ID when scope type changes
    this.createPermissionForm.get('scopeId')?.setValue('');
    this.showManualScopeInput = false;
  }

  /**
   * Handle entity selection and generate scope ID
   */
  onEntitySelected(entityType: string, event: any): void {
    const selectedUid = event.target.value;
    if (selectedUid) {
      const generatedScopeId = this.generateScopeId(entityType, selectedUid);
      this.createPermissionForm.get('scopeId')?.setValue(generatedScopeId);
    } else {
      this.createPermissionForm.get('scopeId')?.setValue('');
    }
  }

  /**
   * Clear the selected scope ID
   */
  clearScopeId(): void {
    this.createPermissionForm.get('scopeId')?.setValue('');
    
    // Reset dropdowns
    const merchantSelect = document.getElementById('merchantSelect') as HTMLSelectElement;
    const userSelect = document.getElementById('userSelect') as HTMLSelectElement;
    if (merchantSelect) merchantSelect.value = '';
    if (userSelect) userSelect.value = '';
  }

  /**
   * Toggle manual scope input mode
   */
  toggleManualScopeInput(): void {
    this.showManualScopeInput = !this.showManualScopeInput;
    if (!this.showManualScopeInput) {
      this.createPermissionForm.get('scopeId')?.setValue('');
    }
  }

  getActionClass(action: string): string {
    switch (action) {
      case 'CREATE': return 'action-create';
      case 'READ': return 'action-read';
      case 'UPDATE': return 'action-update';
      case 'DELETE': return 'action-delete';
      case 'APPROVE': return 'action-approve';
      case 'AUDIT': return 'action-audit';
      default: return 'action-default';
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedResource = '';
    this.selectedScopeType = '';
    this.selectedAction = '';
    this.scopeIdFilter = '';
    this.applyFilters();
    this.applyAvailablePermissionsFilters();
  }

  toggleAvailablePermissions(): void {
    this.showAvailablePermissions = !this.showAvailablePermissions;
  }

  createPermissionFromAvailable(availablePermission: AvailablePermission): void {
    // Pre-populate the create form with the available permission data
    this.createPermissionForm.patchValue({
      name: availablePermission.permissionName,
      action: availablePermission.action,
      resource: availablePermission.resource,
      scopeType: 'GLOBAL', // Default to global scope
      description: `${availablePermission.actionDescription} for ${availablePermission.resourceDescription}`
    });
    
    this.showCreateForm = true;
    this.showAvailablePermissions = false;
    this.error = '';
    this.success = '';
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  clearMessages(): void {
    this.error = '';
    this.success = '';
  }

  checkPermissionExists(): void {
    const customName = this.createPermissionForm.get('name')?.value;
    if (customName && customName.trim()) {
      this.permissionService.permissionExists(customName.trim()).subscribe({
        next: (response) => {
          if (response.status && response.data) {
            this.createPermissionForm.get('name')?.setErrors({ exists: true });
          } else {
            // Clear the exists error if it was set before
            const nameControl = this.createPermissionForm.get('name');
            if (nameControl?.errors?.['exists']) {
              delete nameControl.errors['exists'];
              if (Object.keys(nameControl.errors).length === 0) {
                nameControl.setErrors(null);
              }
            }
          }
        },
        error: (error) => {
          console.error('Error checking permission existence:', error);
        }
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  trackByPermissionId(index: number, permission: Permission): number {
    return permission.id;
  }

  // Role permissions methods
  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (response) => {
        if (response.status) {
          this.roles = response.data;
        } else {
          console.error('Failed to load roles:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  toggleRolePermissions(): void {
    this.showRolePermissions = !this.showRolePermissions;
  }

  viewRolePermissions(role: Role): void {
    this.selectedRole = role;
    this.showRolePermissionModal = true;
    this.loadRolePermissions(role.id);
  }

  loadRolePermissions(roleId: number): void {
    this.loadingRolePermissions = true;
    this.rolePermissions = [];
    this.error = '';

    this.roleService.getRolePermissions(roleId).subscribe({
      next: (response) => {
        if (response.status) {
          this.rolePermissions = response.data;
        } else {
          this.error = response.message || 'Failed to load role permissions';
        }
        this.loadingRolePermissions = false;
      },
      error: (error) => {
        console.error('Error loading role permissions:', error);
        this.error = 'Failed to load role permissions. Please try again.';
        this.loadingRolePermissions = false;
      }
    });
  }

  hideRolePermissionModal(): void {
    this.showRolePermissionModal = false;
    this.selectedRole = null;
    this.rolePermissions = [];
    this.loadingRolePermissions = false;
  }


  getPermissionsByRole(roleId: number): Permission[] {
    return this.permissions.filter(permission => 
      permission.assignedRoles && permission.assignedRoles.some(role => role === roleId.toString())
    );
  }

  showAssignPermissionsModal(): void {
    this.showAssignPermissionsForm = true;
    // Use the enhanced validation method for more accurate results
    this.loadAvailablePermissionsForAssignmentWithValidation();
    this.selectedPermissionsForAssignment = [];
    this.assignmentReason = '';
  }

  hideAssignPermissionsModal(): void {
    this.showAssignPermissionsForm = false;
    this.availablePermissionsForAssignment = [];
    this.selectedPermissionsForAssignment = [];
    this.assignmentReason = '';
  }

  loadAvailablePermissionsForAssignment(): void {
    // Get permissions that are not already assigned to the current role
    const currentRolePermissionIds = this.rolePermissions.map(p => p.id);
    this.availablePermissionsForAssignment = this.permissions.filter(
      permission => !currentRolePermissionIds.includes(permission.id)
    );
  }

  togglePermissionSelection(permissionId: number): void {
    const index = this.selectedPermissionsForAssignment.indexOf(permissionId);
    if (index > -1) {
      this.selectedPermissionsForAssignment.splice(index, 1);
    } else {
      this.selectedPermissionsForAssignment.push(permissionId);
    }
  }

  isPermissionSelected(permissionId: number): boolean {
    return this.selectedPermissionsForAssignment.includes(permissionId);
  }

  assignPermissionsToRole(): void {
    if (this.selectedRole && this.selectedPermissionsForAssignment.length > 0) {
      this.loadingAssignment = true;
      this.error = '';

      this.roleService.assignPermissionsToRole(
        this.selectedRole.id, 
        this.selectedPermissionsForAssignment,
        this.assignmentReason || undefined
      ).subscribe({
        next: (response) => {
          if (response.status) {
            const assignedCount = response.data.assignedPermissions.length;
            const totalCount = response.data.totalPermissions;
            
            this.success = `Successfully assigned ${assignedCount} permission(s) to role. Total permissions: ${totalCount}`;
            
            // Refresh role permissions
            this.loadRolePermissions(this.selectedRole!.id);
            this.hideAssignPermissionsModal();
          } else {
            this.error = response.message || 'Failed to assign permissions to role';
          }
          this.loadingAssignment = false;
        },
        error: (error) => {
          console.error('Error assigning permissions to role:', error);
          this.error = 'Failed to assign permissions to role. Please try again.';
          this.loadingAssignment = false;
        }
      });
    }
  }

  selectAllAvailablePermissions(): void {
    this.selectedPermissionsForAssignment = this.availablePermissionsForAssignment.map(p => p.id);
  }

  deselectAllPermissions(): void {
    this.selectedPermissionsForAssignment = [];
  }

  // Permission removal methods
  showRemovePermissionsModal(): void {
    this.showRemovePermissionsForm = true;
    this.selectedPermissionsForRemoval = [];
    this.removalReason = '';
  }

  hideRemovePermissionsModal(): void {
    this.showRemovePermissionsForm = false;
    this.selectedPermissionsForRemoval = [];
    this.removalReason = '';
  }

  togglePermissionRemovalSelection(permissionId: number): void {
    const index = this.selectedPermissionsForRemoval.indexOf(permissionId);
    if (index > -1) {
      this.selectedPermissionsForRemoval.splice(index, 1);
    } else {
      this.selectedPermissionsForRemoval.push(permissionId);
    }
  }

  isPermissionSelectedForRemoval(permissionId: number): boolean {
    return this.selectedPermissionsForRemoval.includes(permissionId);
  }

  removePermissionsFromRole(): void {
    if (this.selectedRole && this.selectedPermissionsForRemoval.length > 0) {
      this.loadingRemoval = true;
      this.error = '';

      this.roleService.removePermissionsFromRole(
        this.selectedRole.id, 
        this.selectedPermissionsForRemoval,
        this.removalReason || undefined
      ).subscribe({
        next: (response) => {
          if (response.status) {
            const revokedCount = response.data.revokedPermissions?.length || 0;
            const totalCount = response.data.totalPermissions;
            
            this.success = `Successfully revoked ${revokedCount} permission(s) from role. Remaining permissions: ${totalCount}`;
            
            // Refresh role permissions
            this.loadRolePermissions(this.selectedRole!.id);
            this.hideRemovePermissionsModal();
          } else {
            this.error = response.message || 'Failed to revoke permissions from role';
          }
          this.loadingRemoval = false;
        },
        error: (error) => {
          console.error('Error revoking permissions from role:', error);
          this.error = 'Failed to revoke permissions from role. Please try again.';
          this.loadingRemoval = false;
        }
      });
    }
  }

  selectAllCurrentPermissions(): void {
    this.selectedPermissionsForRemoval = this.rolePermissions.map(p => p.id);
  }

  deselectAllRemovalPermissions(): void {
    this.selectedPermissionsForRemoval = [];
  }

  // Update the existing single permission removal to use the new bulk method
  removePermissionFromRole(roleId: number, permissionId: number): void {
    if (confirm('Are you sure you want to remove this permission from the role?')) {
      this.loadingRolePermissions = true;
      this.error = '';

      this.roleService.removePermissionsFromRole(roleId, [permissionId]).subscribe({
        next: (response) => {
          if (response.status) {
            const revokedCount = response.data.revokedPermissions?.length || 0;
            const totalCount = response.data.totalPermissions;
            this.success = `Successfully revoked ${revokedCount} permission(s) from role. Remaining permissions: ${totalCount}`;
            this.loadRolePermissions(roleId);
          } else {
            this.error = response.message || 'Failed to remove permission from role';
          }
          this.loadingRolePermissions = false;
        },
        error: (error) => {
          console.error('Error removing permission from role:', error);
          this.error = 'Failed to remove permission from role. Please try again.';
          this.loadingRolePermissions = false;
        }
      });
    }
  }

  // Bulk role-permission assignment methods
  showBulkAssignmentModal(): void {
    this.showBulkAssignmentForm = true;
    this.selectedRolesForBulkAssignment = [];
    this.selectedPermissionsForBulkAssignment = [];
    this.bulkAssignmentReason = '';
  }

  hideBulkAssignmentModal(): void {
    this.showBulkAssignmentForm = false;
    this.selectedRolesForBulkAssignment = [];
    this.selectedPermissionsForBulkAssignment = [];
    this.bulkAssignmentReason = '';
  }

  toggleRoleSelectionForBulkAssignment(roleId: number): void {
    const index = this.selectedRolesForBulkAssignment.indexOf(roleId);
    if (index > -1) {
      this.selectedRolesForBulkAssignment.splice(index, 1);
    } else {
      this.selectedRolesForBulkAssignment.push(roleId);
      // Preload permission checks for this role
      this.preloadRolePermissionChecks(roleId, this.permissions.map(p => p.id));
    }
  }

  isRoleSelectedForBulkAssignment(roleId: number): boolean {
    return this.selectedRolesForBulkAssignment.includes(roleId);
  }

  togglePermissionSelectionForBulkAssignment(permissionId: number): void {
    const index = this.selectedPermissionsForBulkAssignment.indexOf(permissionId);
    if (index > -1) {
      this.selectedPermissionsForBulkAssignment.splice(index, 1);
    } else {
      this.selectedPermissionsForBulkAssignment.push(permissionId);
    }
  }

  isPermissionSelectedForBulkAssignment(permissionId: number): boolean {
    return this.selectedPermissionsForBulkAssignment.includes(permissionId);
  }

  bulkAssignPermissionsToRoles(): void {
    if (this.selectedRolesForBulkAssignment.length > 0 && this.selectedPermissionsForBulkAssignment.length > 0) {
      this.loadingBulkAssignment = true;
      this.error = '';

      this.roleService.bulkAssignPermissionsToRoles(
        this.selectedRolesForBulkAssignment,
        this.selectedPermissionsForBulkAssignment,
        this.bulkAssignmentReason || undefined
      ).subscribe({
        next: (response) => {
          if (response.status) {
            const roleCount = this.selectedRolesForBulkAssignment.length;
            const permissionCount = this.selectedPermissionsForBulkAssignment.length;
            const affectedRoles = Object.values(response.data);
            
            this.success = `Successfully assigned ${permissionCount} permission(s) to ${roleCount} role(s). Total assignments processed: ${affectedRoles.length}`;
            
            // Refresh the roles data if we're showing role permissions
            if (this.showRolePermissions) {
              this.loadRoles();
            }
            
            this.hideBulkAssignmentModal();
          } else {
            this.error = response.message || 'Failed to bulk assign permissions to roles';
          }
          this.loadingBulkAssignment = false;
        },
        error: (error) => {
          console.error('Error bulk assigning permissions to roles:', error);
          this.error = 'Failed to bulk assign permissions to roles. Please try again.';
          this.loadingBulkAssignment = false;
        }
      });
    }
  }

  selectAllRolesForBulkAssignment(): void {
    this.selectedRolesForBulkAssignment = this.roles.map(r => r.id);
  }

  deselectAllRolesForBulkAssignment(): void {
    this.selectedRolesForBulkAssignment = [];
  }

  selectAllPermissionsForBulkAssignment(): void {
    this.selectedPermissionsForBulkAssignment = this.permissions.map(p => p.id);
  }

  deselectAllPermissionsForBulkAssignment(): void {
    this.selectedPermissionsForBulkAssignment = [];
  }

  // Permission validation utility methods
  checkRoleHasPermission(roleId: number, permissionId: number): Observable<boolean> {
    const cacheKey = `${roleId}-${permissionId}`;
    
    // Check cache first
    if (this.rolePermissionCache.has(cacheKey)) {
      return new Observable(observer => {
        observer.next(this.rolePermissionCache.get(cacheKey)!);
        observer.complete();
      });
    }

    // Make API call and cache result
    return this.roleService.roleHasPermission(roleId, permissionId).pipe(
      map(response => {
        const hasPermission = response.status && response.data;
        this.rolePermissionCache.set(cacheKey, hasPermission);
        return hasPermission;
      })
    );
  }

  clearPermissionCache(): void {
    this.rolePermissionCache.clear();
  }

  roleHasPermissionSync(roleId: number, permissionId: number): boolean | null {
    const cacheKey = `${roleId}-${permissionId}`;
    return this.rolePermissionCache.get(cacheKey) ?? null;
  }

  preloadRolePermissionChecks(roleId: number, permissionIds: number[]): void {
    permissionIds.forEach(permissionId => {
      this.checkRoleHasPermission(roleId, permissionId).subscribe();
    });
  }

  getPermissionsNotInRole(roleId: number): Permission[] {
    return this.permissions.filter(permission => {
      const hasPermission = this.roleHasPermissionSync(roleId, permission.id);
      return hasPermission === false;
    });
  }

  getPermissionsInRole(roleId: number): Permission[] {
    return this.permissions.filter(permission => {
      const hasPermission = this.roleHasPermissionSync(roleId, permission.id);
      return hasPermission === true;
    });
  }

  // Enhanced method to load available permissions with validation
  loadAvailablePermissionsForAssignmentWithValidation(): void {
    if (!this.selectedRole) return;
    
    // Clear cache for this role
    this.permissions.forEach(permission => {
      const cacheKey = `${this.selectedRole!.id}-${permission.id}`;
      this.rolePermissionCache.delete(cacheKey);
    });

    // Load permissions and check which ones are already assigned
    this.availablePermissionsForAssignment = [];
    let checksCompleted = 0;
    const totalChecks = this.permissions.length;

    this.permissions.forEach(permission => {
      this.checkRoleHasPermission(this.selectedRole!.id, permission.id).subscribe(hasPermission => {
        if (!hasPermission) {
          this.availablePermissionsForAssignment.push(permission);
        }
        checksCompleted++;
        
        // Sort when all checks are complete
        if (checksCompleted === totalChecks) {
          this.availablePermissionsForAssignment.sort((a, b) => a.name.localeCompare(b.name));
        }
      });
    });
  }

  // Smart filtering for bulk assignment
  getFilteredPermissionsForBulkAssignment(): Permission[] {
    if (!this.showOnlyAssignablePermissions || this.selectedRolesForBulkAssignment.length === 0) {
      return this.permissions;
    }

    // Show only permissions that can be assigned to at least one selected role
    return this.permissions.filter(permission => {
      return this.selectedRolesForBulkAssignment.some(roleId => {
        const hasPermission = this.roleHasPermissionSync(roleId, permission.id);
        return hasPermission === false; // Can be assigned if role doesn't have it
      });
    });
  }

  toggleSmartFiltering(): void {
    this.showOnlyAssignablePermissions = !this.showOnlyAssignablePermissions;
  }

  getAssignableRoleCount(permissionId: number): number {
    if (this.selectedRolesForBulkAssignment.length === 0) return 0;
    
    return this.selectedRolesForBulkAssignment.filter(roleId => {
      const hasPermission = this.roleHasPermissionSync(roleId, permissionId);
      return hasPermission === false;
    }).length;
  }

  // Permission-to-roles methods
  showPermissionRoles(permission: Permission): void {
    this.selectedPermissionForRoles = permission;
    this.showPermissionRolesModal = true;
    this.loadPermissionRoles(permission.id);
  }

  hidePermissionRolesModal(): void {
    this.showPermissionRolesModal = false;
    this.selectedPermissionForRoles = null;
    this.permissionRoles = [];
    this.loadingPermissionRoles = false;
  }

  loadPermissionRoles(permissionId: number): void {
    this.loadingPermissionRoles = true;
    this.permissionRoles = [];
    this.error = '';

    this.roleService.getRolesByPermission(permissionId).subscribe({
      next: (response) => {
        if (response.status) {
          this.permissionRoles = response.data;
        } else {
          this.error = response.message || 'Failed to load roles for permission';
        }
        this.loadingPermissionRoles = false;
      },
      error: (error) => {
        console.error('Error loading roles for permission:', error);
        this.error = 'Failed to load roles for permission. Please try again.';
        this.loadingPermissionRoles = false;
      }
    });
  }

  removeRoleFromPermission(roleId: number, permissionId: number): void {
    if (confirm('Are you sure you want to remove this permission from the role?')) {
      this.loadingPermissionRoles = true;
      this.error = '';

      this.roleService.removePermissionsFromRole(roleId, [permissionId]).subscribe({
        next: (response) => {
          if (response.status) {
            const revokedCount = response.data.revokedPermissions?.length || 0;
            this.success = `Successfully removed permission from role. Revoked ${revokedCount} permission(s).`;
            this.loadPermissionRoles(permissionId);
            
            // Clear cache for this role-permission pair
            const cacheKey = `${roleId}-${permissionId}`;
            this.rolePermissionCache.delete(cacheKey);
          } else {
            this.error = response.message || 'Failed to remove permission from role';
          }
          this.loadingPermissionRoles = false;
        },
        error: (error) => {
          console.error('Error removing permission from role:', error);
          this.error = 'Failed to remove permission from role. Please try again.';
          this.loadingPermissionRoles = false;
        }
      });
    }
  }

  getPermissionRoleCount(permissionId: number): number {
    // This could be enhanced to use cached data or API call
    return this.permissionRoles.length;
  }

  // Permission-to-users methods
  showPermissionUsers(permission: Permission): void {
    this.selectedPermissionForUsers = permission;
    this.showPermissionUsersModal = true;
    this.loadPermissionUsers(permission.id);
  }

  hidePermissionUsersModal(): void {
    this.showPermissionUsersModal = false;
    this.selectedPermissionForUsers = null;
    this.permissionUsers = [];
    this.loadingPermissionUsers = false;
  }

  loadPermissionUsers(permissionId: number): void {
    this.loadingPermissionUsers = true;
    this.permissionUsers = [];
    this.error = '';

    this.permissionService.getUsersWithDirectPermission(permissionId).subscribe({
      next: (response) => {
        if (response.status) {
          this.permissionUsers = response.data;
        } else {
          this.error = response.message || 'Failed to load users with direct permission';
        }
        this.loadingPermissionUsers = false;
      },
      error: (error) => {
        console.error('Error loading users with direct permission:', error);
        this.error = 'Failed to load users with direct permission. Please try again.';
        this.loadingPermissionUsers = false;
      }
    });
  }

  getPermissionUserCount(permissionId: number): number {
    return this.permissionUsers.length;
  }

  // User permissions methods
  loadUsers(): void {
    this.loadingUsers = true;
    this.userService.getUsers().subscribe({
      next: (response) => {
        if (response.status) {
          this.users = response.data;
          this.applyUserFilters();
        } else {
          console.error('Failed to load users:', response.message);
        }
        this.loadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loadingUsers = false;
      }
    });
  }

  applyUserFilters(): void {
    let filtered = [...this.users];

    // Apply search filter
    if (this.userSearchTerm.trim()) {
      const search = this.userSearchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(search) ||
        user.lastName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.username.toLowerCase().includes(search) ||
        user.uid.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (this.selectedUserStatus) {
      if (this.selectedUserStatus === 'active') {
        filtered = filtered.filter(user => user.active && !user.locked);
      } else if (this.selectedUserStatus === 'inactive') {
        filtered = filtered.filter(user => !user.active);
      } else if (this.selectedUserStatus === 'locked') {
        filtered = filtered.filter(user => user.locked);
      }
    }

    this.filteredUsers = filtered;
  }

  clearUserFilters(): void {
    this.userSearchTerm = '';
    this.selectedUserStatus = '';
    this.applyUserFilters();
  }

  toggleUserPermissions(): void {
    this.showUserPermissions = !this.showUserPermissions;
  }

  viewUserPermissions(user: User): void {
    this.selectedUser = user;
    this.showUserPermissionModal = true;
    this.loadUserPermissions(user.id);
  }

  loadUserPermissions(userId: string): void {
    this.loadingUserPermissions = true;
    this.userPermissionSummary = null;
    this.error = '';

    this.userService.getUserPermissionSummary(userId).subscribe({
      next: (response) => {
        if (response.status) {
          this.userPermissionSummary = response.data;
        } else {
          this.error = response.message || 'Failed to load user permission summary';
        }
        this.loadingUserPermissions = false;
      },
      error: (error) => {
        console.error('Error loading user permission summary:', error);
        this.error = 'Failed to load user permission summary. Please try again.';
        this.loadingUserPermissions = false;
      }
    });
  }

  hideUserPermissionModal(): void {
    this.showUserPermissionModal = false;
    this.selectedUser = null;
    this.userPermissionSummary = null;
    this.loadingUserPermissions = false;
    this.activePermissionTab = 'all';
  }

  setActivePermissionTab(tab: string): void {
    this.activePermissionTab = tab;
  }

  getActivePermissions(): Permission[] {
    if (!this.userPermissionSummary) return [];
    
    switch (this.activePermissionTab) {
      case 'role-based':
        return this.userPermissionSummary.roleBasedPermissions;
      case 'direct':
        return this.userPermissionSummary.directPermissions;
      default:
        return this.userPermissionSummary.allPermissions;
    }
  }

  // Helper methods for template logic
  isActiveTab(tab: string): boolean {
    return this.activePermissionTab === tab;
  }

  isRoleBasedTab(): boolean {
    return this.activePermissionTab === 'role-based';
  }

  isDirectTab(): boolean {
    return this.activePermissionTab === 'direct';
  }

  isAllTab(): boolean {
    return this.activePermissionTab === 'all';
  }

  canRemovePermission(): boolean {
    return this.activePermissionTab === 'direct' || this.activePermissionTab === 'all';
  }

  getRemoveButtonTitle(): string {
    return this.activePermissionTab === 'role-based' 
      ? 'Cannot remove role-based permissions here' 
      : 'Remove direct permission from user';
  }

  isDirectPermission(permissionId: number): boolean {
    return this.userPermissionSummary?.directPermissions.some(p => p.id === permissionId) || false;
  }

  isRoleBasedPermission(permissionId: number): boolean {
    return this.userPermissionSummary?.roleBasedPermissions.some(p => p.id === permissionId) || false;
  }

  getPermissionSourceLabel(permissionId: number): string {
    return this.isDirectPermission(permissionId) ? 'Direct' : 'Role';
  }

  getTabTitle(tab: string): string {
    if (!this.userPermissionSummary) return '';
    
    switch (tab) {
      case 'all':
        return `All Permissions (${this.userPermissionSummary.totalUniquePermissions})`;
      case 'role-based':
        return `Role-based (${this.userPermissionSummary.roleBasedPermissionCount})`;
      case 'direct':
        return `Direct (${this.userPermissionSummary.directPermissionCount})`;
      default:
        return '';
    }
  }

  getNoPermissionsMessage(): string {
    switch (this.activePermissionTab) {
      case 'direct':
        return 'This user has no direct permissions assigned.';
      case 'role-based':
        return 'This user has no role-based permissions.';
      default:
        return 'This user has no permissions assigned.';
    }
  }

  // Helper methods for null-safe template operations
  getUserDirectPermissions(): Permission[] {
    return this.userPermissionSummary?.directPermissions || [];
  }

  hasDirectPermissions(): boolean {
    return this.getUserDirectPermissions().length > 0;
  }

  getDirectPermissionCount(): number {
    return this.getUserDirectPermissions().length;
  }

  removePermissionFromUser(userId: string, permissionId: number): void {
    if (confirm('Are you sure you want to remove this direct permission from the user?')) {
      this.loadingUserPermissions = true;
      this.error = '';

      // Use bulk removal method for consistency
      this.userService.removePermissionsFromUser(userId, [permissionId]).subscribe({
        next: (response) => {
          if (response.status) {
            const revokedCount = response.data.revokedPermissions?.length || 0;
            const totalCount = response.data.totalDirectPermissions;
            this.success = `Successfully revoked ${revokedCount} permission(s) from user. Remaining direct permissions: ${totalCount}`;
            this.loadUserPermissions(userId);
          } else {
            this.error = response.message || 'Failed to remove permission from user';
          }
          this.loadingUserPermissions = false;
        },
        error: (error) => {
          console.error('Error removing permission from user:', error);
          this.error = 'Failed to remove permission from user. Please try again.';
          this.loadingUserPermissions = false;
        }
      });
    }
  }

  // User permission bulk removal methods
  showRemoveUserPermissionsModal(): void {
    this.showRemoveUserPermissionsForm = true;
    this.selectedPermissionsForUserRemoval = [];
    this.userRemovalReason = '';
  }

  hideRemoveUserPermissionsModal(): void {
    this.showRemoveUserPermissionsForm = false;
    this.selectedPermissionsForUserRemoval = [];
    this.userRemovalReason = '';
  }

  toggleUserPermissionRemovalSelection(permissionId: number): void {
    const index = this.selectedPermissionsForUserRemoval.indexOf(permissionId);
    if (index > -1) {
      this.selectedPermissionsForUserRemoval.splice(index, 1);
    } else {
      this.selectedPermissionsForUserRemoval.push(permissionId);
    }
  }

  isUserPermissionSelectedForRemoval(permissionId: number): boolean {
    return this.selectedPermissionsForUserRemoval.includes(permissionId);
  }

  removePermissionsFromUser(): void {
    if (this.selectedUser && this.selectedPermissionsForUserRemoval.length > 0) {
      this.loadingUserRemoval = true;
      this.error = '';

      this.userService.removePermissionsFromUser(
        this.selectedUser.id, 
        this.selectedPermissionsForUserRemoval,
        this.userRemovalReason || undefined
      ).subscribe({
        next: (response) => {
          if (response.status) {
            const revokedCount = response.data.revokedPermissions?.length || 0;
            const totalCount = response.data.totalDirectPermissions;
            
            this.success = `Successfully revoked ${revokedCount} permission(s) from user. Remaining direct permissions: ${totalCount}`;
            
            // Refresh user permission summary
            this.loadUserPermissions(this.selectedUser!.id);
            this.hideRemoveUserPermissionsModal();
          } else {
            this.error = response.message || 'Failed to revoke permissions from user';
          }
          this.loadingUserRemoval = false;
        },
        error: (error) => {
          console.error('Error revoking permissions from user:', error);
          this.error = 'Failed to revoke permissions from user. Please try again.';
          this.loadingUserRemoval = false;
        }
      });
    }
  }

  selectAllCurrentUserPermissions(): void {
    if (this.userPermissionSummary) {
      this.selectedPermissionsForUserRemoval = this.userPermissionSummary.directPermissions.map(p => p.id);
    }
  }

  deselectAllUserRemovalPermissions(): void {
    this.selectedPermissionsForUserRemoval = [];
  }

  // User permission assignment methods
  showAssignUserPermissionsModal(): void {
    this.showAssignUserPermissionsForm = true;
    this.loadAvailablePermissionsForUserAssignment();
    this.selectedPermissionsForUserAssignment = [];
    this.userAssignmentReason = '';
    this.userAssignmentExpiresAt = '';
  }

  hideAssignUserPermissionsModal(): void {
    this.showAssignUserPermissionsForm = false;
    this.availablePermissionsForUserAssignment = [];
    this.selectedPermissionsForUserAssignment = [];
    this.userAssignmentReason = '';
    this.userAssignmentExpiresAt = '';
  }

  loadAvailablePermissionsForUserAssignment(): void {
    if (!this.userPermissionSummary) return;
    
    // Get permissions that are not already directly assigned to the user
    const currentDirectPermissionIds = this.userPermissionSummary.directPermissions.map(p => p.id);
    this.availablePermissionsForUserAssignment = this.permissions.filter(
      permission => !currentDirectPermissionIds.includes(permission.id)
    );
  }

  toggleUserPermissionSelection(permissionId: number): void {
    const index = this.selectedPermissionsForUserAssignment.indexOf(permissionId);
    if (index > -1) {
      this.selectedPermissionsForUserAssignment.splice(index, 1);
    } else {
      this.selectedPermissionsForUserAssignment.push(permissionId);
    }
  }

  isUserPermissionSelected(permissionId: number): boolean {
    return this.selectedPermissionsForUserAssignment.includes(permissionId);
  }

  assignPermissionsToUser(): void {
    if (this.selectedUser && this.selectedPermissionsForUserAssignment.length > 0) {
      this.loadingUserAssignment = true;
      this.error = '';

      this.userService.assignPermissionsToUser(
        this.selectedUser.id, 
        this.selectedPermissionsForUserAssignment,
        this.userAssignmentReason || undefined,
        this.userAssignmentExpiresAt || undefined
      ).subscribe({
        next: (response) => {
          if (response.status) {
            const assignedCount = response.data.assignedPermissions.length;
            const totalCount = response.data.totalDirectPermissions;
            let successMessage = `Successfully assigned ${assignedCount} permission(s) to user. Total direct permissions: ${totalCount}`;
            
            if (response.data.expiresAt) {
              successMessage += ` (Expires: ${new Date(response.data.expiresAt).toLocaleDateString()})`;
            }
            
            this.success = successMessage;
            
            // Refresh user permission summary
            this.loadUserPermissions(this.selectedUser!.id);
            this.hideAssignUserPermissionsModal();
          } else {
            this.error = response.message || 'Failed to assign permissions to user';
          }
          this.loadingUserAssignment = false;
        },
        error: (error) => {
          console.error('Error assigning permissions to user:', error);
          this.error = 'Failed to assign permissions to user. Please try again.';
          this.loadingUserAssignment = false;
        }
      });
    }
  }

  selectAllAvailableUserPermissions(): void {
    this.selectedPermissionsForUserAssignment = this.availablePermissionsForUserAssignment.map(p => p.id);
  }

  deselectAllUserPermissions(): void {
    this.selectedPermissionsForUserAssignment = [];
  }

  // Helper method to format expiration date for API
  formatExpirationDate(dateString: string): string {
    if (!dateString) return '';
    
    // Convert local date to ISO string with time
    const date = new Date(dateString);
    date.setHours(23, 59, 59, 999); // Set to end of day
    return date.toISOString();
  }

  /**
   * Check if a specific user has a specific permission from any source (direct or role-based)
   */
  checkUserHasPermission(userId: string, permissionId: number): Observable<boolean> {
    return this.userService.userHasPermission(userId, permissionId).pipe(
      map(response => response.status && response.data)
    );
  }

  /**
   * Check if a specific user has a specific permission directly assigned (not from roles)
   */
  checkUserHasDirectPermission(userId: string, permissionId: number): Observable<boolean> {
    return this.userService.userHasDirectPermission(userId, permissionId).pipe(
      map(response => response.status && response.data)
    );
  }

  /**
   * Check if user has permission (cached version for UI)
   */
  userHasPermissionSync(userId: string, permissionId: number): boolean | null {
    const cacheKey = `user-${userId}-${permissionId}`;
    return this.rolePermissionCache.get(cacheKey) ?? null;
  }

  /**
   * Preload user permission checks for better UI performance
   */
  preloadUserPermissionChecks(userId: string, permissionIds: number[]): void {
    permissionIds.forEach(permissionId => {
      const cacheKey = `user-${userId}-${permissionId}`;
      if (!this.rolePermissionCache.has(cacheKey)) {
        this.checkUserHasPermission(userId, permissionId).subscribe(hasPermission => {
          this.rolePermissionCache.set(cacheKey, hasPermission);
        });
      }
    });
  }

  // Bulk user permission assignment methods
  showBulkUserAssignmentModal(): void {
    this.showBulkUserAssignmentForm = true;
    this.selectedUsersForBulkAssignment = [];
    this.selectedPermissionsForBulkUserAssignment = [];
    this.bulkUserAssignmentReason = '';
    this.bulkUserAssignmentExpiresAt = '';
  }

  hideBulkUserAssignmentModal(): void {
    this.showBulkUserAssignmentForm = false;
    this.selectedUsersForBulkAssignment = [];
    this.selectedPermissionsForBulkUserAssignment = [];
    this.bulkUserAssignmentReason = '';
    this.bulkUserAssignmentExpiresAt = '';
  }

  toggleUserSelectionForBulkAssignment(userId: string): void {
    const index = this.selectedUsersForBulkAssignment.indexOf(userId);
    if (index > -1) {
      this.selectedUsersForBulkAssignment.splice(index, 1);
    } else {
      this.selectedUsersForBulkAssignment.push(userId);
    }
  }

  isUserSelectedForBulkAssignment(userId: string): boolean {
    return this.selectedUsersForBulkAssignment.includes(userId);
  }

  togglePermissionSelectionForBulkUserAssignment(permissionId: number): void {
    const index = this.selectedPermissionsForBulkUserAssignment.indexOf(permissionId);
    if (index > -1) {
      this.selectedPermissionsForBulkUserAssignment.splice(index, 1);
    } else {
      this.selectedPermissionsForBulkUserAssignment.push(permissionId);
    }
  }

  isPermissionSelectedForBulkUserAssignment(permissionId: number): boolean {
    return this.selectedPermissionsForBulkUserAssignment.includes(permissionId);
  }

  bulkAssignPermissionsToUsers(): void {
    if (this.selectedUsersForBulkAssignment.length > 0 && this.selectedPermissionsForBulkUserAssignment.length > 0) {
      this.loadingBulkUserAssignment = true;
      this.error = '';

      // Convert string user IDs to numbers for API
      const userIds = this.selectedUsersForBulkAssignment.map(id => parseInt(id));

      this.userService.bulkAssignPermissionsToUsers(
        userIds,
        this.selectedPermissionsForBulkUserAssignment,
        this.bulkUserAssignmentReason || undefined,
        this.bulkUserAssignmentExpiresAt || undefined
      ).subscribe({
        next: (response) => {
          if (response.status) {
            const userCount = this.selectedUsersForBulkAssignment.length;
            const permissionCount = this.selectedPermissionsForBulkUserAssignment.length;
            const affectedUsers = Object.values(response.data);
            
            let successMessage = `Successfully assigned ${permissionCount} permission(s) to ${userCount} user(s). Total assignments processed: ${affectedUsers.length}`;
            
            if (this.bulkUserAssignmentExpiresAt) {
              successMessage += ` (Expires: ${new Date(this.bulkUserAssignmentExpiresAt).toLocaleDateString()})`;
            }
            
            this.success = successMessage;
            
            // Refresh users data if we're showing user permissions
            if (this.showUserPermissions) {
              this.loadUsers();
            }
            
            this.hideBulkUserAssignmentModal();
          } else {
            this.error = response.message || 'Failed to bulk assign permissions to users';
          }
          this.loadingBulkUserAssignment = false;
        },
        error: (error) => {
          console.error('Error bulk assigning permissions to users:', error);
          this.error = 'Failed to bulk assign permissions to users. Please try again.';
          this.loadingBulkUserAssignment = false;
        }
      });
    }
  }

  selectAllUsersForBulkAssignment(): void {
    this.selectedUsersForBulkAssignment = this.filteredUsers.map(u => u.id);
  }

  deselectAllUsersForBulkAssignment(): void {
    this.selectedUsersForBulkAssignment = [];
  }

  selectAllPermissionsForBulkUserAssignment(): void {
    this.selectedPermissionsForBulkUserAssignment = this.permissions.map(p => p.id);
  }

  deselectAllPermissionsForBulkUserAssignment(): void {
    this.selectedPermissionsForBulkUserAssignment = [];
  }

  // Permission checking methods
  showPermissionCheckForUser(user: User, permission: Permission): void {
    this.selectedUserForPermissionCheck = user;
    this.selectedPermissionForCheck = permission;
    this.showPermissionCheckModal = true;
    this.permissionCheckResult = null;
    this.directPermissionCheckResult = null;
    this.checkBothPermissionTypes(user.id, permission.id);
  }

  hidePermissionCheckModal(): void {
    this.showPermissionCheckModal = false;
    this.selectedUserForPermissionCheck = null;
    this.selectedPermissionForCheck = null;
    this.permissionCheckResult = null;
    this.directPermissionCheckResult = null;
    this.loadingPermissionCheck = false;
    this.loadingDirectPermissionCheck = false;
  }

  checkSpecificUserPermission(userId: string, permissionId: number): void {
    this.loadingPermissionCheck = true;
    this.error = '';

    this.checkUserHasPermission(userId, permissionId).subscribe({
      next: (hasPermission) => {
        this.permissionCheckResult = hasPermission;
        this.loadingPermissionCheck = false;
      },
      error: (error) => {
        console.error('Error checking user permission:', error);
        this.error = 'Failed to check user permission. Please try again.';
        this.loadingPermissionCheck = false;
      }
    });
  }

  checkSpecificUserDirectPermission(userId: string, permissionId: number): void {
    this.loadingDirectPermissionCheck = true;
    this.error = '';

    this.checkUserHasDirectPermission(userId, permissionId).subscribe({
      next: (hasDirectPermission) => {
        this.directPermissionCheckResult = hasDirectPermission;
        this.loadingDirectPermissionCheck = false;
      },
      error: (error) => {
        console.error('Error checking user direct permission:', error);
        this.error = 'Failed to check user direct permission. Please try again.';
        this.loadingDirectPermissionCheck = false;
      }
    });
  }

  checkBothPermissionTypes(userId: string, permissionId: number): void {
    // Check both permission types simultaneously
    this.checkSpecificUserPermission(userId, permissionId);
    this.checkSpecificUserDirectPermission(userId, permissionId);
  }

  getPermissionCheckResultText(): string {
    if (this.permissionCheckResult === null) return 'Checking...';
    return this.permissionCheckResult ? 'User has this permission (any source)' : 'User does not have this permission';
  }

  getPermissionCheckResultClass(): string {
    if (this.permissionCheckResult === null) return 'text-warning';
    return this.permissionCheckResult ? 'text-success' : 'text-danger';
  }

  getDirectPermissionCheckResultText(): string {
    if (this.directPermissionCheckResult === null) return 'Checking...';
    return this.directPermissionCheckResult ? 'User has this permission directly' : 'User does not have this permission directly';
  }

  getDirectPermissionCheckResultClass(): string {
    if (this.directPermissionCheckResult === null) return 'text-warning';
    return this.directPermissionCheckResult ? 'text-success' : 'text-danger';
  }

  getPermissionSourceAnalysis(): string {
    if (this.permissionCheckResult === null || this.directPermissionCheckResult === null) {
      return 'Analyzing permission sources...';
    }

    if (this.permissionCheckResult && this.directPermissionCheckResult) {
      return 'User has this permission through direct assignment.';
    } else if (this.permissionCheckResult && !this.directPermissionCheckResult) {
      return 'User has this permission through role-based assignment only.';
    } else if (!this.permissionCheckResult && !this.directPermissionCheckResult) {
      return 'User does not have this permission from any source.';
    } else {
      // This shouldn't happen (direct=true but any=false), but handle it
      return 'Inconsistent permission state detected.';
    }
  }

  // Enhanced user permission loading with preloading
  loadUserPermissionsWithPreload(userId: string): void {
    // Load the user permission summary
    this.loadUserPermissions(userId);
    
    // Preload permission checks for all permissions to improve UI responsiveness
    if (this.permissions.length > 0) {
      this.preloadUserPermissionChecks(userId, this.permissions.map(p => p.id));
    }
  }

  // Helper to get permission check status for UI
  getUserPermissionStatus(userId: string, permissionId: number): 'has' | 'not-has' | 'checking' {
    const cached = this.userHasPermissionSync(userId, permissionId);
    if (cached === null) return 'checking';
    return cached ? 'has' : 'not-has';
  }

  // Helper to get permission status icon
  getPermissionStatusIcon(userId: string, permissionId: number): string {
    const status = this.getUserPermissionStatus(userId, permissionId);
    switch (status) {
      case 'has': return '✓';
      case 'not-has': return '✗';
      default: return '?';
    }
  }

  // Helper to get permission status class
  getPermissionStatusClass(userId: string, permissionId: number): string {
    const status = this.getUserPermissionStatus(userId, permissionId);
    switch (status) {
      case 'has': return 'text-success';
      case 'not-has': return 'text-danger';
      default: return 'text-warning';
    }
  }
}
