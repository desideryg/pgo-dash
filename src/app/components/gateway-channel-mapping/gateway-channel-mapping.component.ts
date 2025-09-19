import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GatewayChannelMappingService } from '../../services/gateway-channel-mapping.service';
import { PaymentGatewayService } from '../../services/payment-gateway.service';
import { PaymentChannelService } from '../../services/payment-channel.service';
import { 
  GatewayChannelMapping, 
  CreateMappingRequest, 
  MappingFilters 
} from '../../models/gateway-channel-mapping.model';
import { PaymentGateway } from '../../models/payment-gateway.model';
import { PaymentChannel } from '../../models/payment-channel.model';

@Component({
  selector: 'app-gateway-channel-mapping',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gateway-channel-mapping.component.html',
  styleUrls: ['./gateway-channel-mapping.component.css']
})
export class GatewayChannelMappingComponent implements OnInit {
  mappings: GatewayChannelMapping[] = [];
  paymentGateways: PaymentGateway[] = [];
  paymentChannels: PaymentChannel[] = [];
  loading = false;
  error: string | null = null;
  
  // Pagination
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;
  
  // Form data for creating new mapping
  newMapping = {
    gatewayUid: '',
    channelUid: '',
    payCode: '',
    provider: ''
  };
  
  // Filters
  filters: MappingFilters = {};
  
  // Filter form
  filterForm = {
    gatewayId: '',
    channelId: '',
    active: '',
    search: ''
  };
  
  // UI state
  showCreateForm = false;
  selectedMapping: GatewayChannelMapping | null = null;

  constructor(
    private mappingService: GatewayChannelMappingService,
    private paymentGatewayService: PaymentGatewayService,
    private paymentChannelService: PaymentChannelService
  ) {}

  ngOnInit(): void {
    this.loadPaymentGateways();
    this.loadPaymentChannels();
    this.loadMappings();
  }

  loadPaymentGateways(): void {
    this.paymentGatewayService.getPaymentGateways().subscribe({
      next: (response) => {
        this.paymentGateways = response.data || [];
        // Auto-select first gateway if none is selected
        if (this.paymentGateways.length > 0 && !this.filterForm.gatewayId) {
          this.filterForm.gatewayId = this.paymentGateways[0].uid;
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Error loading payment gateways:', error);
      }
    });
  }

  loadPaymentChannels(): void {
    this.paymentChannelService.getPaymentChannels().subscribe({
      next: (response) => {
        this.paymentChannels = response.data || [];
      },
      error: (error) => {
        console.error('Error loading payment channels:', error);
      }
    });
  }

  loadMappings(): void {
    this.loading = true;
    this.error = null;
    
    console.log('Loading mappings with filters:', this.filters);
    
    this.mappingService.getMappings(this.filters).subscribe({
      next: (response) => {
        console.log('Mappings response:', response);
        this.mappings = response.data || [];
        this.currentPage = response.pageNumber || 0;
        this.pageSize = response.pageSize || 20;
        this.totalElements = response.totalElements || 0;
        this.totalPages = response.totalPages || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading mappings:', error);
        this.error = `Failed to load mappings: ${error.message || error.statusText || 'Unknown error'}`;
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filters = {
      gatewayId: this.filterForm.gatewayId || undefined,
      channelId: this.filterForm.channelId || undefined,
      active: this.filterForm.active ? this.filterForm.active === 'true' : undefined,
      search: this.filterForm.search || undefined
    };
    this.loadMappings();
  }

  clearFilters(): void {
    this.filterForm = {
      gatewayId: '',
      channelId: '',
      active: '',
      search: ''
    };
    this.filters = {};
    this.loadMappings();
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.resetNewMapping();
    }
  }

  resetNewMapping(): void {
    this.newMapping = {
      gatewayUid: '',
      channelUid: '',
      payCode: '',
      provider: ''
    };
  }

  onCreateMapping(): void {
    if (!this.newMapping.gatewayUid || !this.newMapping.channelUid || 
        !this.newMapping.payCode || !this.newMapping.provider) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.error = null;

    const mappingData: CreateMappingRequest = {
      payCode: this.newMapping.payCode,
      provider: this.newMapping.provider
    };

    this.mappingService.createMapping(
      this.newMapping.gatewayUid,
      this.newMapping.channelUid,
      mappingData
    ).subscribe({
      next: (response) => {
        this.loadMappings(); // Reload mappings
        this.toggleCreateForm(); // Close form
        this.loading = false;
        console.log('Mapping created successfully:', response);
      },
      error: (error) => {
        this.error = 'Failed to create mapping';
        this.loading = false;
        console.error('Error creating mapping:', error);
      }
    });
  }

  onActivateMapping(mapping: GatewayChannelMapping): void {
    this.loading = true;
    this.mappingService.activateMapping(mapping.uid).subscribe({
      next: (response) => {
        this.loadMappings();
        this.loading = false;
        console.log('Mapping activated successfully');
      },
      error: (error) => {
        this.error = 'Failed to activate mapping';
        this.loading = false;
        console.error('Error activating mapping:', error);
      }
    });
  }

  onDeactivateMapping(mapping: GatewayChannelMapping): void {
    this.loading = true;
    this.mappingService.deactivateMapping(mapping.uid).subscribe({
      next: (response) => {
        this.loadMappings();
        this.loading = false;
        console.log('Mapping deactivated successfully');
      },
      error: (error) => {
        this.error = 'Failed to deactivate mapping';
        this.loading = false;
        console.error('Error deactivating mapping:', error);
      }
    });
  }

  onDeleteMapping(mapping: GatewayChannelMapping): void {
    if (confirm(`Are you sure you want to delete the mapping between ${mapping.paymentGatewayName} and ${mapping.paymentChannelName}?`)) {
      this.loading = true;
      this.mappingService.deleteMapping(mapping.uid).subscribe({
        next: (response) => {
          this.loadMappings();
          this.loading = false;
          console.log('Mapping deleted successfully');
        },
        error: (error) => {
          this.error = 'Failed to delete mapping';
          this.loading = false;
          console.error('Error deleting mapping:', error);
        }
      });
    }
  }

  viewMappingDetails(mapping: GatewayChannelMapping): void {
    this.selectedMapping = mapping;
    console.log('Mapping Details:', mapping);
  }

  getGatewayName(gatewayUid: string): string {
    const gateway = this.paymentGateways.find(g => g.uid === gatewayUid);
    return gateway ? gateway.name : 'Unknown Gateway';
  }

  getChannelName(channelUid: string): string {
    const channel = this.paymentChannels.find(c => c.uid === channelUid);
    return channel ? channel.name : 'Unknown Channel';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getStatusClass(active: boolean): string {
    return active ? 'status-active' : 'status-inactive';
  }
}
