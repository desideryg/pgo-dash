# Merchant Crypto Key Management

This component provides a comprehensive interface for managing cryptographic keys for merchants in the payment gateway system.

## Features

- **Create Crypto Keys**: Generate new cryptographic keys for merchants
- **View Key Details**: Display key information including algorithm, size, fingerprint, and status
- **Key Management**: Activate, deactivate, and revoke crypto keys
- **Search and Filter**: Find keys by name, algorithm, status, or type
- **Expiry Tracking**: Monitor key expiration dates with visual indicators
- **Usage Statistics**: Track key usage counts

## API Integration

The component integrates with the following API endpoints:

- `POST /admin/v1/merchants/uid/{merchantUid}/crypto-keys` - Create new crypto key
- `GET /admin/v1/merchants/uid/{merchantUid}/crypto-keys` - List merchant crypto keys
- `POST /admin/v1/merchants/uid/{merchantUid}/crypto-keys/{keyUid}/activate` - Activate key
- `POST /admin/v1/merchants/uid/{merchantUid}/crypto-keys/{keyUid}/deactivate` - Deactivate key
- `DELETE /admin/v1/merchants/uid/{merchantUid}/crypto-keys/{keyUid}` - Revoke key

## Usage

Navigate to `/merchants/{merchantUid}/crypto-keys` to access the crypto key management interface for a specific merchant.

## Key Features

### Key Status Management
- **PENDING**: Newly created keys awaiting activation
- **ACTIVE**: Keys ready for use
- **INACTIVE**: Temporarily disabled keys
- **EXPIRED**: Keys past their expiration date
- **REVOKED**: Permanently disabled keys

### Supported Algorithms
- **RSA**: RSA encryption keys
- **EC**: Elliptic Curve keys  
- **EdDSA**: Edwards-curve Digital Signature Algorithm keys

### Key Types
- **PUBLIC_KEY**: Public cryptographic keys
- **PRIVATE_KEY**: Private cryptographic keys

## Security Features

- Confirmation dialogs for destructive actions
- Visual indicators for expired keys
- Secure key fingerprint display
- Usage tracking and monitoring
