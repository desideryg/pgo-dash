import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  title = 'PGO Engine Dashboard';
  currentDate = new Date().toLocaleDateString();
  currentTime = new Date().toLocaleTimeString();

  // Sample dashboard data
  stats = [
    { label: 'Total Users', value: '1,234', icon: '👥', color: 'blue' },
    { label: 'Active Sessions', value: '567', icon: '🔗', color: 'green' },
    { label: 'System Status', value: 'Online', icon: '✅', color: 'green' },
    { label: 'Server Load', value: '45%', icon: '📊', color: 'orange' }
  ];

  recentActivities = [
    { action: 'User login', user: 'john.doe', time: '2 minutes ago', type: 'success' },
    { action: 'System backup', user: 'system', time: '15 minutes ago', type: 'info' },
    { action: 'Failed login attempt', user: 'unknown', time: '23 minutes ago', type: 'warning' },
    { action: 'New user registered', user: 'jane.smith', time: '1 hour ago', type: 'success' },
    { action: 'Database maintenance', user: 'admin', time: '2 hours ago', type: 'info' }
  ];

  getActivityIcon(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  }

  getActivityClass(type: string): string {
    return `activity-item activity-${type}`;
  }

}
