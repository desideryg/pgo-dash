import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaymentChannelService } from '../../services/payment-channel.service';
import { PaymentChannel, PaymentChannelApiResponse } from '../../models/payment-channel.model';

@Component({
  selector: 'app-payment-channel-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './payment-channel-management.component.html',
  styleUrls: ['./payment-channel-management.component.css']
})
export class PaymentChannelManagementComponent implements OnInit {
  paymentChannels: PaymentChannel[] = [];
  filteredPaymentChannels: PaymentChannel[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;

  // Filters
  searchTerm = '';
  selectedType = '';
  selectedStatus = '';

  // Filter options
  paymentChannelTypes: string[] = [];
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  constructor(private paymentChannelService: PaymentChannelService) {}

  ngOnInit(): void {
    this.loadPaymentChannels();
    this.paymentChannelTypes = this.paymentChannelService.getPaymentChannelTypes();
  }

  loadPaymentChannels(): void {
    this.loading = true;
    this.error = null;

    this.paymentChannelService.getPaymentChannels(
      this.currentPage,
      this.pageSize,
      this.searchTerm || undefined,
      this.selectedType || undefined,
      this.selectedStatus || undefined
    ).subscribe({
      next: (response: PaymentChannelApiResponse) => {
        this.loading = false;
        if (response.status && response.data) {
          this.paymentChannels = response.data;
          this.filteredPaymentChannels = [...this.paymentChannels];
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
        } else {
          this.error = 'Failed to load payment channels';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Error loading payment channels: ' + (error.error?.message || error.message);
        console.error('Error loading payment channels:', error);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadPaymentChannels();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadPaymentChannels();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.currentPage = 0;
    this.loadPaymentChannels();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPaymentChannels();
  }

  toggleStatus(paymentChannel: PaymentChannel): void {
    const newStatus = !paymentChannel.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    
    this.paymentChannelService.togglePaymentChannelStatus(paymentChannel.uid, newStatus)
      .subscribe({
        next: (response) => {
          if (response.status) {
            this.success = `Payment channel ${action}d successfully`;
            this.loadPaymentChannels();
            setTimeout(() => this.clearMessages(), 3000);
          } else {
            this.error = `Failed to ${action} payment channel`;
            setTimeout(() => this.clearMessages(), 3000);
          }
        },
        error: (error) => {
          this.error = `Error ${action}ing payment channel: ` + (error.error?.message || error.message);
          setTimeout(() => this.clearMessages(), 3000);
        }
      });
  }

  deletePaymentChannel(paymentChannel: PaymentChannel): void {
    if (confirm(`Are you sure you want to delete payment channel "${paymentChannel.name}"?`)) {
      this.paymentChannelService.deletePaymentChannel(paymentChannel.uid)
        .subscribe({
          next: (response) => {
            if (response.status) {
              this.success = 'Payment channel deleted successfully';
              this.loadPaymentChannels();
              setTimeout(() => this.clearMessages(), 3000);
            } else {
              this.error = 'Failed to delete payment channel';
              setTimeout(() => this.clearMessages(), 3000);
            }
          },
          error: (error) => {
            this.error = 'Error deleting payment channel: ' + (error.error?.message || error.message);
            setTimeout(() => this.clearMessages(), 3000);
          }
        });
    }
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getTypeDisplayName(type: string): string {
    return this.paymentChannelService.getPaymentChannelTypeDisplayName(type);
  }

  getTypeIcon(type: string): string {
    return this.paymentChannelService.getPaymentChannelTypeIcon(type);
  }

  getTypeClass(type: string): string {
    return this.paymentChannelService.getPaymentChannelTypeClass(type);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(this.totalPages, 5);
    
    for (let i = 0; i < maxPages; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  hasNextPage(): boolean {
    return this.currentPage < this.totalPages - 1;
  }

  hasPreviousPage(): boolean {
    return this.currentPage > 0;
  }
}
