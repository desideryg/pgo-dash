import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ConfigService } from '../../services/config.service';
import { CreateUserRequest } from '../../models/user.model';
import { ConfigOption } from '../../models/config.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-creation',
  templateUrl: './user-creation.component.html',
  styleUrls: ['./user-creation.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class UserCreationComponent implements OnInit {
  userForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Available options for dropdowns
  userRoles: ConfigOption[] = [];
  userTypes: ConfigOption[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private configService: ConfigService,
    private router: Router
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    // Load configuration data
    this.loadConfiguration();
  }

  private loadConfiguration(): void {
    this.configService.getConfigData$().subscribe(config => {
      if (config) {
        this.userRoles = config.userRoles;
        this.userTypes = config.userTypes;
      } else {
        // If config not loaded yet, try to load it
        this.configService.loadConfig().subscribe();
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      roleNames: [[], [Validators.required]],
      userType: ['', [Validators.required]],
      associatedMerchantId: ['']
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      this.clearMessages();

      const userData: CreateUserRequest = {
        username: this.userForm.value.username,
        email: this.userForm.value.email,
        firstName: this.userForm.value.firstName,
        lastName: this.userForm.value.lastName,
        phoneNumber: this.userForm.value.phoneNumber,
        roleNames: this.userForm.value.roleNames,
        userType: this.userForm.value.userType,
        associatedMerchantId: this.userForm.value.associatedMerchantId || undefined
      };

      this.userService.createUser(userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status) {
            this.successMessage = `User "${userData.username}" has been created successfully!`;
            this.userForm.reset();
            // Clear any previous error messages
            this.errorMessage = '';
            // Scroll to top to show success message
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 3000);
          } else {
            this.errorMessage = response.message || 'Failed to create user. Please try again.';
            this.successMessage = '';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = this.getErrorMessage(error);
          this.successMessage = '';
          console.error('User creation error:', error);
          // Scroll to top to show error message
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }

  onRoleChange(event: any, role: string): void {
    const currentRoles = this.userForm.get('roleNames')?.value || [];
    let updatedRoles: string[];
    
    if (event.target.checked) {
      updatedRoles = [...currentRoles, role];
    } else {
      updatedRoles = currentRoles.filter((r: string) => r !== role);
    }
    
    this.userForm.patchValue({ roleNames: updatedRoles });
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['pattern']) return 'Please enter a valid phone number';
    }
    return '';
  }

  private getErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    
    if (error.status === 0) {
      return 'Unable to connect to the server. Please check your connection and try again.';
    }
    
    if (error.status === 400) {
      return 'Invalid data provided. Please check your input and try again.';
    }
    
    if (error.status === 409) {
      return 'A user with this username or email already exists. Please use different credentials.';
    }
    
    if (error.status === 500) {
      return 'Server error occurred. Please try again later.';
    }
    
    return 'An unexpected error occurred while creating the user. Please try again.';
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  onFormFieldChange(): void {
    // Clear error messages when user starts typing
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }
}
