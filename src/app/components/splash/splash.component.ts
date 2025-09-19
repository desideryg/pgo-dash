import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SplashService } from '../../services/splash.service';
import { SplashData } from '../../models/splash.model';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css']
})
export class SplashComponent implements OnInit {
  splashData: SplashData | null = null;
  isLoading = false;
  errorMessage = '';
  currentTime = new Date().toLocaleString();

  constructor(private splashService: SplashService) {}

  ngOnInit(): void {
    this.loadSplashInfo();
    // Update time every second
    setInterval(() => {
      this.currentTime = new Date().toLocaleString();
    }, 1000);
  }

  loadSplashInfo(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.splashService.getSplashInfo().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status) {
          this.splashData = response.data;
        } else {
          this.errorMessage = response.message || 'Failed to load API information';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error);
        console.error('Error loading splash info:', error);
      }
    });
  }

  refreshData(): void {
    this.loadSplashInfo();
  }

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Unable to connect to the server. Please check your connection.';
    } else if (error.status === 404) {
      return 'API endpoint not found';
    } else if (error.status === 500) {
      return 'Server error. Please try again later';
    } else if (error.error?.message) {
      return error.error.message;
    } else {
      return 'An unexpected error occurred';
    }
  }
}
