# Deeplink Implementation

This document explains the optimized deeplink implementation in the Currency Converter app.

## Key Features

### ✅ Performance Optimized

- No infinite navigation loops
- Single-pass parameter processing
- Efficient route change detection
- Minimal re-renders

### ✅ Web-to-App Redirection

- Universal Links (iOS) and App Links (Android) configured
- Web URLs automatically try to open the native app
- Graceful fallback to web version
- Smart device detection

### ✅ Robust Error Handling

- Graceful handling of malformed URLs
- Fallback behaviors for unsupported parameters
- No crashes on invalid deeplinks

## Implementation Details

### Hook Architecture

The `useDeepLinking` hook uses:

- `useSegments()` to detect current route and prevent unnecessary navigation
- `useRef()` to track initialization state
- `useCallback()` for memoized handlers
- Delayed initial URL processing to avoid conflicts

### Parameter Processing

The main screen processes deeplink parameters:

- Only once when currencies are loaded
- Uses `currencies.length` dependency to avoid re-processing
- Direct state updates without navigation loops

### Web Integration

- Web URLs with parameters: `https://convertly.expo.app?from=USD&to=EUR&amount=100`
- Automatic app detection and opening
- App Store/Play Store fallbacks for uninstalled apps
- Universal Links and App Links configuration

## Usage Examples

### Share a Conversion

```typescript
import { shareConversion } from "@/utils/shareUtils";

await shareConversion(
  fromCurrency,
  toCurrency,
  amount,
  convertedAmount,
  exchangeRate,
  downloadUrl
);
```

### Generate Deeplinks

```typescript
import { useDeepLinking } from "@/hooks/useDeepLinking";

const { generateConversionDeepLink } = useDeepLinking();
const link = generateConversionDeepLink("USD", "EUR", "100");
```

## Configuration Files

### iOS Universal Links

- `public/.well-known/apple-app-site-association`
- Associated domains in `app.config.ts`

### Android App Links

- `public/.well-known/assetlinks.json`
- Intent filters in `app.config.ts`

### Web Redirection

- `public/app-redirect.html` - Smart app detection page
- Automatic deeplink generation from URL parameters

## Performance Considerations

- ✅ No infinite loops
- ✅ Single parameter processing
- ✅ Efficient route detection
- ✅ Minimal memory footprint
- ✅ Fast initialization
