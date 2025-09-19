import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MerchantService } from '../../services/merchant.service';
import { Merchant, MerchantApiResponse } from '../../models/merchant.model';

@Component({
  selector: 'app-merchant-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './merchant-management.component.html',
  styleUrls: ['./merchant-management.component.css']
})
export class MerchantManagementComponent implements OnInit {
  merchants: Merchant[] = [];
  filteredMerchants: Merchant[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Search and filter
  searchTerm = '';
  statusFilter = 'all';
  verificationFilter = 'all';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private merchantService: MerchantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMerchants();
  }

  loadMerchants(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.merchantService.getMerchants().subscribe({
      next: (response: MerchantApiResponse<Merchant[]>) => {
        this.isLoading = false;
        if (response.status) {
          this.merchants = response.data;
          this.totalElements = response.totalElements || response.data.length;
          this.totalPages = response.totalPages || 1;
          this.applyFilters();
        } else {
          this.errorMessage = response.message || 'Failed to load merchants';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error);
        console.error('Error loading merchants:', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.merchants];
    
    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(merchant =>
        merchant.name.toLowerCase().includes(term) ||
        merchant.contactEmail.toLowerCase().includes(term) ||
        merchant.merchantType?.toLowerCase().includes(term) ||
        merchant.businessCity?.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(merchant => merchant.status === this.statusFilter);
    }
    
    this.filteredMerchants = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  toggleMerchantStatus(merchant: Merchant): void {
    const action = merchant.status === 'ACTIVE' ? 'deactivate' : 'activate';
    const actionText = merchant.status === 'ACTIVE' ? 'deactivate' : 'activate';
    
    if (confirm(`Are you sure you want to ${actionText} merchant "${merchant.name}"?`)) {
      const statusAction = merchant.status === 'ACTIVE' ? 
        this.merchantService.deactivateMerchant(merchant.uid) : 
        this.merchantService.activateMerchant(merchant.uid);
      
      statusAction.subscribe({
        next: (response) => {
          if (response.status) {
            merchant.status = merchant.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            this.successMessage = `Merchant ${merchant.name} has been ${actionText}d successfully!`;
            setTimeout(() => this.successMessage = '', 3000);
          } else {
            this.errorMessage = response.message || `Failed to ${actionText} merchant`;
          }
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error);
          console.error(`Error ${actionText}ing merchant:`, error);
        }
      });
    }
  }

  suspendMerchant(merchant: Merchant): void {
    if (confirm(`Are you sure you want to suspend merchant "${merchant.name}"?`)) {
      this.merchantService.suspendMerchant(merchant.uid).subscribe({
        next: (response) => {
          if (response.status) {
            merchant.status = 'SUSPENDED';
            this.successMessage = `Merchant ${merchant.name} has been suspended successfully!`;
            setTimeout(() => this.successMessage = '', 3000);
          } else {
            this.errorMessage = response.message || 'Failed to suspend merchant';
          }
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error);
          console.error('Error suspending merchant:', error);
        }
      });
    }
  }

  verifyMerchant(merchant: Merchant): void {
    if (confirm(`Are you sure you want to verify merchant "${merchant.name}"?`)) {
      this.merchantService.verifyMerchant(merchant.uid).subscribe({
        next: (response) => {
          if (response.status) {
            merchant.kycVerified = true;
            this.successMessage = `Merchant ${merchant.name} has been verified successfully!`;
            setTimeout(() => this.successMessage = '', 3000);
          } else {
            this.errorMessage = response.message || 'Failed to verify merchant';
          }
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error);
          console.error('Error verifying merchant:', error);
        }
      });
    }
  }

  deleteMerchant(merchant: Merchant): void {
    if (confirm(`Are you sure you want to delete merchant "${merchant.name}"? This action cannot be undone.`)) {
      this.merchantService.deleteMerchant(merchant.id).subscribe({
        next: (response) => {
          if (response.status) {
            this.merchants = this.merchants.filter(m => m.id !== merchant.id);
            this.applyFilters();
            this.successMessage = `Merchant ${merchant.name} has been deleted successfully!`;
            setTimeout(() => this.successMessage = '', 3000);
          } else {
            this.errorMessage = response.message || 'Failed to delete merchant';
          }
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error);
          console.error('Error deleting merchant:', error);
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'badge-active';
      case 'INACTIVE': return 'badge-inactive';
      case 'SUSPENDED': return 'badge-suspended';
      default: return 'badge-default';
    }
  }

  getBusinessTypeBadgeClass(businessType: string): string {
    switch (businessType) {
      case 'RETAIL': return 'badge-retail';
      case 'WHOLESALE': return 'badge-wholesale';
      case 'SERVICE': return 'badge-service';
      case 'MANUFACTURING': return 'badge-manufacturing';
      case 'TECHNOLOGY': return 'badge-technology';
      case 'HEALTHCARE': return 'badge-healthcare';
      case 'EDUCATION': return 'badge-education';
      default: return 'badge-default';
    }
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

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  manageApiKeys(merchant: Merchant): void {
    this.router.navigate(['/merchants', merchant.uid, 'api-keys']);
  }

  manageCryptoKeys(merchant: Merchant): void {
    this.router.navigate(['/merchants', merchant.uid, 'crypto-keys']);
  }

  onVerificationFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.verificationFilter = 'all';
    this.applyFilters();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  private getErrorMessage(error: any): string {
    if (error.status === 404) {
      return 'Merchant not found';
    } else if (error.status === 403) {
      return 'You do not have permission to perform this action';
    } else if (error.status === 500) {
      return 'Server error. Please try again later';
    } else if (error.error?.message) {
      return error.error.message;
    } else {
      return 'An unexpected error occurred';
    }
  }
}
