import { Platform } from 'react-native';
import DeviceApps from 'react-native-device-apps';

export interface InstalledApp {
  packageName: string;
  appName: string;
  appIcon: string | null;
  platform: 'android' | 'ios';
}

export class InstalledAppsService {
  static async getInstalledApps(): Promise<InstalledApp[]> {
    if (Platform.OS === 'android') {
      try {
        const apps = await DeviceApps.getApps();
        
        return apps.map((app: any) => ({
          packageName: app.packageName,
          appName: app.name || app.packageName,
          appIcon: app.icon || null,
          platform: 'android' as const,
        }));
      } catch (error) {
        console.error('Failed to get installed apps:', error);
        return [];
      }
    } else if (Platform.OS === 'ios') {
      console.warn('iOS does not allow reading installed apps list');
      return [];
    }
    
    return [];
  }

  static async syncWithBackend(apps: InstalledApp[], apiClient: any): Promise<void> {
    try {
      await apiClient.post('/api/apps/sync', { apps });
    } catch (error) {
      console.error('Failed to sync apps with backend:', error);
      throw error;
    }
  }

  static getMockAppsForDemo(): InstalledApp[] {
    return [
      {
        packageName: 'com.instagram.android',
        appName: 'Instagram',
        appIcon: null,
        platform: 'android',
      },
      {
        packageName: 'com.spotify.music',
        appName: 'Spotify',
        appIcon: null,
        platform: 'android',
      },
      {
        packageName: 'com.whatsapp',
        appName: 'WhatsApp',
        appIcon: null,
        platform: 'android',
      },
      {
        packageName: 'com.twitter.android',
        appName: 'Twitter',
        appIcon: null,
        platform: 'android',
      },
    ];
  }
}
