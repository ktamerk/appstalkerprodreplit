import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export interface InstalledApp {
  packageName: string;
  appName: string;
  appIcon?: string;
  platform: 'android' | 'ios';
}

export const getInstalledApps = async (): Promise<InstalledApp[]> => {
  if (Platform.OS === 'android') {
    return await getAndroidInstalledApps();
  } else if (Platform.OS === 'ios') {
    return await getIOSInstalledApps();
  }
  return [];
};

const getAndroidInstalledApps = async (): Promise<InstalledApp[]> => {
  try {
    const apps = await DeviceInfo.getInstalledApplications();
    
    return apps.map((app: any) => ({
      packageName: app.packageName || app.bundleId,
      appName: app.appName || app.displayName || 'Unknown',
      appIcon: app.icon || undefined,
      platform: 'android' as const,
    }));
  } catch (error) {
    console.error('Error getting Android apps:', error);
    return [];
  }
};

const getIOSInstalledApps = async (): Promise<InstalledApp[]> => {
  console.warn('iOS restricts access to installed apps list. Users must manually add apps.');
  
  return [];
};

export const syncAppsWithServer = async (
  apps: InstalledApp[],
  apiClient: any
) => {
  try {
    const response = await apiClient.post('/api/apps/sync', { apps });
    return response.data;
  } catch (error) {
    console.error('Error syncing apps:', error);
    throw error;
  }
};
