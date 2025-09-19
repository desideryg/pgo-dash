import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { MerchantService } from '../../services/merchant.service';
import { PaymentGatewayService } from '../../services/payment-gateway.service';
import { Transaction, TransactionFilters, TransactionStatus, TransactionResponse } from '../../models/transaction.model';
import { Merchant } from '../../models/merchant.model';
import { PaymentGateway } from '../../models/payment-gateway.model';

@Component({
  selector: 'app-transaction-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-management.component.html',
  styleUrls: ['./transaction-management.component.css']
})
export class TransactionManagementComponent implements OnInit {
  transactions: Transaction[] = [];
  merchants: Merchant[] = [];
  paymentGateways: PaymentGateway[] = [];
  loading = false;
  error: string | null = null;
  
  // Expose Math to template
  Math = Math;
  
  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;
  
  // Filters
  filters: TransactionFilters = {
    page: 1,
    size: 20
  };
  
  // Filter form
  filterForm = {
    status: '',
    merchantId: '',
    pgoId: '',
    startDate: '',
    endDate: '',
    search: ''
  };
  
  // Status options
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: TransactionStatus.SUCCESS, label: 'Success' },
    { value: TransactionStatus.PENDING, label: 'Pending' },
    { value: TransactionStatus.FAILED, label: 'Failed' },
    { value: TransactionStatus.CANCELLED, label: 'Cancelled' }
  ];

  constructor(
    private transactionService: TransactionService,
    private merchantService: MerchantService,
    private paymentGatewayService: PaymentGatewayService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMerchants();
    this.loadPaymentGateways();
    this.loadTransactions();
  }

  loadMerchants(): void {
    this.merchantService.getMerchants().subscribe({
      next: (response) => {
        this.merchants = response.data || [];
      },
      error: (error) => {
        console.error('Error loading merchants:', error);
      }
    });
  }

  loadPaymentGateways(): void {
    this.paymentGatewayService.getPaymentGateways().subscribe({
      next: (response) => {
        this.paymentGateways = response.data || [];
      },
      error: (error) => {
        console.error('Error loading payment gateways:', error);
      }
    });
  }

  loadTransactions(): void {
    this.loading = true;
    this.error = null;
    
    this.transactionService.getTransactions(this.filters).subscribe({
      next: (response: TransactionResponse) => {
        this.transactions = response.data;
        this.currentPage = response.pageNumber;
        this.pageSize = response.pageSize;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load transactions';
        this.loading = false;
        console.error('Error loading transactions:', error);
      }
    });
  }

  applyFilters(): void {
    this.filters = {
      page: 1,
      size: this.pageSize,
      status: this.filterForm.status ? this.filterForm.status as TransactionStatus : undefined,
      merchantId: this.filterForm.merchantId || undefined,
      pgoId: this.filterForm.pgoId || undefined,
      startDate: this.filterForm.startDate || undefined,
      endDate: this.filterForm.endDate || undefined,
      search: this.filterForm.search || undefined
    };
    this.currentPage = 1;
    this.loadTransactions();
  }

  clearFilters(): void {
    this.filterForm = {
      status: '',
      merchantId: '',
      pgoId: '',
      startDate: '',
      endDate: '',
      search: ''
    };
    this.filters = {
      page: 1,
      size: this.pageSize
    };
    this.currentPage = 1;
    this.loadTransactions();
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.currentPage = page;
    this.loadTransactions();
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

  exportTransactions(): void {
    this.transactionService.exportTransactions(this.filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.error = 'Failed to export transactions';
        console.error('Error exporting transactions:', error);
      }
    });
  }

  formatAmount(amount: string, currency: string): string {
    return `${currency} ${parseFloat(amount).toLocaleString()}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case TransactionStatus.SUCCESS:
        return 'status-success';
      case TransactionStatus.PENDING:
        return 'status-pending';
      case TransactionStatus.FAILED:
        return 'status-failed';
      case TransactionStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  }

  viewTransactionDetails(transaction: Transaction): void {
    // For now, we'll just log the transaction details
    // In a real application, you might want to open a modal or navigate to a details page
    console.log('Transaction Details:', transaction);
    
    // You could also implement a modal or detailed view here
    alert(`Transaction Details:\n\nID: ${transaction.internalTransactionId}\nAmount: ${this.formatAmount(transaction.amount, transaction.currency)}\nStatus: ${transaction.status}\nCustomer: ${transaction.customerName}\nMerchant: ${transaction.merchantName}\nPayment Gateway: ${transaction.pgoName}\nCreated: ${this.formatDate(transaction.createdAt)}`);
  }

  viewDisbursements(transaction: Transaction): void {
    // Navigate to disbursements page with the transaction UID as a query parameter
    this.router.navigate(['/disbursements'], { 
      queryParams: { transactionUid: transaction.uid } 
    });
  }
}
