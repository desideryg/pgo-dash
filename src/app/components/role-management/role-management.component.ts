import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { ConfigService } from '../../services/config.service';
import { Role, CreateRoleRequest } from '../../models/role.model';
import { ConfigOption } from '../../models/config.model';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.css']
})
export class RoleManagementComponent implements OnInit {
  roles: Role[] = [];
  filteredRoles: Role[] = [];
  loading = false;
  error = '';
  success = '';
  searchTerm = '';
  showCreateForm = false;

  // Configuration data
  predefinedRoles: ConfigOption[] = [];
  availableRoles: ConfigOption[] = [];

  createRoleForm: FormGroup;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private roleService: RoleService,
    private configService: ConfigService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.createRoleForm = this.fb.group({
      name: ['', [Validators.required]],
      displayName: [{value: '', disabled: true}],
      description: [{value: '', disabled: true}]
    });
  }

  ngOnInit(): void {
    this.loadConfiguration();
    this.loadRoles();
  }

  loadConfiguration(): void {
    this.configService.loadConfig().subscribe({
      next: (config) => {
        if (config) {
          this.predefinedRoles = this.configService.getUserRoles();
          this.updateAvailableRoles();
        }
      },
      error: (error) => {
        console.error('Error loading configuration:', error);
        this.error = 'Failed to load role configuration';
      }
    });
  }

  updateAvailableRoles(): void {
    // Filter out roles that are already created
    const existingRoleNames = this.roles.map(role => role.name);
    this.availableRoles = this.predefinedRoles.filter(role => 
      !existingRoleNames.includes(role.value)
    );
  }

  loadRoles(): void {
    this.loading = true;
    this.error = '';

    this.roleService.getRoles().subscribe({
      next: (response) => {
        if (response.status) {
          this.roles = response.data;
          this.filteredRoles = [...this.roles];
          this.totalItems = this.roles.length;
          this.updateAvailableRoles();
          this.applyFilter();
        } else {
          this.error = response.message || 'Failed to load roles';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.error = 'Failed to load roles. Please try again.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRoles = [...this.roles];
    } else {
      const search = this.searchTerm.toLowerCase();
      this.filteredRoles = this.roles.filter(role =>
        role.name.toLowerCase().includes(search) ||
        role.displayName.toLowerCase().includes(search) ||
        role.description.toLowerCase().includes(search)
      );
    }
    this.totalItems = this.filteredRoles.length;
    this.currentPage = 1;
  }

  get paginatedRoles(): Role[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredRoles.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  showCreateRoleForm(): void {
    if (this.availableRoles.length === 0) {
      this.error = 'All predefined roles have already been created.';
      return;
    }
    
    this.showCreateForm = true;
    this.createRoleForm.reset();
    this.error = '';
    this.success = '';
  }

  hideCreateForm(): void {
    this.showCreateForm = false;
    this.createRoleForm.reset();
  }


  createRole(): void {
    if (this.createRoleForm.valid) {
      this.loading = true;
      this.error = '';

      const selectedRole = this.predefinedRoles.find(role => role.value === this.createRoleForm.value.name);
      if (!selectedRole) {
        this.error = 'Invalid role selection';
        this.loading = false;
        return;
      }

      const roleData: CreateRoleRequest = {
        name: selectedRole.value,
        displayName: selectedRole.displayName,
        description: selectedRole.description
      };

      this.roleService.createRole(roleData).subscribe({
        next: (response) => {
          if (response.status) {
            this.success = 'Role created successfully!';
            this.hideCreateForm();
            this.loadRoles();
          } else {
            this.error = response.message || 'Failed to create role';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating role:', error);
          this.error = error.error?.message || 'Failed to create role. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.createRoleForm);
    }
  }


  getRoleClass(roleName: string): string {
    return this.configService.getRoleClass(roleName);
  }

  onRoleSelectionChange(): void {
    const selectedRoleName = this.createRoleForm.get('name')?.value;
    if (selectedRoleName) {
      const selectedRole = this.predefinedRoles.find(role => role.value === selectedRoleName);
      if (selectedRole) {
        // Auto-populate display name and description (read-only fields)
        this.createRoleForm.patchValue({ 
          displayName: selectedRole.displayName,
          description: selectedRole.description
        });
      }
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  clearMessages(): void {
    this.error = '';
    this.success = '';
  }

  trackByRoleId(index: number, role: Role): number {
    return role.id;
  }
}
