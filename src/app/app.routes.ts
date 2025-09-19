import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { passwordChangeGuard } from './guards/password-change.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/splash', pathMatch: 'full' },
  {
    path: 'splash',
    loadComponent: () => import('./components/splash/splash.component').then(m => m.SplashComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'password-change',
    loadComponent: () => import('./components/password-change/password-change.component').then(m => m.PasswordChangeComponent),
    canActivate: [AuthGuard, passwordChangeGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard, passwordChangeGuard]
  },
  {
    path: 'users/create',
    loadComponent: () => import('./components/user-creation/user-creation.component').then(m => m.UserCreationComponent),
    canActivate: [AuthGuard, passwordChangeGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./components/user-management/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [AuthGuard, passwordChangeGuard]
  },
  {
    path: 'users/roles',
    loadComponent: () => import('./components/role-management/role-management.component').then(m => m.RoleManagementComponent),
    canActivate: [AuthGuard, passwordChangeGuard]
  },
  {
    path: 'users/permissions',
    loadComponent: () => import('./components/permission-management/permission-management.component').then(m => m.PermissionManagementComponent),
    canActivate: [AuthGuard, passwordChangeGuard]
  },
  {
    path: 'merchants',
    loadComponent: () => import('./components/merchant-management/merchant-management.component').then(m => m.MerchantManagementComponent),
    canActivate: [AuthGuard, passwordChangeGuard]
  },
  {
    path: 'merchants/create',
    loadComponent: () => import('./components/merchant-creation/merchant-creation.component').then(m => m.MerchantCreationComponent),
    canActivate: [AuthGuard, passwordChangeGuard]
  },
  {
    path: 'merchants/:uid/api-keys',
    loadComponent: () => import('./components/api-key-management/api-key-management.component').then(m => m.ApiKeyManagementComponent),
    canActivate: [AuthGuard, passwordChangeGuard]
  },
  {
    path: 'merchants/:merchantUid/crypto-keys',
    loadComponent: () => import('./components/merchant-crypto-key-management/merchant-crypto-key-management.component').then(m => m.MerchantCryptoKeyManagementComponent),
    canActivate: [AuthGuard, passwordChangeGuard]
  },
  {
    path: 'payment-gateways',
    loadComponent: () => import('./components/payment-gateway-management/payment-gateway-management.component').then(m => m.PaymentGatewayManagementComponent),
    canActivate: [AuthGuard, passwordChangeGuard]
  },
      {
        path: 'payment-gateways/create',
        loadComponent: () => import('./components/payment-gateway-creation/payment-gateway-creation.component').then(m => m.PaymentGatewayCreationComponent),
        canActivate: [AuthGuard, passwordChangeGuard]
      },
      {
        path: 'payment-channels',
        loadComponent: () => import('./components/payment-channel-management/payment-channel-management.component').then(m => m.PaymentChannelManagementComponent),
        canActivate: [AuthGuard, passwordChangeGuard]
      },
      {
        path: 'payment-channels/create',
        loadComponent: () => import('./components/payment-channel-creation/payment-channel-creation.component').then(m => m.PaymentChannelCreationComponent),
        canActivate: [AuthGuard, passwordChangeGuard]
      },
      {
        path: 'transactions',
        loadComponent: () => import('./components/transaction-management/transaction-management.component').then(m => m.TransactionManagementComponent),
        canActivate: [AuthGuard, passwordChangeGuard]
      },
      {
        path: 'gateway-channel-mapping',
        loadComponent: () => import('./components/gateway-channel-mapping/gateway-channel-mapping.component').then(m => m.GatewayChannelMappingComponent),
        canActivate: [AuthGuard, passwordChangeGuard]
      },
      {
        path: 'disbursements',
        loadComponent: () => import('./components/disbursement-management/disbursement-management.component').then(m => m.DisbursementManagementComponent),
        canActivate: [AuthGuard, passwordChangeGuard]
      },
      { path: '**', redirectTo: '/dashboard' }
];
