import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DisbursementService } from '../../services/disbursement.service';
import { TransactionService } from '../../services/transaction.service';
import { Disbursement, DisbursementResponse, DisbursementFilters, DisbursementStatus } from '../../models/disbursement.model';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-disbursement-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './disbursement-management.component.html',
  styleUrls: ['./disbursement-management.component.css']
})
export class DisbursementManagementComponent implements OnInit {
  disbursements: Disbursement[] = [];
  transactions: Transaction[] = [];
  loading = false;
  error: string | null = null;
  
  // Pagination
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;
  
  // Filters
  filters: DisbursementFilters = {};
  filterForm = {
    transactionUid: '',
    status: '' as DisbursementStatus | '',
    merchantId: '',
    pgoId: '',
    startDate: '',
    endDate: '',
    search: ''
  };

  // Status options for dropdown
  statusOptions = Object.values(DisbursementStatus);
  
  // Expose enums to template
  DisbursementStatus = DisbursementStatus;
  
  // Expose Math object to template
  Math = Math;

  constructor(
    private disbursementService: DisbursementService,
    private transactionService: TransactionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
    
    // Check for URL query parameters
    this.route.queryParams.subscribe(params => {
      if (params['transactionUid']) {
        this.filterForm.transactionUid = params['transactionUid'];
        this.applyFilters();
      } else if (params['status']) {
        this.filterForm.status = params['status'] as DisbursementStatus;
        this.applyFilters();
      } else {
        this.loadDisbursements();
      }
    });
  }

  loadTransactions(): void {
    this.transactionService.getTransactions({ size: 1000 }).subscribe({
      next: (response) => {
        this.transactions = response.data || [];
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
      }
    });
  }

  loadDisbursements(): void {
    this.loading = true;
    this.error = null;
    
    if (this.filters.transactionUid) {
      // Load disbursements for specific transaction
      this.disbursementService.getDisbursementsByTransaction(this.filters.transactionUid).subscribe({
        next: (response) => {
          this.disbursements = response.data || [];
          this.currentPage = response.pageNumber || 0;
          this.pageSize = response.pageSize || 20;
          this.totalElements = response.totalElements || 0;
          this.totalPages = response.totalPages || 0;
          this.loading = false;
          
          // If no disbursements found, try alternative approach
          if (this.disbursements.length === 0) {
            this.loadDisbursementsByTransactionSearch();
          }
        },
        error: (error) => {
          this.loadDisbursementsByTransactionSearch();
        }
      });
    } else {
      // Load all disbursements
      this.disbursementService.getDisbursements(this.filters).subscribe({
        next: (response) => {
          this.disbursements = response.data || [];
          this.currentPage = response.pageNumber || 0;
          this.pageSize = response.pageSize || 20;
          this.totalElements = response.totalElements || 0;
          this.totalPages = response.totalPages || 0;
          this.loading = false;
        },
        error: (error) => {
          this.error = `Failed to load disbursements: ${error.message || error.statusText || 'Unknown error'}`;
          this.loading = false;
        }
      });
    }
  }

  /**
   * Alternative method to find disbursements by searching through all disbursements
   * and filtering by sourceTransactionId
   */
  private loadDisbursementsByTransactionSearch(): void {
    if (!this.filters.transactionUid) {
      this.loading = false;
      return;
    }

    // Search through all disbursements to find ones matching the transaction UID
    this.disbursementService.getDisbursements({ size: 1000 }).subscribe({
      next: (response) => {
        const allDisbursements = response.data || [];
        
        // Filter disbursements where sourceTransactionId matches the transaction UID
        this.disbursements = allDisbursements.filter(disbursement => 
          disbursement.sourceTransactionId === this.filters.transactionUid
        );
        
        this.currentPage = 0;
        this.pageSize = 20;
        this.totalElements = this.disbursements.length;
        this.totalPages = Math.ceil(this.disbursements.length / this.pageSize);
        this.loading = false;
      },
      error: (error) => {
        this.error = `Failed to load disbursements: ${error.message || error.statusText || 'Unknown error'}`;
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filters = {
      transactionUid: this.filterForm.transactionUid || undefined,
      status: this.filterForm.status || undefined,
      merchantId: this.filterForm.merchantId || undefined,
      pgoId: this.filterForm.pgoId || undefined,
      startDate: this.filterForm.startDate || undefined,
      endDate: this.filterForm.endDate || undefined,
      search: this.filterForm.search || undefined,
      page: 1,
      size: this.pageSize
    };
    
    this.loadDisbursements();
  }

  clearFilters(): void {
    this.filterForm = {
      transactionUid: '',
      status: '',
      merchantId: '',
      pgoId: '',
      startDate: '',
      endDate: '',
      search: ''
    };
    this.filters = {};
    this.loadDisbursements();
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.loadDisbursements();
  }

  getStatusClass(status: DisbursementStatus): string {
    switch (status) {
      case DisbursementStatus.PENDING:
        return 'status-pending';
      case DisbursementStatus.PROCESSING:
        return 'status-processing';
      case DisbursementStatus.COMPLETED:
        return 'status-completed';
      case DisbursementStatus.FAILED:
        return 'status-failed';
      case DisbursementStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  }

  formatCurrency(amount: string, currency: string): string {
    return `${currency} ${parseFloat(amount).toLocaleString()}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getTransactionById(transactionUid: string): Transaction | undefined {
    return this.transactions.find(t => t.uid === transactionUid);
  }

  retryDisbursement(disbursement: Disbursement): void {
    if (disbursement.status !== DisbursementStatus.FAILED) {
      alert('Only failed disbursements can be retried');
      return;
    }

    if (confirm(`Are you sure you want to retry disbursement ${disbursement.uid}?`)) {
      this.loading = true;
      this.error = null;

      this.disbursementService.retryDisbursement(disbursement.uid).subscribe({
        next: (response) => {
          console.log('Retry response:', response);
          if (response.status) {
            alert('Disbursement retry initiated successfully');
            // Reload disbursements to show updated status
            this.loadDisbursements();
          } else {
            alert(`Failed to retry disbursement: ${response.message}`);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error retrying disbursement:', error);
          alert(`Error retrying disbursement: ${error.error?.message || error.message || 'Unknown error'}`);
          this.loading = false;
        }
      });
    }
  }

}
