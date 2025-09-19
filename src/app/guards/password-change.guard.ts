import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const passwordChangeGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Get current user
  const user = authService.getCurrentUser();
  
  // If user requires password change, redirect to password change page
  if (user?.requirePasswordChange) {
    // Allow access to password change page itself
    if (state.url === '/password-change') {
      return true;
    }
    
    // Redirect to password change for all other routes
    router.navigate(['/password-change']);
    return false;
  }

  // If user doesn't require password change but tries to access password change page
  if (state.url === '/password-change' && !user?.requirePasswordChange) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
