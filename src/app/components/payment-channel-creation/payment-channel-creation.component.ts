import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PaymentChannelService } from '../../services/payment-channel.service';
import { CreatePaymentChannelRequest, CreatePaymentChannelResponse } from '../../models/payment-channel.model';

@Component({
  selector: 'app-payment-channel-creation',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './payment-channel-creation.component.html',
  styleUrls: ['./payment-channel-creation.component.css']
})
export class PaymentChannelCreationComponent implements OnInit {
  paymentChannelForm: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  showSuccessModal = false;
  createdChannel: any = null;

  // Form options
  paymentChannelTypes: string[] = [];

  constructor(
    private fb: FormBuilder,
    private paymentChannelService: PaymentChannelService
  ) {
    this.paymentChannelForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      paymentChannelType: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.paymentChannelTypes = this.paymentChannelService.getPaymentChannelTypes();
  }

  onSubmit(): void {
    if (this.paymentChannelForm.valid) {
      this.loading = true;
      this.error = null;
      this.success = null;

      const request: CreatePaymentChannelRequest = {
        code: this.paymentChannelForm.value.code,
        name: this.paymentChannelForm.value.name,
        paymentChannelType: this.paymentChannelForm.value.paymentChannelType,
        isActive: this.paymentChannelForm.value.isActive
      };

      this.paymentChannelService.createPaymentChannel(request)
        .subscribe({
          next: (response: CreatePaymentChannelResponse) => {
            this.loading = false;
            if (response.status && response.data) {
              this.createdChannel = response.data;
              this.showSuccessModal = true;
              this.paymentChannelForm.reset();
              this.paymentChannelForm.patchValue({ isActive: true });
            } else {
              this.error = 'Failed to create payment channel';
            }
          },
          error: (error) => {
            this.loading = false;
            this.error = 'Error creating payment channel: ' + (error.error?.message || error.message);
            console.error('Error creating payment channel:', error);
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.paymentChannelForm.controls).forEach(key => {
      const control = this.paymentChannelForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.paymentChannelForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength'].requiredLength;
      return `${this.getFieldDisplayName(fieldName)} must be at least ${requiredLength} characters`;
    }
    if (control?.hasError('maxlength')) {
      const requiredLength = control.errors?.['maxlength'].requiredLength;
      return `${this.getFieldDisplayName(fieldName)} must not exceed ${requiredLength} characters`;
    }
    return '';
  }

  getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      'code': 'Code',
      'name': 'Name',
      'paymentChannelType': 'Payment Channel Type',
      'isActive': 'Status'
    };
    return fieldNames[fieldName] || fieldName;
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.createdChannel = null;
  }

  getTypeDisplayName(type: string): string {
    return this.paymentChannelService.getPaymentChannelTypeDisplayName(type);
  }

  getTypeIcon(type: string): string {
    return this.paymentChannelService.getPaymentChannelTypeIcon(type);
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

  onFormFieldChange(): void {
    this.clearMessages();
  }
}
