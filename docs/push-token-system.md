# Push Token Management System

This document describes the push token management system implemented for the currency converter app.

## Overview

The push token management system ensures that:

1. Push tokens are registered only once per device launch
2. Tokens are stored securely in MongoDB
3. Old/inactive tokens are automatically cleaned up
4. Each device maintains only one active token per platform
5. Push notifications are sent automatically when new builds are deployed

## Architecture

### Frontend Components

#### 1. Push Token Service (`src/services/pushTokenService.ts`)

- Handles communication with backend API
- Manages local token registration status
- Provides methods for token registration and validation

#### 2. Device ID Utility (`src/utils/deviceId.ts`)

- Generates unique device identifiers
- Uses Expo's installation ID when available
- Fallback to timestamp-based ID generation

#### 3. Push Token Manager (`src/utils/pushTokenManager.ts`)

- High-level utility functions for token management
- Status checking utilities

#### 4. Setup Hook (`src/hooks/useSetupForPushNotifications.ts`)

- Main hook for initializing push notifications
- Runs once per app launch
- Handles permission requests and token registration

### Backend Components

#### 1. Push Token Model (`backend/src/models/PushToken.js`)

- MongoDB schema for storing push tokens
- Methods for token lifecycle management
- Automatic cleanup of old tokens

#### 2. Push Token Routes (`backend/src/routes/pushTokens.js`)

- RESTful API endpoints for token management
- Registration, deactivation, and query endpoints
- Proper error handling and validation

#### 3. Push Notification Service (`backend/src/services/pushNotificationService.js`)

- Direct integration with Expo's push notification API
- Batch sending capabilities
- Automatic invalid token cleanup

#### 4. Notification Routes (`backend/src/routes/notifications.js`)

- API endpoints for sending notifications
- Webhook endpoint for GitHub Actions integration
- Version-specific notification handling

## API Endpoints

### POST `/api/push-tokens/register`

Registers a new push token for a device.

**Request Body:**

```json
{
  "pushToken": "ExponentPushToken[xxxxxx]",
  "deviceId": "unique-device-id",
  "platform": "ios|android|web"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Push token registered successfully",
  "tokenId": "mongodb-object-id"
}
```

### GET `/api/push-tokens/device/:deviceId`

Retrieves active tokens for a specific device.

**Query Parameters:**

- `platform` (optional): Filter by platform

### POST `/api/push-tokens/deactivate`

Deactivates push tokens by token or device ID.

**Request Body:**

```json
{
  "pushToken": "ExponentPushToken[xxxxxx]", // OR
  "deviceId": "unique-device-id"
}
```

### GET `/api/push-tokens/active`

Lists all active tokens (admin endpoint).

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

### POST `/api/push-tokens/cleanup`

Manually triggers cleanup of old inactive tokens.

## Database Schema

```javascript
{
  pushToken: String, // Expo push token
  deviceId: String,  // Unique device identifier
  platform: String,  // 'ios', 'android', or 'web'
  isActive: Boolean, // Whether token is currently active
  lastUsed: Date,    // Last time token was accessed
  createdAt: Date,   // Token creation timestamp
  updatedAt: Date    // Last update timestamp
}
```

## Flow Diagram

```
App Launch
    ↓
Check Local Registration Status
    ↓
Already Registered? → Exit
    ↓ No
Request Push Permissions
    ↓
Get Expo Push Token
    ↓
Generate/Retrieve Device ID
    ↓
Send to Backend API
    ↓
Backend: Deactivate Old Tokens
    ↓
Backend: Save New Token
    ↓
Frontend: Save Registration Status
    ↓
Complete
```

## Key Features

### 1. One-Time Registration

- Tokens are registered only once per app launch
- Local storage tracks registration status
- Prevents duplicate API calls

### 2. Automatic Cleanup

- Daily cron job removes old inactive tokens
- Tokens older than 30 days are automatically deleted
- Device token rotation is handled gracefully

### 3. Platform Support

- iOS, Android, and Web platforms supported
- Platform-specific notification channel setup
- Proper permission handling per platform

### 4. Error Handling

- Comprehensive error logging
- Graceful fallbacks for token generation
- Retry mechanisms for network failures

### 5. Development Support

- Debug utilities for checking registration status
- Force re-registration capabilities
- Comprehensive logging

## Usage

### Basic Setup

```typescript
import useSetupForPushNotifications from "@/hooks/useSetupForPushNotifications";

function App() {
  useSetupForPushNotifications();
  // ... rest of app
}
```

### Check Registration Status

```typescript
import { PushTokenManager } from "@/utils/pushTokenManager";

const status = await PushTokenManager.getRegistrationStatus();
console.log("Registration status:", status);
```

### Force Re-registration

```typescript
import { PushTokenManager } from "@/utils/pushTokenManager";

await PushTokenManager.forceReregistration();
// Restart app to trigger re-registration
```

## Environment Variables

### Backend

- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 3000)
- `CORS_ORIGIN`: Allowed CORS origin

### Frontend

- `EXPO_PUBLIC_API_URL`: Backend API URL

## Security Considerations

1. **Token Privacy**: Push tokens are sensitive and should be treated as such
2. **Device ID Uniqueness**: Device IDs are unique per installation, not per device
3. **API Security**: Consider adding authentication to admin endpoints
4. **Rate Limiting**: Implement rate limiting on registration endpoints
5. **Data Retention**: Automatic cleanup ensures minimal data retention

## Monitoring

Monitor the following metrics:

- Registration success/failure rates
- Token cleanup frequency
- Active token counts by platform
- API endpoint response times
- Error rates and types

## Troubleshooting

### Common Issues

1. **"Permission not granted"**

   - User denied notification permissions
   - Re-prompt or guide user to settings

2. **"Project ID not found"**

   - EAS configuration issue
   - Check `app.config.ts` or `eas.json`

3. **"Failed to register push token"**

   - Network connectivity issues
   - Backend API unavailable
   - Check logs for specific error details

4. **Duplicate tokens**
   - Multiple app instances running
   - Force re-registration to clean up

### Debug Mode

Enable debug logging by setting appropriate log levels in the application.
