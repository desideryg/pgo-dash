import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ConfigService } from '../../services/config.service';
import { User, ApiResponse } from '../../models/user.model';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Pagination
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;
  
  // Search and filters
  searchTerm = '';
  statusFilter = 'all'; // all, active, inactive
  
  constructor(
    private userService: UserService,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.userService.getUsers().subscribe({
      next: (response: ApiResponse<User[]>) => {
        this.isLoading = false;
        if (response.status) {
          this.users = response.data;
          this.totalElements = response.totalElements || response.data.length;
          this.totalPages = response.totalPages || 1;
        } else {
          this.errorMessage = response.message || 'Failed to load users';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error);
        console.error('Error loading users:', error);
      }
    });
  }

  onSearch(): void {
    // For now, we'll filter client-side
    // In a real app, you'd send search params to the API
    this.currentPage = 0;
    this.loadUsers();
  }

  onStatusFilterChange(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  getFilteredUsers(): User[] {
    let filtered = this.users;
    
    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.displayName.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (this.statusFilter === 'active') {
      filtered = filtered.filter(user => user.active);
    } else if (this.statusFilter === 'inactive') {
      filtered = filtered.filter(user => !user.active);
    }
    
    return filtered;
  }

  toggleUserStatus(user: User): void {
    const action = user.active ? 'deactivate' : 'activate';
    const actionText = user.active ? 'deactivate' : 'activate';
    
    if (confirm(`Are you sure you want to ${actionText} user "${user.username}"?`)) {
      const statusAction = user.active ? 
        this.userService.deactivateUser(user.uid) : 
        this.userService.activateUser(user.uid);
      
      statusAction.subscribe({
        next: (response) => {
          if (response.status) {
            user.active = !user.active;
            this.successMessage = `User ${user.username} has been ${actionText}d successfully!`;
            setTimeout(() => this.successMessage = '', 3000);
          } else {
            this.errorMessage = response.message || `Failed to ${actionText} user`;
          }
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error);
          console.error(`Error ${actionText}ing user:`, error);
        }
      });
    }
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: (response) => {
          if (response.status) {
            this.users = this.users.filter(u => u.id !== user.id);
            this.successMessage = `User ${user.username} has been deleted successfully!`;
            setTimeout(() => this.successMessage = '', 3000);
          } else {
            this.errorMessage = response.message || 'Failed to delete user';
          }
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error);
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  toggleUserLock(user: User): void {
    const action = user.locked ? 'unlock' : 'lock';
    const actionText = user.locked ? 'unlock' : 'lock';
    
    if (confirm(`Are you sure you want to ${actionText} user "${user.username}"?`)) {
      const lockAction = user.locked ? 
        this.userService.unlockUser(user.uid) : 
        this.userService.lockUser(user.uid);
      
      lockAction.subscribe({
        next: (response) => {
          if (response.status) {
            user.locked = !user.locked;
            this.successMessage = `User ${user.username} has been ${actionText}ed successfully!`;
            setTimeout(() => this.successMessage = '', 3000);
          } else {
            this.errorMessage = response.message || `Failed to ${actionText} user`;
          }
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error);
          console.error(`Error ${actionText}ing user:`, error);
        }
      });
    }
  }

  getRoleBadgeClass(role: string): string {
    return this.configService.getRoleClass(role);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private getErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    
    if (error.status === 0) {
      return 'Unable to connect to the server. Please check your connection and try again.';
    }
    
    if (error.status === 401) {
      return 'You are not authorized to perform this action.';
    }
    
    if (error.status === 403) {
      return 'Access denied. You do not have permission to perform this action.';
    }
    
    if (error.status === 500) {
      return 'Server error occurred. Please try again later.';
    }
    
    return 'An unexpected error occurred. Please try again.';
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  goToFirstPage(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  goToLastPage(): void {
    this.currentPage = this.totalPages - 1;
    this.loadUsers();
  }
}
