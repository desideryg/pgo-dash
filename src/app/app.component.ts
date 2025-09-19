import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AuthService, User } from './services/auth.service';
import { ConfigService } from './services/config.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  sidebarCollapsed = false;
  currentUser: User | null = null;
  showSidebar = true;
  currentRoute = '';

  onToggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onMenuItemClick(route: string): void {
    console.log('Navigating to:', route);
    this.router.navigate([route]);
  }

  constructor(
    private authService: AuthService, 
    private router: Router,
    private configService: ConfigService
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      // Update sidebar visibility when authentication status changes
      this.updateSidebarVisibility();
    });

    // Listen to route changes to determine if sidebar should be shown
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
        this.updateSidebarVisibility();
      });
  }

  ngOnInit(): void {
    // Set initial route
    this.currentRoute = this.router.url;
    this.updateSidebarVisibility();

    // Load configuration data on app initialization
    this.configService.loadConfig().subscribe({
      next: (config) => {
        if (config) {
          console.log('Configuration loaded successfully:', config);
        }
      },
      error: (error) => {
        console.error('Failed to load configuration:', error);
      }
    });
  }

  private updateSidebarVisibility(): void {
    // Hide sidebar on login, splash, and password change pages, or when user is not authenticated
    const hideSidebarRoutes = ['/login', '/splash', '/password-change'];
    const isOnHideRoute = hideSidebarRoutes.includes(this.currentRoute);
    const isAuthenticated = this.authService.isAuthenticated();
    
    this.showSidebar = !isOnHideRoute && isAuthenticated;
  }

  logout(): void {
    this.authService.logout();
  }
}
