import { Platform } from 'react-native';

// __DEV__ global değişkeni TypeScript için
declare const __DEV__: boolean;

// Android Emulator için 10.0.2.2, iOS Simulator için localhost kullan
const getBaseUrl = () => {
  if (__DEV__) {
    // Android emulator için
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000';
    }
    // iOS simulator için
    return 'http://localhost:5000';
  }
  // Production için (deploy edildiğinde)
  return 'https://your-production-url.com';
};

const getWsUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'ws://10.0.2.2:5000/ws';
    }
    return 'ws://localhost:5000/ws';
  }
  return 'wss://your-production-url.com/ws';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  WS_URL: getWsUrl(),
};

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
  },
  PROFILE: {
    ME: '/api/profile/me',
    USER: (username: string) => `/api/profile/${username}`,
    UPDATE: '/api/profile/me',
    SEARCH: (query: string) => `/api/profile/search/${query}`,
    LIKED: '/api/profile/liked',
  },
  APPS: {
    SYNC: '/api/apps/sync',
    ME: '/api/apps/me',
    MY_APPS: '/api/apps/me',
    VISIBILITY: (appId: string) => `/api/apps/${appId}/visibility`,
    VISIBILITY_BULK: '/api/apps/visibility/bulk',
  },
  SOCIAL: {
    FOLLOW: (userId: string) => `/api/social/follow/${userId}`,
    UNFOLLOW: (userId: string) => `/api/social/follow/${userId}`,
    FOLLOWERS: '/api/social/followers',
    FOLLOWING: '/api/social/following',
    FRIEND_REQUEST: (userId: string) => `/api/social/friend-request/${userId}`,
    UPDATE_REQUEST: (requestId: string) => `/api/social/friend-request/${requestId}`,
    FRIEND_REQUESTS: '/api/social/friend-requests',
    LIKE: (profileId: string) => `/api/social/like/${profileId}`,
    UNLIKE: (profileId: string) => `/api/social/like/${profileId}`,
  },
  NOTIFICATIONS: {
    ALL: '/api/notifications',
    MARK_READ: (id: string) => `/api/notifications/${id}/read`,
    READ_ALL: '/api/notifications/read-all',
  },
};
