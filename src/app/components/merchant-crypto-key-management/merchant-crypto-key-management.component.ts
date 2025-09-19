import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { MerchantService } from '../../services/merchant.service';
import { CryptoKey, CryptoKeyApiResponse, CreateCryptoKeyResponse, CreateCryptoKeyRequest, CRYPTO_KEY_STATUS, CRYPTO_KEY_TYPES, CRYPTO_KEY_ALGORITHMS, CurrentCryptoKey, PreviousCryptoKey, CryptoKeyStatistics } from '../../models/crypto-key.model';
import { Merchant } from '../../models/merchant.model';
import { ConfigService } from '../../services/config.service';
import { ConfigOption } from '../../models/config.model';

@Component({
  selector: 'app-merchant-crypto-key-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './merchant-crypto-key-management.component.html',
  styleUrls: ['./merchant-crypto-key-management.component.css']
})
export class MerchantCryptoKeyManagementComponent implements OnInit {
  merchant: Merchant | null = null;
  cryptoKeys: CryptoKey[] = [];
  filteredCryptoKeys: CryptoKey[] = [];
  currentCryptoKey: CurrentCryptoKey | null = null;
  previousCryptoKey: PreviousCryptoKey | null = null;
  keyStatistics: CryptoKeyStatistics | null = null;
  hasActiveKeys = false;
  isLoading = false;
  isLoadingCurrent = false;
  isLoadingPrevious = false;
  isLoadingStats = false;
  isCreatingKey = false;
  isValidatingKey = false;
  keyValidationResult: boolean | null = null;
  errorMessage = '';
  successMessage = '';
  
  // Form-specific messages
  formErrorMessage = '';
  formSuccessMessage = '';
  
  // Extend expiry modal
  showExtendExpiryModal = false;
  isClosingModal = false;
  selectedKeyForExtension: CryptoKey | null = null;
  newExpiryDate = '';
  isExtendingExpiry = false;
  
  // Search and filter
  searchTerm = '';
  statusFilter = 'all';
  keyTypeFilter = 'all';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  actualTotalKeys = 0; // Track actual total keys regardless of filters
  
  // Merchant UID from route
  merchantUid = '';

  // Math reference for template
  Math = Math;

  // Crypto key creation form
  showCreateForm = false;
  createKeyForm: CreateCryptoKeyRequest = {
    keyAlgorithm: 'EC',
    keySize: 256,
    notes: '',
    activateImmediately: true
  };
  keyType: 'PUBLIC_KEY' | 'PRIVATE_KEY' = 'PUBLIC_KEY';

  // Constants for template
  CRYPTO_KEY_TYPES = CRYPTO_KEY_TYPES;
  CRYPTO_KEY_ALGORITHMS = CRYPTO_KEY_ALGORITHMS;
  
  // Config-based options
  cryptoKeyTypes: ConfigOption[] = [];
  cryptoKeyStatuses: ConfigOption[] = [];

  // Key size options for different algorithms
  keySizeOptions: { [key: string]: number[] } = {
    'RSA': [2048, 3072, 4096],
    'EC': [256, 384, 521],
    'EdDSA': [256]
  };

  constructor(
    private merchantService: MerchantService,
    private route: ActivatedRoute,
    private router: Router,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    // Load configuration first
    this.loadConfiguration();
    
    this.route.params.subscribe(params => {
      this.merchantUid = params['merchantUid'];
      if (this.merchantUid) {
        this.loadMerchantDetails();
        this.checkActiveKeys();
        this.loadKeyStatistics();
        this.loadActualTotal();
        this.loadCurrentCryptoKey();
        this.loadPreviousCryptoKey();
        this.loadCryptoKeys();
      }
    });
  }

  loadConfiguration(): void {
    this.configService.loadConfig().subscribe(config => {
      if (config) {
        this.cryptoKeyTypes = this.configService.getCryptoKeyTypes();
        this.cryptoKeyStatuses = this.configService.getCryptoKeyStatuses();
      }
    });
  }

  loadMerchantDetails(): void {
    this.merchantService.getMerchantByUid(this.merchantUid).subscribe({
      next: (response) => {
        if (response.status) {
          this.merchant = response.data;
        } else {
          this.errorMessage = response.message || 'Failed to load merchant details';
        }
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error);
        console.error('Error loading merchant details:', error);
      }
    });
  }

  loadCurrentCryptoKey(): void {
    this.isLoadingCurrent = true;
    
    this.merchantService.getCurrentCryptoKey(this.merchantUid).subscribe({
      next: (response) => {
        this.isLoadingCurrent = false;
        if (response.status && response.data) {
          this.currentCryptoKey = response.data;
        } else {
          this.currentCryptoKey = null;
        }
      },
      error: (error) => {
        this.isLoadingCurrent = false;
        this.currentCryptoKey = null;
        // Don't show error for current key - it might not exist
        console.log('No current crypto key found:', error);
      }
    });
  }

  loadPreviousCryptoKey(): void {
    this.isLoadingPrevious = true;
    
    this.merchantService.getPreviousCryptoKey(this.merchantUid).subscribe({
      next: (response) => {
        this.isLoadingPrevious = false;
        if (response.status && response.data) {
          this.previousCryptoKey = response.data;
        } else {
          this.previousCryptoKey = null;
        }
      },
      error: (error) => {
        this.isLoadingPrevious = false;
        this.previousCryptoKey = null;
        // Don't show error for previous key - it might not exist
        console.log('No previous crypto key found:', error);
      }
    });
  }

  checkActiveKeys(): void {
    this.merchantService.hasActiveCryptoKeys(this.merchantUid).subscribe({
      next: (response) => {
        if (response.status) {
          this.hasActiveKeys = response.data;
        } else {
          this.hasActiveKeys = false;
        }
      },
      error: (error) => {
        this.hasActiveKeys = false;
        console.log('Failed to check active keys:', error);
      }
    });
  }

  loadActualTotal(): void {
    // Load actual total count from statistics or a separate call
    this.merchantService.getCryptoKeyStatistics(this.merchantUid).subscribe({
      next: (response) => {
        if (response.status && response.data) {
          this.actualTotalKeys = response.data.totalKeys;
        }
      },
      error: (error) => {
        console.log('Failed to load actual total:', error);
      }
    });
  }

  loadKeyStatistics(): void {
    this.isLoadingStats = true;
    
    this.merchantService.getCryptoKeyStatistics(this.merchantUid).subscribe({
      next: (response) => {
        this.isLoadingStats = false;
        if (response.status && response.data) {
          this.keyStatistics = response.data;
          this.actualTotalKeys = response.data.totalKeys; // Update actual total
        } else {
          this.keyStatistics = null;
        }
      },
      error: (error) => {
        this.isLoadingStats = false;
        this.keyStatistics = null;
        console.log('Failed to load key statistics:', error);
      }
    });
  }

  loadCryptoKeys(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Use status-based filtering if a specific status is selected
    let apiCall: Observable<CryptoKeyApiResponse<CryptoKey[]>>;
    
    if (this.statusFilter !== 'all') {
      apiCall = this.merchantService.getCryptoKeysByStatus(
        this.merchantUid, 
        this.statusFilter, 
        this.currentPage - 1, 
        this.pageSize
      );
    } else {
      apiCall = this.merchantService.getCryptoKeysPaginated(
        this.merchantUid, 
        this.currentPage - 1, 
        this.pageSize
      );
    }
    
    apiCall.subscribe({
      next: (response: CryptoKeyApiResponse<CryptoKey[]>) => {
        this.isLoading = false;
        if (response.status) {
          // Filter out null values from the response data
          this.cryptoKeys = (response.data || []).filter(key => key !== null);
          this.totalElements = response.totalElements || this.cryptoKeys.length;
          this.totalPages = response.totalPages || 1;
          this.applyFilters();
        } else {
          this.errorMessage = response.message || 'Failed to load crypto keys';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error);
        console.error('Error loading crypto keys:', error);
      }
    });
  }

  showCreateKeyForm(): void {
    this.showCreateForm = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.formErrorMessage = '';
    this.formSuccessMessage = '';
    this.resetCreateForm();
    
    // Scroll to the creation form with smooth animation
    setTimeout(() => {
      const formElement = document.getElementById('crypto-key-creation-form');
      if (formElement) {
        formElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100); // Small delay to ensure form is rendered
  }

  hideCreateForm(): void {
    this.showCreateForm = false;
    this.resetCreateForm();
  }

  resetCreateForm(): void {
    this.createKeyForm = {
      keyAlgorithm: 'EC',
      keySize: 256,
      notes: '',
      activateImmediately: true
    };
    this.keyType = 'PUBLIC_KEY';
    this.keyValidationResult = null;
    this.formErrorMessage = '';
    this.formSuccessMessage = '';
  }

  onAlgorithmChange(): void {
    const sizes = this.keySizeOptions[this.createKeyForm.keyAlgorithm || 'EC'];
    this.createKeyForm.keySize = sizes[0];
  }

  getAvailableKeySizes(): number[] {
    return this.keySizeOptions[this.createKeyForm.keyAlgorithm || 'EC'] || [256];
  }

  createCryptoKey(): void {
    if (!this.merchantUid) {
      this.formErrorMessage = 'Merchant UID is required';
      return;
    }

    // Validate form
    if (!this.createKeyForm.keyAlgorithm || !this.createKeyForm.keySize) {
      this.formErrorMessage = 'Please fill in all required fields';
      return;
    }

    // Set expiration date (2 years from now as default)
    if (!this.createKeyForm.expiresAt || this.createKeyForm.expiresAt.trim() === '') {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 2);
      this.createKeyForm.expiresAt = expiryDate.toISOString();
    } else {
      try {
        // Convert datetime-local format to ISO string if needed
        if (this.createKeyForm.expiresAt && !this.createKeyForm.expiresAt.includes('T')) {
          this.createKeyForm.expiresAt = new Date(this.createKeyForm.expiresAt).toISOString();
        } else if (this.createKeyForm.expiresAt && !this.createKeyForm.expiresAt.endsWith('Z')) {
          // Ensure ISO format with Z suffix
          const date = new Date(this.createKeyForm.expiresAt);
          this.createKeyForm.expiresAt = date.toISOString();
        }
      } catch (dateError) {
        console.warn('Invalid date format, using default:', dateError);
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 2);
        this.createKeyForm.expiresAt = expiryDate.toISOString();
      }
    }

    // Set default notes if empty
    if (!this.createKeyForm.notes || this.createKeyForm.notes.trim() === '') {
      this.createKeyForm.notes = 'Created via admin dashboard';
    }

    // Clean up the request data - remove empty/undefined fields
    const requestData: CreateCryptoKeyRequest = {
      keyAlgorithm: this.createKeyForm.keyAlgorithm,
      keySize: this.createKeyForm.keySize, // Use actual key size now
      expiresAt: this.createKeyForm.expiresAt,
      notes: this.createKeyForm.notes,
      activateImmediately: this.createKeyForm.activateImmediately
    };

    // Add key name - required field, generate if not provided
    if (this.createKeyForm.keyName && this.createKeyForm.keyName.trim() !== '') {
      requestData.keyName = this.createKeyForm.keyName.trim();
    } else {
      // Generate a unique key name if not provided
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      requestData.keyName = `key-${timestamp}-${randomStr}`;
    }

    // Add key data based on key type
    if (this.keyType === 'PUBLIC_KEY' && this.createKeyForm.publicKey && this.createKeyForm.publicKey.trim() !== '') {
      requestData.publicKey = this.createKeyForm.publicKey.trim();
    } else if (this.keyType === 'PRIVATE_KEY' && this.createKeyForm.privateKey && this.createKeyForm.privateKey.trim() !== '') {
      requestData.privateKey = this.createKeyForm.privateKey.trim();
    }

    this.isCreatingKey = true;
    this.formErrorMessage = '';
    this.formSuccessMessage = '';

    // Log the request data for debugging (remove in production)
    console.log('Creating crypto key with data:', requestData);
    
    this.merchantService.createCryptoKey(this.merchantUid, requestData).subscribe({
      next: (response: CreateCryptoKeyResponse) => {
        this.isCreatingKey = false;
        if (response.status) {
          this.cryptoKeys.unshift(response.data);
          this.actualTotalKeys++; // Increment actual total
          this.applyFilters();
          this.formSuccessMessage = response.message || 'Crypto key created successfully!';
          // Refresh statistics and active keys status
          this.loadKeyStatistics();
          this.checkActiveKeys();
          setTimeout(() => {
            this.hideCreateForm();
            this.successMessage = 'Crypto key created successfully!';
            setTimeout(() => this.successMessage = '', 3000);
          }, 2000);
        } else {
          this.formErrorMessage = response.message || 'Failed to create crypto key';
        }
      },
      error: (error) => {
        this.isCreatingKey = false;
        console.error('Error creating crypto key:', error);
        
        // Handle specific validation errors
        if (error.status === 400 && error.error?.message) {
          this.formErrorMessage = `Validation Error: ${error.error.message}`;
        } else if (error.status === 400) {
          this.formErrorMessage = 'Validation failed. Please check your input data and try again.';
        } else {
          this.formErrorMessage = this.getErrorMessage(error);
        }
        
        // Log detailed error information for debugging
        console.error('Full error details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          requestData: requestData
        });
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.cryptoKeys];
    
    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(key =>
        key.keyName.toLowerCase().includes(term) ||
        key.keyAlgorithm.toLowerCase().includes(term) ||
        key.keyFingerprint.toLowerCase().includes(term) ||
        key.keyType.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(key => key.keyStatus === this.statusFilter);
    }
    
    // Apply key type filter
    if (this.keyTypeFilter !== 'all') {
      filtered = filtered.filter(key => key.keyType === this.keyTypeFilter);
    }
    
    this.filteredCryptoKeys = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.currentPage = 1; // Reset to first page when filter changes
    this.loadCryptoKeys(); // Reload data with new filter
  }

  onKeyTypeFilterChange(): void {
    this.applyFilters();
  }

  toggleKeyStatus(cryptoKey: CryptoKey): void {
    const action = cryptoKey.isActive ? 'deactivate' : 'activate';
    const actionText = cryptoKey.isActive ? 'deactivate' : 'activate';
    
    if (confirm(`Are you sure you want to ${actionText} crypto key "${cryptoKey.keyName}"?`)) {
      const statusAction = cryptoKey.isActive ? 
        this.merchantService.deactivateCryptoKey(this.merchantUid, cryptoKey.uid) : 
        this.merchantService.activateCryptoKey(this.merchantUid, cryptoKey.uid);
      
      statusAction.subscribe({
        next: (response) => {
          if (response.status && response.data) {
            // Update the crypto key with the response data
            Object.assign(cryptoKey, response.data);
            // Refresh current and previous keys if status changed
            if (cryptoKey.keyStatus === 'CURRENT') {
              this.loadCurrentCryptoKey();
            } else if (cryptoKey.keyStatus === 'PREVIOUS') {
              this.loadPreviousCryptoKey();
            }
            // Refresh active keys status and statistics
            this.checkActiveKeys();
            this.loadKeyStatistics();
            this.successMessage = response.message || `Crypto key ${cryptoKey.keyName} has been ${actionText}d successfully!`;
            setTimeout(() => this.successMessage = '', 3000);
          } else {
            this.errorMessage = response.message || `Failed to ${actionText} crypto key`;
          }
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error);
          console.error(`Error ${actionText}ing crypto key:`, error);
        }
      });
    }
  }

  revokeCryptoKey(cryptoKey: CryptoKey): void {
    const reason = prompt(
      `Are you sure you want to revoke crypto key "${cryptoKey.keyName}"?\n\nThis action cannot be undone. Please provide a reason:`,
      'Key revoked by administrator'
    );
    
    if (reason && reason.trim() !== '') {
      this.merchantService.revokeCryptoKey(this.merchantUid, cryptoKey.uid, reason.trim()).subscribe({
        next: (response) => {
          if (response.status) {
            cryptoKey.keyStatus = 'REVOKED';
            cryptoKey.isActive = false;
            this.successMessage = response.message || `Crypto key ${cryptoKey.keyName} has been revoked successfully!`;
            setTimeout(() => this.successMessage = '', 3000);
          } else {
            this.errorMessage = response.message || 'Failed to revoke crypto key';
          }
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error);
          console.error('Error revoking crypto key:', error);
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE': 
      case 'CURRENT': return 'badge-active';
      case 'PREVIOUS': return 'badge-previous';
      case 'INACTIVE': return 'badge-inactive';
      case 'PENDING': return 'badge-pending';
      case 'EXPIRED': return 'badge-expired';
      case 'REVOKED': return 'badge-revoked';
      default: return 'badge-default';
    }
  }

  getStatusDisplayName(status: string): string {
    const statusConfig = this.configService.getCryptoKeyStatusByValue(status);
    return statusConfig?.displayName || status;
  }

  getKeyTypeDisplayName(keyType: string): string {
    const typeConfig = this.configService.getCryptoKeyTypeByValue(keyType);
    return typeConfig?.displayName || keyType;
  }

  getKeyTypeBadgeClass(keyType: string): string {
    switch (keyType) {
      case 'PUBLIC_KEY': return 'badge-public';
      case 'PRIVATE_KEY': return 'badge-private';
      default: return 'badge-default';
    }
  }

  getAlgorithmBadgeClass(algorithm: string): string {
    switch (algorithm) {
      case 'RSA': return 'badge-rsa';
      case 'EC': return 'badge-ec';
      case 'EdDSA': return 'badge-eddsa';
      default: return 'badge-default';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isKeyExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  }

  getDaysUntilExpiry(expiresAt: string): number {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  clearFormMessages(): void {
    this.formErrorMessage = '';
    this.formSuccessMessage = '';
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.keyTypeFilter = 'all';
    this.applyFilters();
  }

  goBack(): void {
    this.router.navigate(['/merchants']);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.successMessage = 'Public key copied to clipboard!';
      setTimeout(() => this.successMessage = '', 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      this.errorMessage = 'Failed to copy to clipboard';
      setTimeout(() => this.errorMessage = '', 3000);
    });
  }

  showFullFingerprint(cryptoKey: CryptoKey): void {
    this.merchantService.getCryptoKeyFingerprint(this.merchantUid, cryptoKey.uid).subscribe({
      next: (response) => {
        if (response.status && response.data) {
          const fullFingerprint = response.data;
          // Show full fingerprint in a modal-like alert
          alert(`Full Fingerprint for ${cryptoKey.keyName}:\n\n${fullFingerprint}\n\nClick OK to copy to clipboard.`);
          // Copy to clipboard
          navigator.clipboard.writeText(fullFingerprint).then(() => {
            this.successMessage = 'Fingerprint copied to clipboard!';
            setTimeout(() => this.successMessage = '', 2000);
          });
        } else {
          this.errorMessage = response.message || 'Failed to get fingerprint';
        }
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error);
        console.error('Error getting fingerprint:', error);
      }
    });
  }

  extendKeyExpiry(cryptoKey: CryptoKey): void {
    this.selectedKeyForExtension = cryptoKey;
    
    // Calculate default new expiry (1 year from current expiry)
    const currentExpiry = new Date(cryptoKey.expiresAt);
    const defaultNewExpiry = new Date(currentExpiry);
    defaultNewExpiry.setFullYear(defaultNewExpiry.getFullYear() + 1);
    
    // Format for datetime-local input (YYYY-MM-DDTHH:mm)
    this.newExpiryDate = defaultNewExpiry.toISOString().slice(0, 16);
    
    this.showExtendExpiryModal = true;
  }

  closeExtendExpiryModal(): void {
    this.isClosingModal = true;
    
    // Wait for animation to complete before hiding modal
    setTimeout(() => {
      this.showExtendExpiryModal = false;
      this.isClosingModal = false;
      this.selectedKeyForExtension = null;
      this.newExpiryDate = '';
      this.isExtendingExpiry = false;
    }, 300); // Match animation duration
  }

  confirmExtendExpiry(): void {
    if (!this.selectedKeyForExtension || !this.newExpiryDate) {
      return;
    }

    try {
      // Convert to ISO string format required by API
      const newExpiryDate = new Date(this.newExpiryDate);
      const newExpiryISO = newExpiryDate.toISOString();
      
      // Validate that new expiry is in the future
      if (newExpiryDate <= new Date()) {
        this.errorMessage = 'New expiry date must be in the future';
        return;
      }
      
      // Validate that new expiry is after current expiry
      if (newExpiryDate <= new Date(this.selectedKeyForExtension.expiresAt)) {
        this.errorMessage = 'New expiry date must be after the current expiry date';
        return;
      }
      
      this.isExtendingExpiry = true;
      
      this.merchantService.extendCryptoKeyExpiry(this.merchantUid, this.selectedKeyForExtension.uid, newExpiryISO).subscribe({
        next: (response) => {
          this.isExtendingExpiry = false;
          if (response.status && response.data) {
            // Update the crypto key with the response data
            Object.assign(this.selectedKeyForExtension!, response.data);
            this.successMessage = response.message || `Crypto key expiry extended successfully!`;
            this.closeExtendExpiryModal();
            setTimeout(() => this.successMessage = '', 3000);
            // Refresh statistics
            this.loadKeyStatistics();
          } else {
            this.errorMessage = response.message || 'Failed to extend crypto key expiry';
          }
        },
        error: (error) => {
          this.isExtendingExpiry = false;
          this.errorMessage = this.getErrorMessage(error);
          console.error('Error extending crypto key expiry:', error);
        }
      });
    } catch (dateError) {
      this.errorMessage = 'Invalid date format. Please use a valid date and time.';
    }
  }

  getStatusEntries(): { status: string, count: number }[] {
    if (!this.keyStatistics?.keysByStatus) return [];
    return Object.entries(this.keyStatistics.keysByStatus).map(([status, count]) => ({
      status,
      count
    }));
  }

  getAlgorithmEntries(): { algorithm: string, count: number }[] {
    if (!this.keyStatistics?.keysByAlgorithm) return [];
    return Object.entries(this.keyStatistics.keysByAlgorithm).map(([algorithm, count]) => ({
      algorithm,
      count
    }));
  }

  formatKeyAge(ageInDays: number): string {
    if (ageInDays === 0) return 'Today';
    if (ageInDays === 1) return '1 day';
    if (ageInDays < 30) return `${ageInDays} days`;
    if (ageInDays < 365) return `${Math.floor(ageInDays / 30)} months`;
    return `${Math.floor(ageInDays / 365)} years`;
  }

  validatePublicKey(): void {
    const publicKey = this.keyType === 'PUBLIC_KEY' ? this.createKeyForm.publicKey : this.createKeyForm.privateKey;
    
    if (!publicKey || publicKey.trim() === '') {
      this.formErrorMessage = 'Please enter a public key to validate';
      return;
    }

    this.isValidatingKey = true;
    this.keyValidationResult = null;
    this.formErrorMessage = '';
    this.formSuccessMessage = '';

    this.merchantService.validatePublicKey(this.merchantUid, publicKey.trim()).subscribe({
      next: (response) => {
        this.isValidatingKey = false;
        if (response.status) {
          this.keyValidationResult = response.data;
          if (response.data) {
            this.formSuccessMessage = 'Public key format is valid!';
            setTimeout(() => this.formSuccessMessage = '', 3000);
          } else {
            this.formErrorMessage = 'Public key format is invalid. Please check the PEM format.';
          }
        } else {
          this.formErrorMessage = response.message || 'Failed to validate public key';
        }
      },
      error: (error) => {
        this.isValidatingKey = false;
        this.keyValidationResult = false;
        this.formErrorMessage = this.getErrorMessage(error);
        console.error('Error validating public key:', error);
      }
    });
  }

  getRequestPreview(): any {
    // Create a preview of what will be sent to the API
    const preview: any = {
      keyAlgorithm: this.createKeyForm.keyAlgorithm,
      keySize: this.createKeyForm.keySize,
      activateImmediately: this.createKeyForm.activateImmediately
    };

    // Add key name - required field, generate if not provided
    if (this.createKeyForm.keyName && this.createKeyForm.keyName.trim() !== '') {
      preview.keyName = this.createKeyForm.keyName.trim();
    } else {
      preview.keyName = '[Auto-generated: key-TIMESTAMP-RANDOM]';
    }

    if (this.createKeyForm.notes && this.createKeyForm.notes.trim() !== '') {
      preview.notes = this.createKeyForm.notes.trim();
    } else {
      preview.notes = 'Created via admin dashboard';
    }

    if (this.createKeyForm.expiresAt && this.createKeyForm.expiresAt.trim() !== '') {
      preview.expiresAt = this.createKeyForm.expiresAt;
    } else {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 2);
      preview.expiresAt = expiryDate.toISOString();
    }

    // Add key data based on key type
    if (this.keyType === 'PUBLIC_KEY' && this.createKeyForm.publicKey && this.createKeyForm.publicKey.trim() !== '') {
      preview.publicKey = this.createKeyForm.publicKey.trim().substring(0, 50) + '...';
    } else if (this.keyType === 'PRIVATE_KEY' && this.createKeyForm.privateKey && this.createKeyForm.privateKey.trim() !== '') {
      preview.privateKey = this.createKeyForm.privateKey.trim().substring(0, 50) + '...';
    }

    return preview;
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
      return 'Resource not found';
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
