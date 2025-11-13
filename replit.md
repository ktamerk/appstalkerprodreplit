# Appstalker

## Overview
Appstalker is a cross-platform mobile social networking application that allows users to share which applications they have installed on their phones with their followers. Users can follow others, see their installed apps in real-time, send friend requests, like profiles, and receive notifications when people they follow install new apps.

## Purpose
- Allow users to share their installed applications with followers (with permission)
- Enable real-time notifications when followed users install new apps
- Build a social network around app discovery and sharing
- Support both Android and iOS platforms

## Project Architecture

### Backend (Node.js/Express/TypeScript)
- RESTful API for user management, authentication, profiles, follows, likes
- WebSocket server for real-time notifications
- PostgreSQL database with Drizzle ORM
- JWT-based authentication
- Runs on port 5000

### Mobile App (React Native)
- Cross-platform mobile application for iOS and Android
- Native modules to access installed apps list
- Real-time notifications via WebSocket
- Social features: profiles, following, likes, friend requests

### Database Schema
- Users: authentication and basic info
- Profiles: user profiles with bio, avatar
- InstalledApps: apps currently installed on user devices
- Follows: user following relationships
- FriendRequests: pending friend requests
- Likes: likes on profiles
- Notifications: real-time notifications for app installations and social actions

## Deployment & Setup Files
- **DEPLOYMENT_GUIDE.md** - Tam deployment guide (GitHub + Android Emulator)
- **DATABASE_DEPLOYMENT.md** - Database yönetimi ve seçenekleri (Replit vs Local)
- **QUICK_COMMANDS.sh** - Hızlı komut referansı
- **WINDOWS_SETUP.md** - Windows kullanıcıları için özel kurulum

## Recent Changes
- 2025-11-13: **Premium Apple HIG UI/UX Redesign** - Complete overhaul with Apple Human Interface Guidelines:
  - **Feed Screen**: Premium cards (shadowRadius 12, padding 20px), circular mini app icons (54x54, borderRadius 27), larger avatars (56x56 with #FFD369 border), CTA buttons ("View Profile", "See Apps"), rounded pill search (borderRadius 28)
  - **Notifications Screen**: Type-based icons (👤📱❤️🤝), dynamic color accents (#6C63FF follow, #FFD369 installed, #FF6B9D liked, #4ECDC4 friend), circular badges (48x48), dynamic unread borders, relative time ("2m ago"), premium "Mark All Read" button
  - **Profile Screen**: Circular app icons (56x56, borderRadius 28), premium app cards with shadows and borders, enhanced section styling
  - **React Native Compatibility**: Removed all `gap` properties, using marginRight/marginLeft for proper spacing
- 2025-11-13: **Modern UI/UX Redesign** - Color palette and layout overhaul:
  - **Color Scheme**: Updated to modern palette (#6C63FF primary, #F0F2FF background, #FFD369 accent, #1A1A1A text)
  - **Profile Screen**: Compact header with avatar + stats side-by-side, follower counts formatted (1.2K style), #FFD369 avatar borders
  - **Package Names**: Hidden from Profile and Feed views (only show app names), kept in ManageApps for user clarity
  - **Consistent Styling**: All screens (Login, Register, Feed, Profile, Settings, Notifications, Search) updated with new palette
- 2025-11-13: Major UI/UX improvements across all mobile screens
- 2025-11-13: Backend: GET /api/profile/liked endpoint for retrieving liked profiles
- 2025-11-11: Complete Appstalker MVP implementation finished
- 2025-11-11: Backend API with all endpoints (auth, profile, apps, social, notifications)
- 2025-11-11: Database schema created and pushed to PostgreSQL
- 2025-11-11: React Native mobile app with all screens and navigation
- 2025-11-11: Security fixes: privacy controls, WebSocket timeout, SESSION_SECRET warning
- 2025-11-11: Web demo panel created for API testing
- 2025-11-11: Architect review completed - MVP PASSED all requirements
- 2025-11-11: Translated all UI text to English (web demo and mobile screens)
- 2025-11-11: Added profile photo upload functionality with backend endpoint and avatar display
- 2025-11-11: Implemented app visibility selection feature:
  - Users can choose which installed apps to show on profile
  - New app detection prompts user when new apps are installed
  - ManageAppsScreen for controlling app visibility
  - AsyncStorage caching for persistent app selections
  - Bulk visibility updates with follower notifications only for visible apps

## Tech Stack
- Backend: Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL
- Mobile: React Native, React Navigation, AsyncStorage
- Real-time: WebSocket (ws library)
- Authentication: JWT tokens
- Database: PostgreSQL (Neon)

## User Preferences
None recorded yet.
