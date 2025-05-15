# Navigation

## Overview

The app uses a custom navigation system implemented in `RootLayout.tsx`. It manages screen transitions and maintains navigation state using React's useState and useEffect hooks.

## Screen Structure

- Converter (Main Screen)
- Settings
- History
- Help

## Navigation Implementation

### RootLayout

The main navigation container that:

- Manages the current screen state
- Handles screen transitions
- Persists the last visited screen
- Provides navigation methods to child components

```typescript
// Navigation callback
const navigate = (screen: Screen) => {
  setCurrentScreen(screen);
};
```

### Back Button Handling

#### Hardware Back Button

- Implemented using `BackHandler` from React Native
- Different behavior based on current screen:
  - Converter Screen: Double-tap to exit with toast notification
  - Other Screens: Navigate to previous screen

```typescript
// Example of back button handler in Converter screen
useEffect(() => {
  const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
    const currentTime = new Date().getTime();
    if (currentTime - lastBackPress < 2000) {
      BackHandler.exitApp();
      return true;
    }
    ToastAndroid.show("Press back again to exit", ToastAndroid.SHORT);
    setLastBackPress(currentTime);
    return true;
  });
  return () => backHandler.remove();
}, [lastBackPress]);
```

#### UI Back Button

- Present in the header of each screen
- Navigates to the appropriate previous screen:
  - Settings → Converter
  - History → Settings
  - Help → Converter

## Navigation Flow

### Converter Screen

- Entry point of the app
- Access to Settings via header icon
- Double-tap back to exit

### Settings Screen

- Accessible from Converter screen
- Contains links to History
- Back button returns to Converter

### History Screen

- Accessible from Settings screen
- Shows conversion history
- Back button returns to Settings

### Help Screen

- Accessible from footer
- Contains support options
- Back button returns to Converter

## State Persistence

- Last visited screen is stored in secure storage
- Restored on app launch
- Helps maintain navigation context

## Best Practices

1. Always provide a way to go back
2. Use consistent navigation patterns
3. Handle hardware back button appropriately
4. Maintain navigation state
5. Provide visual feedback for navigation actions
