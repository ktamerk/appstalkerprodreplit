import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY_PREFIX = 'app_cache_';

interface CachedAppList {
  packageNames: string[];
  timestamp: number;
}

export const saveAppCache = async (userId: string, packageNames: string[]) => {
  try {
    const cache: CachedAppList = {
      packageNames,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(
      `${CACHE_KEY_PREFIX}${userId}`,
      JSON.stringify(cache)
    );
  } catch (error) {
    console.error('Error saving app cache:', error);
  }
};

export const getAppCache = async (userId: string): Promise<string[]> => {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${userId}`);
    if (!cached) {
      return [];
    }
    
    const cache: CachedAppList = JSON.parse(cached);
    return cache.packageNames;
  } catch (error) {
    console.error('Error getting app cache:', error);
    return [];
  }
};

export const detectNewApps = (
  currentApps: string[],
  cachedApps: string[]
): string[] => {
  if (cachedApps.length === 0) {
    // First time, no apps are "new"
    return [];
  }
  const cachedSet = new Set(cachedApps);
  return currentApps.filter(packageName => !cachedSet.has(packageName));
};

export const clearAppCache = async (userId: string) => {
  try {
    await AsyncStorage.removeItem(`${CACHE_KEY_PREFIX}${userId}`);
  } catch (error) {
    console.error('Error clearing app cache:', error);
  }
};
