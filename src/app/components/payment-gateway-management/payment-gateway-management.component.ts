import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PaymentGatewayService } from '../../services/payment-gateway.service';
import { PaymentGateway, PaymentGatewayApiResponse } from '../../models/payment-gateway.model';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-payment-gateway-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './payment-gateway-management.component.html',
  styleUrls: ['./payment-gateway-management.component.css']
})
export class PaymentGatewayManagementComponent implements OnInit {
  paymentGateways: PaymentGateway[] = [];
  filteredPaymentGateways: PaymentGateway[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Search and filter properties
  searchTerm = '';
  statusFilter = '';
  methodFilter = '';

  // Pagination properties
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private paymentGatewayService: PaymentGatewayService,
    private configService: ConfigService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPaymentGateways();
  }

  loadPaymentGateways(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.paymentGatewayService.getPaymentGateways().subscribe({
      next: (response: PaymentGatewayApiResponse<PaymentGateway[]>) => {
        this.isLoading = false;
        if (response.status && response.data) {
          this.paymentGateways = response.data;
          this.filteredPaymentGateways = [...this.paymentGateways];
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.currentPage = response.pageNumber;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error);
        console.error('Error loading payment gateways:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredPaymentGateways = this.paymentGateways.filter(pg => {
      const matchesSearch = !this.searchTerm || 
        pg.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        pg.code.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || pg.activeStatus === this.statusFilter;
      
      const matchesMethod = !this.methodFilter || 
        pg.supportedMethods.some(method => method.includes(this.methodFilter));
      
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.methodFilter = '';
    this.filteredPaymentGateways = [...this.paymentGateways];
  }

  toggleStatus(paymentGateway: PaymentGateway): void {
    const action = paymentGateway.activeStatus === 'Active' ? 'deactivate' : 'activate';
    const serviceMethod = action === 'activate' 
      ? this.paymentGatewayService.activatePaymentGateway(paymentGateway.uid)
      : this.paymentGatewayService.deactivatePaymentGateway(paymentGateway.uid);

    serviceMethod.subscribe({
      next: (response) => {
        if (response.status && response.data) {
          paymentGateway.activeStatus = response.data.activeStatus;
          this.successMessage = `Payment gateway ${action}d successfully`;
          setTimeout(() => this.clearMessages(), 3000);
        }
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error);
        console.error(`Error ${action}ing payment gateway:`, error);
      }
    });
  }

  deletePaymentGateway(paymentGateway: PaymentGateway): void {
    if (confirm(`Are you sure you want to delete payment gateway "${paymentGateway.name}"?`)) {
      this.paymentGatewayService.deletePaymentGateway(paymentGateway.uid).subscribe({
        next: (response) => {
          if (response.status) {
            this.paymentGateways = this.paymentGateways.filter(pg => pg.uid !== paymentGateway.uid);
            this.applyFilters();
            this.successMessage = 'Payment gateway deleted successfully';
            setTimeout(() => this.clearMessages(), 3000);
          }
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error);
          console.error('Error deleting payment gateway:', error);
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'status-active';
      case 'Inactive':
        return 'status-inactive';
      case 'Maintenance':
        return 'status-maintenance';
      case 'Suspended':
        return 'status-suspended';
      default:
        return 'status-unknown';
    }
  }

  getMethodBadgeClass(method: string): string {
    switch (method) {
      case 'MNO':
        return 'method-mno';
      case 'CARD':
        return 'method-card';
      case 'BANK':
        return 'method-bank';
      case 'WALLET':
        return 'method-wallet';
      default:
        return 'method-unknown';
    }
  }

  formatSupportedMethods(methods: string[]): string {
    return methods.map(method => method.replace(/[\[\]"]/g, '')).join(', ');
  }

  cleanMethod(method: string): string {
    return method.replace(/[\[\]"]/g, '');
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
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

  private getErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }
}
