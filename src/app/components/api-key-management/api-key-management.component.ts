import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MerchantService } from '../../services/merchant.service';
import { ApiKey, CreateApiKeyResponse } from '../../models/api-key.model';
import { Merchant } from '../../models/merchant.model';

@Component({
  selector: 'app-api-key-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './api-key-management.component.html',
  styleUrls: ['./api-key-management.component.css']
})
export class ApiKeyManagementComponent implements OnInit {
  merchantUid: string = '';
  merchantName: string = '';
  merchant: Merchant | null = null;

  apiKeys: ApiKey[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showCreateForm = false;
  showApiKeyDetails = false;
  newApiKey: ApiKey | null = null;

  constructor(
    private merchantService: MerchantService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.merchantUid = params['uid'];
      console.log('Route params:', params);
      console.log('Merchant UID:', this.merchantUid);
      if (this.merchantUid) {
        this.loadMerchantDetails();
        this.loadApiKeys();
      }
    });
  }

  loadMerchantDetails(): void {
    this.merchantService.getMerchantByUid(this.merchantUid).subscribe({
      next: (response) => {
        if (response.status && response.data) {
          this.merchant = response.data;
          this.merchantName = this.merchant.name;
          console.log('Merchant loaded:', this.merchant);
        }
      },
      error: (error) => {
        console.error('Error loading merchant details:', error);
        this.errorMessage = 'Failed to load merchant details';
      }
    });
  }

  loadApiKeys(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.merchantService.getApiKeys(this.merchantUid).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status) {
          this.apiKeys = response.data || [];
        } else {
          this.errorMessage = response.message || 'Failed to load API keys';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error);
        console.error('Error loading API keys:', error);
      }
    });
  }

  createApiKey(): void {
    if (!this.merchantUid) {
      this.errorMessage = 'Merchant UID is required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.merchantService.createApiKey(this.merchantUid).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status) {
          this.newApiKey = response.data;
          this.showApiKeyDetails = true;
          this.showCreateForm = false;
          this.successMessage = 'API key created successfully!';
          // Reload the list to show the new key
          this.loadApiKeys();
        } else {
          this.errorMessage = response.message || 'Failed to create API key';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error);
        console.error('Error creating API key:', error);
      }
    });
  }

  revokeApiKey(apiKey: string): void {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.merchantService.revokeApiKey(this.merchantUid, apiKey).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status) {
          this.successMessage = 'API key revoked successfully!';
          this.loadApiKeys(); // Reload the list
          setTimeout(() => this.successMessage = '', 3000);
        } else {
          this.errorMessage = response.message || 'Failed to revoke API key';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error);
        console.error('Error revoking API key:', error);
      }
    });
  }

  regenerateApiKey(apiKey: string): void {
    if (!confirm('Are you sure you want to regenerate this API key? The old key will be invalidated.')) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.merchantService.regenerateApiKey(this.merchantUid, apiKey).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status) {
          this.newApiKey = response.data;
          this.showApiKeyDetails = true;
          this.successMessage = 'API key regenerated successfully!';
          this.loadApiKeys(); // Reload the list
        } else {
          this.errorMessage = response.message || 'Failed to regenerate API key';
        }
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 404) {
          this.errorMessage = 'Regenerate API key endpoint is not available yet. Please create a new API key instead.';
        } else {
          this.errorMessage = this.getErrorMessage(error);
        }
        console.error('Error regenerating API key:', error);
      }
    });
  }

  copyToClipboard(text: string | null): void {
    if (!text) {
      this.errorMessage = 'No text to copy';
      return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
      this.successMessage = 'Copied to clipboard!';
      setTimeout(() => this.successMessage = '', 2000);
    }).catch(err => {
      this.errorMessage = 'Failed to copy to clipboard';
      console.error('Copy error:', err);
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  }

  getDaysUntilExpiry(expiresAt: string): number {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeApiKeyDetails(): void {
    this.showApiKeyDetails = false;
    this.newApiKey = null;
  }

  goBackToMerchants(): void {
    this.router.navigate(['/merchants']);
  }

  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Unable to connect to the server. Please check your connection.';
    } else if (error.status === 400) {
      return error.error?.message || 'Invalid request. Please check your input.';
    } else if (error.status === 404) {
      return 'Merchant or API key not found.';
    } else if (error.status === 409) {
      return 'API key already exists or conflict occurred.';
    } else if (error.status === 500) {
      return 'Server error. Please try again later.';
    } else if (error.error?.message) {
      return error.error.message;
    } else {
      return 'An unexpected error occurred. Please try again.';
    }
  }
}
