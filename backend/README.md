# Currency Converter Backend

Backend server for the Currency Converter app, handling push notifications, feedback, and version management.

## Features

- 📱 Push notification management
- 📝 User feedback collection
- 🔄 Version tracking
- 🧹 Automatic token cleanup
- 🔗 GitHub Actions integration

## Setup

### Prerequisites

- Node.js 16+ or Bun
- MongoDB database
- Environment variables configured

### Installation

```bash
# Using npm
npm install

# Using bun
bun install
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/currency-converter

# Server
PORT=3000
CORS_ORIGIN=http://localhost:3000

# Optional: For webhook security (future implementation)
WEBHOOK_SECRET=your-webhook-secret
```

### Running the Server

```bash
# Development mode with auto-reload
npm run dev
# or
bun run dev

# Production mode
npm start
# or
bun start
```

## API Endpoints

### Push Tokens

- `POST /api/push-tokens/register` - Register a new push token
- `GET /api/push-tokens/device/:deviceId` - Get tokens for a device
- `POST /api/push-tokens/deactivate` - Deactivate tokens
- `GET /api/push-tokens/active` - List all active tokens

### Notifications

- `POST /api/notifications/new-version` - Send new version notification
- `POST /api/notifications/webhook/new-build` - GitHub Actions webhook

### Other

- `POST /api/feedback` - Submit user feedback
- `GET /api/version` - Get app version info
- `GET /health` - Health check endpoint

## Push Notification Flow

Push notifications are **only sent for major releases** when triggered by GitHub Actions.

### Notification Timing

- **Major releases** (v1.0.0 → v2.0.0): ✅ Push notification sent
- **Minor releases** (v1.0.0 → v1.1.0): ❌ No notification
- **Patch releases** (v1.0.0 → v1.0.1): ❌ No notification

### Notification Content

- **Dynamic titles and bodies**: Custom notification content can be provided via API
- **Default fallbacks**: If no custom content provided, uses default templates based on build type
- **URL handling**: Custom download URLs can be included in notification data
- **GitHub Actions integration**: Workflow includes custom notification content for major releases
- **First app launch**: Token registered and cached locally + stored in database
- **Subsequent launches**: No registration, uses cached token
- **Token expiration**: Tokens are only deactivated after 1 year of inactivity
- **Duplicate prevention**:
  - Database checks for existing active tokens before creating new ones
  - Existing tokens get updated `lastUsed` timestamp instead of creating duplicates
  - MongoDB unique constraint prevents duplicate token entries
  - Old tokens for same device/platform are automatically deactivated

## Testing Push Notifications

### Manual Testing

```bash
# Send new version notification with custom content
curl -X POST http://localhost:3000/api/notifications/new-version \
  -H "Content-Type: application/json" \
  -d '{
    "version": "v2.0.0-test",
    "buildType": "major",
    "buildUrl": "https://github.com/test/repo/releases/tag/v2.0.0-test",
    "title": "🎉 Custom Title Here!",
    "body": "Custom notification body with your own message."
  }'

# Send with default content (no title/body specified)
curl -X POST http://localhost:3000/api/notifications/new-version \
  -H "Content-Type: application/json" \
  -d '{
    "version": "v2.0.0-test",
    "buildType": "major",
    "buildUrl": "https://github.com/test/repo/releases/tag/v2.0.0-test"
  }'
```

## GitHub Actions Integration

The backend automatically receives webhook calls from GitHub Actions when new builds are deployed. Configure the `BACKEND_URL` secret in your GitHub repository settings.

Example webhook payload:

```json
{
  "version": "v1.2.3",
  "buildType": "minor",
  "ref": "refs/tags/v1.2.3",
  "repository": "username/repo-name",
  "buildUrl": "https://github.com/username/repo-name/releases/tag/v1.2.3"
}
```

## Database Schema

### Push Tokens

```javascript
{
  pushToken: String,    // Expo push token
  deviceId: String,     // Unique device identifier
  platform: String,     // 'ios', 'android', or 'web'
  isActive: Boolean,    // Whether token is currently active
  lastUsed: Date,       // Last time token was accessed
  createdAt: Date,      // Token creation timestamp
  updatedAt: Date       // Last update timestamp
}
```

## Automatic Cleanup

- **Daily cleanup**: Runs at 2 AM to remove tokens inactive for 1+ years
- **Invalid token cleanup**: Automatically deactivates tokens that fail to receive notifications
- **Device token rotation**: Old tokens are deactivated when new ones are registered for the same device

## Monitoring

Monitor these metrics:

- Registration success/failure rates
- Notification delivery rates
- Active token counts by platform
- API response times
- Database cleanup frequency

## Deployment

### Using PM2 (Recommended for production)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start src/index.js --name "currency-converter-backend"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **CORS Configuration**: Restrict CORS origins in production
3. **Rate Limiting**: Consider implementing rate limiting for public endpoints
4. **Token Validation**: All push tokens are validated before sending
5. **Database Security**: Use MongoDB authentication in production

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**

   - Check `MONGODB_URI` environment variable
   - Ensure MongoDB is running
   - Verify network connectivity

2. **Push Notifications Not Sending**

   - Check if tokens are valid Expo push tokens
   - Verify Expo's push service is accessible
   - Check server logs for specific errors

3. **GitHub Webhook Not Working**
   - Verify `BACKEND_URL` secret is correct
   - Check if server is accessible from GitHub
   - Review GitHub Actions logs

### Debug Mode

Set `NODE_ENV=development` to enable detailed logging and error messages.
