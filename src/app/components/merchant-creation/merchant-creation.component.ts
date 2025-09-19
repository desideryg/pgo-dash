import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MerchantService } from '../../services/merchant.service';
import { CreateMerchantRequest, MERCHANT_TYPES, MERCHANT_ROLES } from '../../models/merchant.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-merchant-creation',
  templateUrl: './merchant-creation.component.html',
  styleUrls: ['./merchant-creation.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class MerchantCreationComponent implements OnInit {
  merchantForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Available options for dropdowns
  merchantTypes = Object.values(MERCHANT_TYPES);
  merchantRoles = Object.values(MERCHANT_ROLES);

  constructor(
    private fb: FormBuilder,
    private merchantService: MerchantService,
    private router: Router
  ) {
    this.merchantForm = this.createForm();
  }

  ngOnInit(): void {
    // Initialize form
  }

  private createForm(): FormGroup {
    return this.fb.group({
      merchantName: ['', [Validators.required, Validators.minLength(2)]],
      merchantCode: ['', [Validators.required, Validators.minLength(3)]],
      businessName: ['', [Validators.required, Validators.minLength(2)]],
      businessRegistrationNumber: ['', [Validators.required]],
      businessAddress: ['', [Validators.required, Validators.minLength(5)]],
      businessCity: ['', [Validators.required, Validators.minLength(2)]],
      businessState: ['', [Validators.required, Validators.minLength(2)]],
      businessPostalCode: ['', [Validators.required]],
      businessCountry: ['', [Validators.required, Validators.minLength(2)]],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      websiteUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      merchantType: ['', [Validators.required]],
      merchantRole: ['', [Validators.required]],
      parentMerchantId: ['']
    });
  }

  onSubmit(): void {
    if (this.merchantForm.valid) {
      this.isLoading = true;
      this.clearMessages(); // Clear any previous messages

      const merchantData: CreateMerchantRequest = {
        merchantName: this.merchantForm.value.merchantName,
        merchantCode: this.merchantForm.value.merchantCode,
        businessName: this.merchantForm.value.businessName,
        businessRegistrationNumber: this.merchantForm.value.businessRegistrationNumber,
        businessAddress: this.merchantForm.value.businessAddress,
        businessCity: this.merchantForm.value.businessCity,
        businessState: this.merchantForm.value.businessState,
        businessPostalCode: this.merchantForm.value.businessPostalCode,
        businessCountry: this.merchantForm.value.businessCountry,
        contactEmail: this.merchantForm.value.contactEmail,
        contactPhone: this.merchantForm.value.contactPhone,
        websiteUrl: this.merchantForm.value.websiteUrl || undefined,
        merchantType: this.merchantForm.value.merchantType,
        merchantRole: this.merchantForm.value.merchantRole,
        parentMerchantId: this.merchantForm.value.parentMerchantId || undefined
      };

      this.merchantService.createMerchant(merchantData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status) {
            this.successMessage = `Merchant "${merchantData.merchantName}" has been created successfully!`;
            this.merchantForm.reset();
            this.errorMessage = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
              this.router.navigate(['/merchants']);
            }, 3000);
          } else {
            this.errorMessage = response.message || 'Failed to create merchant. Please try again.';
            this.successMessage = '';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = this.getErrorMessage(error);
          this.successMessage = '';
          console.error('Merchant creation error:', error);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  goBack(): void {
    this.router.navigate(['/merchants']);
  }

  onFormFieldChange(): void {
    // Clear error messages when user starts typing
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.merchantForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.merchantForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'contactPhone') {
          return 'Please enter a valid phone number';
        }
        if (fieldName === 'websiteUrl') {
          return 'Please enter a valid URL (starting with http:// or https://)';
        }
        return 'Invalid format';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      merchantName: 'Merchant Name',
      merchantCode: 'Merchant Code',
      businessName: 'Business Name',
      businessRegistrationNumber: 'Business Registration Number',
      businessAddress: 'Business Address',
      businessCity: 'City',
      businessState: 'State',
      businessPostalCode: 'Postal Code',
      businessCountry: 'Country',
      contactEmail: 'Contact Email',
      contactPhone: 'Contact Phone',
      merchantType: 'Merchant Type',
      merchantRole: 'Merchant Role'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.merchantForm.controls).forEach(key => {
      const control = this.merchantForm.get(key);
      control?.markAsTouched();
    });
  }

  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Unable to connect to the server. Please check your connection.';
    } else if (error.status === 400) {
      return error.error?.message || 'Invalid merchant data. Please check your input.';
    } else if (error.status === 409) {
      return 'A merchant with this code or email already exists.';
    } else if (error.status === 500) {
      return 'Server error. Please try again later.';
    } else if (error.error?.message) {
      return error.error.message;
    } else {
      return 'An unexpected error occurred. Please try again.';
    }
  }
}
