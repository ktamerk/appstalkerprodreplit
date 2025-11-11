# Appstalker Mobile App

React Native mobile application for Appstalker - share your installed apps with followers.

## Features

- User authentication (login/register)
- View user profiles with installed apps
- Follow/unfollow users
- Send and accept friend requests
- Like profiles
- Real-time notifications via WebSocket
- Native access to device's installed apps list
- Privacy controls for app visibility

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- For iOS: macOS with Xcode installed
- For Android: Android Studio with Android SDK

### Installation

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update API endpoint in `src/config/api.ts` with your backend server URL

### Running the App

#### Development with Expo Go

1. Start the development server:
```bash
npm start
```

2. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

#### Running on Simulators/Emulators

```bash
# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android
```

## Project Structure

```
mobile/
├── src/
│   ├── screens/          # Screen components
│   │   ├── auth/         # Login, Register screens
│   │   ├── profile/      # Profile, Edit Profile
│   │   ├── feed/         # Home feed, Discover
│   │   ├── notifications/# Notifications screen
│   │   └── search/       # Search users
│   ├── components/       # Reusable components
│   │   ├── AppCard.tsx
│   │   ├── UserCard.tsx
│   │   └── NotificationItem.tsx
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API services
│   │   ├── api.ts        # API client
│   │   ├── auth.ts       # Auth service
│   │   ├── profile.ts    # Profile service
│   │   └── websocket.ts  # WebSocket service
│   ├── utils/            # Utility functions
│   │   └── appScanner.ts # Native app scanning
│   ├── types/            # TypeScript types
│   └── config/           # App configuration
├── App.tsx               # Root component
└── package.json
```

## Native Features

### Accessing Installed Apps

The app uses platform-specific APIs to access the list of installed applications:

**Android**: Uses `PackageManager` to get installed packages
**iOS**: Uses private APIs (requires jailbreak or special entitlements for App Store)

⚠️ **Note**: iOS restricts access to installed apps list. For production iOS app:
- Users must manually add apps they want to share
- Or use limited APIs that don't require special permissions

## Building for Production

### Android APK

```bash
expo build:android
```

### iOS IPA

```bash
expo build:ios
```

## Environment Variables

Create a `.env` file in the mobile directory:

```
API_URL=http://your-backend-url:5000
WS_URL=ws://your-backend-url:5000/ws
```

## Privacy & Permissions

The app requests the following permissions:

- **Internet Access**: Required for API communication
- **Package Query** (Android): To read installed apps list
- **Notifications**: For real-time app installation alerts

Users can control:
- Which apps are visible to others
- Whether their profile is private
- Who can follow them

## Contributing

This is part of the Appstalker platform developed by Smartinfo Corp.
