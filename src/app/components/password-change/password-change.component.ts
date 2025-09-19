import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-password-change',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.css']
})
export class PasswordChangeComponent implements OnInit {
  passwordChangeForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.passwordChangeForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: [this.passwordMatchValidator, this.passwordDifferenceValidator] });
  }

  ngOnInit(): void {
    // Check if user actually needs to change password
    const user = this.authService.getCurrentUser();
    if (!user?.requirePasswordChange) {
      // If password change is not required, redirect to dashboard
      this.router.navigate(['/dashboard']);
    }
  }

  passwordStrengthValidator(control: any) {
    const password = control.value;
    if (!password) return null;

    const errors: any = {};
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 8;

    if (!hasUpperCase) errors.noUpperCase = true;
    if (!hasLowerCase) errors.noLowerCase = true;
    if (!hasNumber) errors.noNumber = true;
    if (!hasSpecialChar) errors.noSpecialChar = true;
    if (!hasMinLength) errors.tooShort = true;

    const valid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && hasMinLength;
    
    console.log('Password validation for:', password);
    console.log('Validation results:', { hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar, hasMinLength, valid });
    
    return valid ? null : { passwordStrength: errors };
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword');
    const confirmPassword = group.get('confirmPassword');

    if (!newPassword || !confirmPassword) return null;

    const match = newPassword.value === confirmPassword.value;
    console.log('Password match validation:', {
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value,
      match: match
    });

    return match ? null : { passwordMismatch: true };
  }

  passwordDifferenceValidator(group: FormGroup) {
    const currentPassword = group.get('currentPassword');
    const newPassword = group.get('newPassword');

    if (!currentPassword || !newPassword) return null;
    if (!currentPassword.value || !newPassword.value) return null;

    const same = currentPassword.value === newPassword.value;
    console.log('Password difference validation:', {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
      same: same
    });

    return same ? { passwordSame: true } : null;
  }

  onSubmit(): void {
    console.log('Form submission attempted');
    console.log('Form valid:', this.passwordChangeForm.valid);
    console.log('Form errors:', this.passwordChangeForm.errors);
    console.log('Form values:', this.passwordChangeForm.value);
    
    // Check individual field validations
    Object.keys(this.passwordChangeForm.controls).forEach(key => {
      const control = this.passwordChangeForm.get(key);
      if (control && control.errors) {
        console.log(`${key} errors:`, control.errors);
      }
    });

    if (this.passwordChangeForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = {
        currentPassword: this.passwordChangeForm.get('currentPassword')?.value,
        newPassword: this.passwordChangeForm.get('newPassword')?.value,
        newPasswordConfirmation: this.passwordChangeForm.get('confirmPassword')?.value
      };

      console.log('Password change form data:', formData);
      console.log('Making password change request...');

      this.authService.changePassword(formData).subscribe({
        next: (response) => {
          console.log('Password change response:', response);
          if (response.status) {
            this.successMessage = 'Password changed successfully! Redirecting...';
            
            // Update user data to reflect password change completion
            const currentUser = this.authService.getCurrentUser();
            if (currentUser) {
              const updatedUser = { ...currentUser, requirePasswordChange: false };
              this.authService.updateUserData(updatedUser);
            }

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 2000);
          } else {
            this.errorMessage = response.message || 'Password change failed';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Password change error details:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error response:', error.error);
          
          // Log detailed validation errors if available
          if (error.error?.errors) {
            console.error('Validation errors:', error.error.errors);
            console.error('Detailed validation errors:');
            Object.keys(error.error.errors).forEach(key => {
              console.error(`- ${key}:`, error.error.errors[key]);
            });
          }
          
          // Show detailed error message to user
          let errorMsg = error.error?.message || error.message || 'An error occurred while changing password';
          if (error.error?.errors) {
            const validationErrors = Object.values(error.error.errors).join(', ');
            errorMsg += ` (${validationErrors})`;
          }
          
          this.errorMessage = errorMsg;
          this.isLoading = false;
        }
      });
    } else {
      console.log('Form is invalid, marking all fields as touched');
      this.markFormGroupTouched();
      this.errorMessage = 'Please fix the validation errors before submitting';
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.passwordChangeForm.controls).forEach(key => {
      const control = this.passwordChangeForm.get(key);
      control?.markAsTouched();
    });
  }

  togglePasswordVisibility(field: string): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  getPasswordStrengthClass(): string {
    const password = this.passwordChangeForm.get('newPassword')?.value || '';
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strengthCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

    if (password.length < 8) return 'weak';
    if (strengthCount < 3) return 'medium';
    if (strengthCount === 4) return 'strong';
    return 'weak';
  }

  getPasswordStrengthText(): string {
    const strengthClass = this.getPasswordStrengthClass();
    switch (strengthClass) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      default: return '';
    }
  }

  logout(): void {
    this.authService.logout();
  }

  // Helper methods for template
  hasUpperCase(): boolean {
    const password = this.passwordChangeForm.get('newPassword')?.value || '';
    return /[A-Z]/.test(password);
  }

  hasLowerCase(): boolean {
    const password = this.passwordChangeForm.get('newPassword')?.value || '';
    return /[a-z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.passwordChangeForm.get('newPassword')?.value || '';
    return /\d/.test(password);
  }

  hasSpecialChar(): boolean {
    const password = this.passwordChangeForm.get('newPassword')?.value || '';
    return /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }

  hasMinLength(): boolean {
    const password = this.passwordChangeForm.get('newPassword')?.value || '';
    return password.length >= 8;
  }

  // Debug method to check form status
  debugForm(): void {
    console.log('=== FORM DEBUG INFO ===');
    console.log('Form valid:', this.passwordChangeForm.valid);
    console.log('Form value:', this.passwordChangeForm.value);
    console.log('Form errors:', this.passwordChangeForm.errors);
    
    console.log('=== FIELD VALIDATIONS ===');
    Object.keys(this.passwordChangeForm.controls).forEach(key => {
      const control = this.passwordChangeForm.get(key);
      console.log(`${key}:`, {
        value: control?.value,
        valid: control?.valid,
        errors: control?.errors,
        touched: control?.touched,
        dirty: control?.dirty
      });
    });
    console.log('========================');
  }
}
