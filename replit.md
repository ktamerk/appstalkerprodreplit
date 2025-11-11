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

## Recent Changes
- 2025-11-11: Complete Appstalker MVP implementation finished
- 2025-11-11: Backend API with all endpoints (auth, profile, apps, social, notifications)
- 2025-11-11: Database schema created and pushed to PostgreSQL
- 2025-11-11: React Native mobile app with all screens and navigation
- 2025-11-11: Security fixes: privacy controls, WebSocket timeout, SESSION_SECRET warning
- 2025-11-11: Web demo panel created for API testing
- 2025-11-11: Architect review completed - MVP PASSED all requirements

## Tech Stack
- Backend: Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL
- Mobile: React Native, React Navigation, AsyncStorage
- Real-time: WebSocket (ws library)
- Authentication: JWT tokens
- Database: PostgreSQL (Neon)

## User Preferences
None recorded yet.
