# Architecture

## Overview

The Currency Converter app follows a component-based architecture with a focus on maintainability, scalability, and performance. The architecture is built using React Native and TypeScript.

## Directory Structure

```
src/
├── components/         # Reusable UI components
├── constants/         # App-wide constants
├── context/          # React Context providers
├── hooks/            # Custom React hooks
├── screens/          # Screen components
├── services/         # API and business logic
├── store/            # State management
├── styles/           # Component styles
└── types/            # TypeScript type definitions
```

## Key Components

### Components

- `AuthHeader`: Navigation header component
- `CurrencySelector`: Currency selection component
- `CustomText`: Typography component
- `PrivacyTerms`: Footer component
- `SwapButton`: Currency swap button

### Screens

- `CurrencyConverterScreen`: Main conversion screen
- `SettingsScreen`: App settings
- `HistoryScreen`: Conversion history
- `HelpScreen`: Support and feedback

### Services

- `currencyService`: Currency data and conversion
- `feedbackService`: User feedback handling
- `storage`: Secure data persistence

## State Management

### Local State

- Uses React's useState and useEffect
- Component-level state management
- Form handling and validation

### Context

- Theme management (light/dark mode)
- App-wide settings
- Version information

### Storage

- Secure storage for sensitive data
- Local storage for preferences
- History management

## Data Flow

### Currency Conversion

1. User input triggers conversion
2. Debounced calculation
3. Update UI with results
4. Store in history

### Theme Management

1. Theme context provider
2. Theme toggle in settings
3. Persist theme preference
4. Apply theme to components

### History Management

1. Track conversions
2. Store in secure storage
3. Clean up old entries
4. Display in history screen

## API Integration

### Currency API

- Fetch exchange rates
- Get currency list
- Handle API errors
- Cache responses

### Feedback API

- Submit user feedback
- Handle offline submissions
- Error handling
- Retry mechanism

## Performance Considerations

### Optimization Techniques

- Debounced calculations
- Memoized components
- Efficient re-renders
- Background tasks

### Caching Strategy

- Local storage for rates
- Periodic updates
- Offline support
- Data validation

## Security

### Data Protection

- Secure storage
- API key management
- Input validation
- Error handling

### Best Practices

- Type safety with TypeScript
- Component isolation
- Error boundaries
- Proper cleanup

## Testing Strategy

### Unit Tests

- Component testing
- Service testing
- Utility functions

### Integration Tests

- Screen navigation
- Data flow
- API integration

### E2E Tests

- User flows
- Critical paths
- Edge cases
