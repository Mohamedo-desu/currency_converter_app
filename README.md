# Convertly App

A modern currency converter application built with React Native and Expo, featuring real-time exchange rates, offline functionality, and a beautiful user interface. Convert between any currencies with ease, even without an internet connection.

## Features

- **Real-time Exchange Rates**: Get the latest exchange rates from the ExchangeRate-API
- **Offline Support**:
  - Background task updates every 15 minutes
  - Cached exchange rates and currency data
  - Full functionality without internet connection
- **Smart Currency Management**:
  - Automatic rate updates
  - Currency data caching for 3 days
  - Last used currencies remembered
  - Intelligent currency flag display system
  - Support for special currency codes (e.g., BTC, ETH)
- **User Experience**:
  - Dark/Light theme support
  - Responsive design for all screen sizes
  - Quick currency swap functionality
  - Searchable currency list with flags
  - Smooth currency selection animations
  - History tracking of currency conversions
  - Beautiful flag display with proper scaling
- **Performance**:
  - Fast MMKV storage for offline data
  - Optimized list rendering with FlashList
  - Smooth animations with Reanimated
  - Efficient currency data caching
- **Error Tracking**: Sentry integration for monitoring and debugging
- **Quick Actions**: Support for app shortcuts

## Tech Stack

### Frontend

- **React Native** (v0.79.2) with **Expo** (v53.0.8)
- **TypeScript** - Type-safe JavaScript
- **Expo Router** - File-based navigation system
- **React Native Reanimated** - Smooth animations
- **React Native Gesture Handler** - Gesture management
- **React Native MMKV** - Fast key-value storage for offline data
- **FlashList** - High-performance currency list rendering
- **Expo Updates** - Over-the-air updates
- **Expo Background Task** - Background data updates
- **Expo Task Manager** - Background task management
- **React Native SVG** - SVG support for currency flags
- **React Native Fast Image** - Optimized image loading

### Development Tools

- **Jest** - Testing framework
- **ESLint & Prettier** - Code linting and formatting
- **TypeScript** - Static type checking
- **Sentry** - Error tracking and monitoring
- **EAS** - Expo Application Services for builds

## Getting Started

### Prerequisites

- Node.js
- Bun package manager (recommended) or npm
- Expo CLI
- EAS CLI (for builds and updates)

### Installation

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd convertly_app
   ```

2. Install dependencies

   ```bash
   bun install
   ```

3. Set up environment variables

   ```bash
   # Create a .env file with your API keys
   EXPO_PUBLIC_RATES_API_URL=your_exchange_rate_api_key
   EXPO_PUBLIC_VEXO_KEY=your_vexo_analytics_key
   ```

4. Start the development server
   ```bash
   bunx expo start
   ```

## Available Scripts

- `bun run start` - Start the Expo development server
- `bun run android` - Run on Android device/emulator
- `bun run ios` - Run on iOS simulator
- `bun run offline` - Start in offline mode
- `bun run build:android` - Build Android app for preview
- `bun run release:android` - Run in release mode on Android
- `bun run release:ios` - Run in release mode on iOS
- `bun run test` - Run tests
- `bun run lint` - Lint the code
- `bun run format` - Format the code
- `bun run upgrade` - Upgrade Expo and fix dependencies

## Offline Functionality

The app provides full offline support through:

- **Background Task**: Updates exchange rates every 15 minutes
- **Data Caching**:
  - Exchange rates cached for 3 days
  - Currency list stored locally
  - Last used currencies and amounts remembered
- **MMKV Storage**: Fast and secure local storage
- **Error Handling**: Graceful fallback to cached data

## Development

The project uses modern development practices:

- TypeScript for type safety
- ESLint and Prettier for code quality
- Jest for testing
- Sentry for error tracking
- EAS for builds and updates

## Error Tracking

The app uses Sentry for error tracking and monitoring:

- Automatic error reporting
- Performance monitoring
- Source map uploading for better error tracking

## Currency Handling

The app provides sophisticated currency handling:

- **Flag System**:
  - Automatic flag generation from currency codes
  - Support for special currency codes (crypto, etc.)
  - Proper flag scaling and display
  - Fallback handling for missing flags
- **Currency Selection**:
  - Quick currency swap functionality
  - Searchable currency list with flags
  - Last used currencies remembered
  - Smooth selection animations
- **History Tracking**:
  - Conversion history with timestamps
  - Easy access to previous conversions
  - Automatic history cleanup

## License

[MIT License](LICENSE)
