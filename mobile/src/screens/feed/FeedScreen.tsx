import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';
import { getInstalledApps, syncAppsWithServer } from '../../utils/appScanner';
import { getAppCache, saveAppCache } from '../../utils/appCache';
import NewAppPrompt from '../../components/NewAppPrompt';

interface NewApp {
  packageName: string;
  appName: string;
  appIcon?: string;
  platform: string;
}

export default function FeedScreen({ navigation }: any) {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newApps, setNewApps] = useState<NewApp[]>([]);
  const [showNewAppPrompt, setShowNewAppPrompt] = useState(false);

  useEffect(() => {
    loadFeed();
    checkForNewApps();
  }, []);

  const loadFeed = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.SOCIAL.FOLLOWING);
      setFollowing(response.data.following);
    } catch (error) {
      console.error('Load feed error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFeed();
    checkForNewApps();
  };

  const checkForNewApps = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      // Load cached app list
      const cachedPackageNames = await getAppCache(userId);
      
      // Get currently installed apps
      const installedApps = await getInstalledApps();
      const currentPackageNames = installedApps.map(app => app.packageName);

      // Detect new apps before sync (client-side detection)
      const newPackageNames = currentPackageNames.filter(
        pkg => !cachedPackageNames.includes(pkg)
      );

      // Sync with server
      const syncResponse = await syncAppsWithServer(installedApps, api);

      // Show prompt if new apps detected
      if (syncResponse.newApps && syncResponse.newApps.length > 0) {
        setNewApps(syncResponse.newApps);
        setShowNewAppPrompt(true);
      }

      // Update cache with current state
      await saveAppCache(userId, currentPackageNames);
    } catch (error) {
      console.error('Check new apps error:', error);
    }
  };

  const handleNewAppsConfirm = async (selectedPackageNames: string[]) => {
    try {
      if (selectedPackageNames.length > 0) {
        await api.post(API_ENDPOINTS.APPS.VISIBILITY_BULK, {
          updates: selectedPackageNames.map(packageName => ({
            packageName,
            isVisible: true,
          })),
        });
      }
      
      setShowNewAppPrompt(false);
      setNewApps([]);
    } catch (error) {
      console.error('Update new apps visibility error:', error);
    }
  };

  const handleNewAppsDismiss = () => {
    setShowNewAppPrompt(false);
    setNewApps([]);
  };

  const renderUser = ({ item }: any) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => navigation.navigate('Profile', { username: item.username })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.displayName[0].toUpperCase()}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.displayName}>{item.displayName}</Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={following}
        renderItem={renderUser}
        keyExtractor={(item: any) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You're not following anyone yet</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={styles.buttonText}>Find People to Follow</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <NewAppPrompt
        visible={showNewAppPrompt}
        apps={newApps}
        onConfirm={handleNewAppsConfirm}
        onDismiss={handleNewAppsDismiss}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCard: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#a8b5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#a8b5ff',
    borderRadius: 8,
    padding: 15,
    paddingHorizontal: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
