import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, TextInput, Image } from 'react-native';
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
  const [filteredFollowing, setFilteredFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newApps, setNewApps] = useState<NewApp[]>([]);
  const [showNewAppPrompt, setShowNewAppPrompt] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFeed();
    checkForNewApps();
  }, []);

  const loadFeed = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.SOCIAL.FOLLOWING);
      const followingUsers = response.data.following;
      
      const usersWithApps = await Promise.all(
        followingUsers.map(async (user: any) => {
          try {
            const profileResponse = await api.get(API_ENDPOINTS.PROFILE.USER(user.username));
            return {
              ...user,
              apps: profileResponse.data.apps || [],
              avatarUrl: profileResponse.data.profile?.avatarUrl,
            };
          } catch (error: any) {
            if (error.response?.status === 403) {
              return {
                ...user,
                apps: [],
                isPrivate: true,
              };
            }
            return {
              ...user,
              apps: [],
            };
          }
        })
      );
      
      setFollowing(usersWithApps);
      setFilteredFollowing(usersWithApps);
    } catch (error) {
      console.error('Load feed error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredFollowing(following);
      return;
    }
    
    const filtered = following.filter((user: any) => 
      user.displayName.toLowerCase().includes(query.toLowerCase()) ||
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.apps.some((app: any) => app.appName.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredFollowing(filtered);
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
      <View style={styles.userHeader}>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.displayName[0].toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.displayName}>{item.displayName}</Text>
          <Text style={styles.username}>@{item.username}</Text>
        </View>
      </View>
      
      {item.apps && item.apps.length > 0 && (
        <View style={styles.appsContainer}>
          <Text style={styles.appsLabel}>📱 {item.apps.length} apps installed</Text>
          <View style={styles.appsList}>
            {item.apps.slice(0, 4).map((app: any, index: number) => (
              <View key={app.id || index} style={styles.miniApp}>
                {app.appIcon ? (
                  <Image source={{ uri: app.appIcon }} style={styles.miniAppIcon} />
                ) : (
                  <View style={styles.miniAppIconPlaceholder}>
                    <Text style={styles.miniAppIconText}>{app.appName[0]}</Text>
                  </View>
                )}
                <Text style={styles.miniAppName} numberOfLines={1}>
                  {app.appName}
                </Text>
              </View>
            ))}
            {item.apps.length > 4 && (
              <View style={styles.miniApp}>
                <View style={styles.moreApps}>
                  <Text style={styles.moreAppsText}>+{item.apps.length - 4}</Text>
                </View>
                <Text style={styles.miniAppName}>more</Text>
              </View>
            )}
          </View>
        </View>
      )}
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
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search people or apps..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={filteredFollowing}
        renderItem={renderUser}
        keyExtractor={(item: any) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No results found' : "You're not following anyone yet"}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search' : 'Discover people and see what apps they use'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Search')}
              >
                <Text style={styles.buttonText}>Discover People</Text>
              </TouchableOpacity>
            )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  clearIcon: {
    fontSize: 20,
    color: '#999',
    padding: 5,
  },
  userCard: {
    padding: 16,
    backgroundColor: '#fff',
    marginVertical: 6,
    marginHorizontal: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#a8b5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
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
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
  appsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  appsLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    fontWeight: '500',
  },
  appsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  miniApp: {
    alignItems: 'center',
    width: 64,
  },
  miniAppIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginBottom: 4,
  },
  miniAppIconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#d4a5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  miniAppIconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  miniAppName: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  moreApps: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  moreAppsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#a8b5ff',
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 32,
    shadowColor: '#a8b5ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
