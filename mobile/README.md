# Appstalker Mobile App

React Native mobile application for Appstalker - share your installed apps with followers.

## Features

- ✅ User authentication (login/register)
- ✅ View user profiles with installed apps
- ✅ Follow/unfollow users
- ✅ Send and accept friend requests
- ✅ Like profiles
- ✅ Real-time notifications via WebSocket
- ✅ **Native access to device's installed apps list with real app icons**
- ✅ Privacy controls for app visibility

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

## App Icons Feature 🎨

### How It Works

The app automatically retrieves **real application icons** from your device:

**Android:**
- Uses PackageManager API to get installed apps
- Converts app icons to Base64 format
- Displays actual app logos (WhatsApp, Instagram, etc.)

**iOS:**
- Due to App Store restrictions, users manually add apps
- Optional: Use app name/package to fetch icons from external sources

### Icon Display

When viewing a profile:
```typescript
// If app has an icon (from native module)
<Image source={{ uri: item.appIcon }} />

// Fallback to first letter
<View><Text>{item.appName[0]}</Text></View>
```

Icons are:
- 40x40 pixels
- Rounded corners (8px)
- Cached for performance
- Loaded from Base64 data URI

## Project Structure

```
mobile/
├── android/
│   └── app/src/main/java/com/appstalker/
│       └── AppIconModule.java    # Native module for Android icons
├── src/
│   ├── screens/          # Screen components
│   │   ├── auth/         # Login, Register screens
│   │   ├── profile/      # Profile, Edit Profile
│   │   ├── feed/         # Home feed, Discover
│   │   ├── notifications/# Notifications screen
│   │   └── search/       # Search users
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API services
│   │   ├── api.ts        # API client
│   │   ├── auth.ts       # Auth service
│   │   ├── profile.ts    # Profile service
│   │   └── websocket.ts  # WebSocket service
│   ├── utils/            # Utility functions
│   │   └── appScanner.ts # Native app scanning with icons
│   ├── types/            # TypeScript types
│   └── config/           # App configuration
├── App.tsx               # Root component
└── package.json
```

## Native Features

### Accessing Installed Apps with Icons

**Android Implementation:**
```java
// AppIconModule.java
- PackageManager to get installed apps
- Convert Drawable icons to Base64 PNG
- Return app list with icon data URIs
```

**React Native Usage:**
```typescript
import { getInstalledApps } from './utils/appScanner';

const apps = await getInstalledApps();
// Returns: [{ packageName, appName, appIcon: "data:image/png;base64,..." }]
```

### Icon Formats

- **Android**: Base64 encoded PNG (`data:image/png;base64,iVBORw0KG...`)
- **iOS**: External URL or fallback to initials
- **Fallback**: First letter of app name in colored circle

## Building for Production

### Android APK

```bash
expo build:android
```

The app will include:
- Native module for reading installed apps
- App icon extraction functionality
- Optimized icon caching

### iOS IPA

```bash
expo build:ios
```

⚠️ **Note**: iOS restricts access to installed apps list. For production:
- Users must manually add apps they want to share
- Alternative: Use third-party app database APIs

## Environment Variables

Create a `.env` file in the mobile directory:

```
API_URL=http://your-backend-url:5000
WS_URL=ws://your-backend-url:5000/ws
```

## Privacy & Permissions

The app requests the following permissions:

- **Internet Access**: Required for API communication
- **Package Query** (Android): To read installed apps list and icons
- **Notifications**: For real-time app installation alerts

Users can control:
- Which apps are visible to others
- Whether their profile is private
- Who can follow them

## Technical Details

### App Icon Size & Format
- Size: 40x40 dp (density-independent pixels)
- Format: PNG with transparency
- Encoding: Base64 data URI
- Compression: 100% quality for clarity

### Performance Optimization
- Icons loaded asynchronously
- Base64 cached in app state
- Lazy loading for large app lists
- Image component with caching enabled

## Troubleshooting

**Icons not showing:**
1. Check Android permissions in AndroidManifest.xml
2. Verify native module is linked correctly
3. Clear app cache and rebuild

**iOS icons missing:**
- Expected behavior due to platform restrictions
- Use fallback (first letter) or external icon sources

## Contributing

This is part of the Appstalker platform developed by Smartinfo Corp.

For questions or issues, please contact the development team.
