import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentGatewayService } from '../../services/payment-gateway.service';
import { CreatePaymentGatewayRequest, CreatePaymentGatewayResponse } from '../../models/payment-gateway.model';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-payment-gateway-creation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-gateway-creation.component.html',
  styleUrls: ['./payment-gateway-creation.component.css']
})
export class PaymentGatewayCreationComponent implements OnInit {
  paymentGatewayForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showSuccessModal = false;
  createdPaymentGateway: any = null;

  // Available payment methods from config
  availablePaymentMethods: any[] = [];

  constructor(
    private fb: FormBuilder,
    private paymentGatewayService: PaymentGatewayService,
    private configService: ConfigService,
    private router: Router
  ) {
    this.paymentGatewayForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadConfiguration();
  }

  createForm(): FormGroup {
    return this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      productionApiBaseUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      sandboxApiBaseUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      activeStatus: ['Active', [Validators.required]],
      supportedMethods: [[], [Validators.required, Validators.minLength(1)]]
    });
  }

  loadConfiguration(): void {
    this.configService.getConfigData$().subscribe({
      next: (config) => {
        if (config?.paymentChannelTypes) {
          this.availablePaymentMethods = config.paymentChannelTypes;
        }
      },
      error: (error) => {
        console.error('Error loading configuration:', error);
        // Fallback payment methods if config fails to load
        this.availablePaymentMethods = [
          { value: 'MNO', displayName: 'Mobile Money', description: 'Mobile Money Operator' },
          { value: 'CARD', displayName: 'Card', description: 'Credit/Debit Card' },
          { value: 'BANK', displayName: 'Bank Transfer', description: 'Bank' },
          { value: 'WALLET', displayName: 'Digital Wallet', description: 'Wallet' }
        ];
      }
    });
  }

  onSubmit(): void {
    if (this.paymentGatewayForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const formData = this.paymentGatewayForm.value;
      
      // Format supported methods to match API expectations
      const supportedMethods = formData.supportedMethods.map((method: any) => `"${method}"`);
      
      const requestData: CreatePaymentGatewayRequest = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        productionApiBaseUrl: formData.productionApiBaseUrl || null,
        sandboxApiBaseUrl: formData.sandboxApiBaseUrl || null,
        activeStatus: formData.activeStatus,
        supportedMethods: supportedMethods
      };

      this.paymentGatewayService.createPaymentGateway(requestData).subscribe({
        next: (response: CreatePaymentGatewayResponse) => {
          this.isLoading = false;
          if (response.status && response.data) {
            this.createdPaymentGateway = response.data;
            this.successMessage = response.message;
            this.showSuccessModal = true;
            this.paymentGatewayForm.reset();
            this.paymentGatewayForm.patchValue({
              activeStatus: 'Active',
              supportedMethods: []
            });
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = this.getApiErrorMessage(error);
          console.error('Error creating payment gateway:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onFormFieldChange(): void {
    this.clearMessages();
  }

  onMethodChange(event: any, methodValue: string): void {
    const supportedMethods = this.paymentGatewayForm.get('supportedMethods')?.value || [];
    
    if (event.target.checked) {
      if (!supportedMethods.includes(methodValue)) {
        supportedMethods.push(methodValue);
      }
    } else {
      const index = supportedMethods.indexOf(methodValue);
      if (index > -1) {
        supportedMethods.splice(index, 1);
      }
    }
    
    this.paymentGatewayForm.patchValue({
      supportedMethods: supportedMethods
    });
    
    this.onFormFieldChange();
  }

  getErrorMessage(fieldName: string): string {
    const field = this.paymentGatewayForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldDisplayName(fieldName)} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        return `${this.getFieldDisplayName(fieldName)} must be a valid URL starting with http:// or https://`;
      }
      if (field.errors['minlength'] && fieldName === 'supportedMethods') {
        return 'At least one payment method must be selected';
      }
    }
    return '';
  }

  getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      code: 'Code',
      name: 'Name',
      productionApiBaseUrl: 'Production API URL',
      sandboxApiBaseUrl: 'Sandbox API URL',
      activeStatus: 'Status',
      supportedMethods: 'Supported Methods'
    };
    return displayNames[fieldName] || fieldName;
  }

  markFormGroupTouched(): void {
    Object.keys(this.paymentGatewayForm.controls).forEach(key => {
      const control = this.paymentGatewayForm.get(key);
      control?.markAsTouched();
    });
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.createdPaymentGateway = null;
  }

  goToPaymentGateways(): void {
    this.router.navigate(['/payment-gateways']);
  }

  goBack(): void {
    this.router.navigate(['/payment-gateways']);
  }

  private getApiErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }
}
