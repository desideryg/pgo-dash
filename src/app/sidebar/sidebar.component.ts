import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() isCollapsed: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() menuItemClick = new EventEmitter<string>();

  menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      route: '/dashboard'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: '👥',
      children: [
        {
          id: 'users-list',
          label: 'All Users',
          icon: '📋',
          route: '/users'
        },
        {
          id: 'users-roles',
          label: 'User Roles',
          icon: '🔐',
          route: '/users/roles'
        },
        {
          id: 'users-permissions',
          label: 'Permissions',
          icon: '🛡️',
          route: '/users/permissions'
        }
      ]
    },
    {
      id: 'merchants',
      label: 'Merchant Management',
      icon: '🏪',
      children: [
        {
          id: 'merchants-list',
          label: 'All Merchants',
          icon: '📋',
          route: '/merchants'
        },
        {
          id: 'merchants-verification',
          label: 'Verification',
          icon: '✅',
          route: '/merchants/verification'
        },
        {
          id: 'merchants-reports',
          label: 'Reports',
          icon: '📊',
          route: '/merchants/reports'
        }
      ]
    },
    {
      id: 'payment-gateways',
      label: 'Payment Gateways',
      icon: '💳',
      children: [
        {
          id: 'payment-gateways-list',
          label: 'All Gateways',
          icon: '📋',
          route: '/payment-gateways'
        },
        {
          id: 'payment-gateways-config',
          label: 'Configuration',
          icon: '⚙️',
          route: '/payment-gateways/config'
        },
        {
          id: 'payment-gateways-monitoring',
          label: 'Monitoring',
          icon: '📊',
          route: '/payment-gateways/monitoring'
        }
      ]
    },
    {
      id: 'payment-channels',
      label: 'Payment Channels',
      icon: '🔗',
      children: [
        {
          id: 'payment-channels-list',
          label: 'All Channels',
          icon: '📋',
          route: '/payment-channels'
        },
        {
          id: 'payment-channels-config',
          label: 'Configuration',
          icon: '⚙️',
          route: '/payment-channels/config'
        },
        {
          id: 'payment-channels-monitoring',
          label: 'Monitoring',
          icon: '📊',
          route: '/payment-channels/monitoring'
        }
      ]
    },
    {
      id: 'transactions',
      label: 'Transaction Management',
      icon: '💸',
      children: [
        {
          id: 'transactions-list',
          label: 'All Transactions',
          icon: '📋',
          route: '/transactions'
        },
        {
          id: 'transactions-pending',
          label: 'Pending Transactions',
          icon: '⏳',
          route: '/transactions?status=PENDING'
        },
        {
          id: 'transactions-failed',
          label: 'Failed Transactions',
          icon: '❌',
          route: '/transactions?status=FAILED'
        },
        {
          id: 'transactions-reports',
          label: 'Transaction Reports',
          icon: '📊',
          route: '/transactions/reports'
        }
      ]
    },
    {
      id: 'disbursements',
      label: 'Disbursement Management',
      icon: '💰',
      children: [
        {
          id: 'disbursements-list',
          label: 'All Disbursements',
          icon: '📋',
          route: '/disbursements'
        },
        {
          id: 'disbursements-pending',
          label: 'Pending Disbursements',
          icon: '⏳',
          route: '/disbursements?status=PENDING'
        },
        {
          id: 'disbursements-processing',
          label: 'Processing',
          icon: '🔄',
          route: '/disbursements?status=PROCESSING'
        },
        {
          id: 'disbursements-completed',
          label: 'Completed',
          icon: '✅',
          route: '/disbursements?status=COMPLETED'
        },
        {
          id: 'disbursements-failed',
          label: 'Failed',
          icon: '❌',
          route: '/disbursements?status=FAILED'
        }
      ]
    },
    {
      id: 'gateway-channel-mapping',
      label: 'Gateway-Channel Mapping',
      icon: '🔗',
      children: [
        {
          id: 'mapping-list',
          label: 'All Mappings',
          icon: '📋',
          route: '/gateway-channel-mapping'
        },
        {
          id: 'mapping-create',
          label: 'Create Mapping',
          icon: '➕',
          route: '/gateway-channel-mapping'
        },
        {
          id: 'mapping-active',
          label: 'Active Mappings',
          icon: '✅',
          route: '/gateway-channel-mapping?active=true'
        }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📊',
      children: [
        {
          id: 'analytics-overview',
          label: 'Overview',
          icon: '📈',
          route: '/analytics/overview'
        },
        {
          id: 'analytics-reports',
          label: 'Reports',
          icon: '📋',
          children: [
            {
              id: 'analytics-reports-daily',
              label: 'Daily Reports',
              icon: '📅',
              route: '/analytics/reports/daily'
            },
            {
              id: 'analytics-reports-weekly',
              label: 'Weekly Reports',
              icon: '📆',
              route: '/analytics/reports/weekly'
            },
            {
              id: 'analytics-reports-monthly',
              label: 'Monthly Reports',
              icon: '🗓️',
              route: '/analytics/reports/monthly'
            }
          ]
        },
        {
          id: 'analytics-export',
          label: 'Export Data',
          icon: '💾',
          route: '/analytics/export'
        }
      ]
    },
    {
      id: 'system',
      label: 'System',
      icon: '⚙️',
      children: [
        {
          id: 'system-settings',
          label: 'Settings',
          icon: '🔧',
          route: '/system/settings'
        },
        {
          id: 'system-logs',
          label: 'System Logs',
          icon: '📝',
          route: '/system/logs'
        },
        {
          id: 'system-backup',
          label: 'Backup & Restore',
          icon: '💾',
          route: '/system/backup'
        }
      ]
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: '🔔',
      route: '/notifications'
    },
    {
      id: 'splash',
      label: 'API Status',
      icon: '🚀',
      route: '/splash'
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: '❓',
      children: [
        {
          id: 'help-documentation',
          label: 'Documentation',
          icon: '📚',
          route: '/help/docs'
        },
        {
          id: 'help-contact',
          label: 'Contact Support',
          icon: '📞',
          route: '/help/contact'
        }
      ]
    }
  ];

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onMenuItemClick(item: MenuItem): void {
    if (item.children) {
      // Check if the clicked item is currently expanded
      const wasExpanded = item.expanded;
      
      // Collapse all other expanded menu items first
      this.collapseAllMenuItems();
      
      // If the clicked item was not expanded, expand it
      // If it was expanded, it will remain collapsed (accordion behavior)
      if (!wasExpanded) {
        item.expanded = true;
      }
    } else if (item.route) {
      // Emit click event for leaf items
      this.menuItemClick.emit(item.route);
    }
  }

  private collapseAllMenuItems(): void {
    this.menuItems.forEach(menuItem => {
      if (menuItem.children) {
        menuItem.expanded = false;
        // Also collapse any nested children
        this.collapseMenuItemChildren(menuItem);
      }
    });
  }

  private collapseMenuItemChildren(item: MenuItem): void {
    if (item.children) {
      item.children.forEach(child => {
        child.expanded = false;
        if (child.children) {
          this.collapseMenuItemChildren(child);
        }
      });
    }
  }

  hasChildren(item: MenuItem): boolean {
    return !!(item.children && item.children.length > 0);
  }

  getItemClass(item: MenuItem): string {
    const classes = ['menu-item'];
    
    if (this.hasChildren(item)) {
      classes.push('has-children');
    }
    
    if (item.expanded) {
      classes.push('expanded');
    }
    
    return classes.join(' ');
  }
}
