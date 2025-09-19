import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PermissionService } from '../../services/permission.service';
import { RoleService } from '../../services/role.service';
import { 
  Permission, 
  CreatePermissionRequest,
  AvailablePermission
} from '../../models/permission.model';
import { Role } from '../../models/role.model';
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
        scopeIdControl?.setValidators([Validators.required]);
      }
      scopeIdControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.loadConfiguration();
    this.loadPermissions();
    this.loadAvailablePermissions();
    this.loadRoles();
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

      // Include custom name if provided
      if (formValue.name && formValue.name.trim()) {
        permissionData.name = formValue.name.trim();
      }

      // Only include scopeId if it's not global scope
      if (formValue.scopeType !== 'GLOBAL' && formValue.scopeId) {
        permissionData.scopeId = formValue.scopeId;
      }

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
          this.error = error.error?.message || 'Failed to create permission. Please try again.';
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

  removePermissionFromRole(roleId: number, permissionId: number): void {
    if (confirm('Are you sure you want to remove this permission from the role?')) {
      this.loadingRolePermissions = true;
      this.error = '';

      this.roleService.removePermissionFromRole(roleId, permissionId).subscribe({
        next: (response) => {
          if (response.status) {
            this.success = 'Permission removed from role successfully!';
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

  getPermissionsByRole(roleId: number): Permission[] {
    return this.permissions.filter(permission => 
      permission.assignedRoles && permission.assignedRoles.some(role => role === roleId.toString())
    );
  }

  showAssignPermissionsModal(): void {
    this.showAssignPermissionsForm = true;
    this.loadAvailablePermissionsForAssignment();
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
}
