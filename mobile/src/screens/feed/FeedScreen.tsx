import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, TextInput, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';
import { getInstalledApps, syncAppsWithServer } from '../../utils/appScanner';
import { getAppCache, saveAppCache } from '../../utils/appCache';
import NewAppPrompt from '../../components/NewAppPrompt';
import { getImageSource } from '../../utils/iconHelpers';

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
    <View style={styles.userCard}>
      <TouchableOpacity
        style={styles.userHeader}
        onPress={() => navigation.navigate('Profile', { username: item.username })}
      >
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
      </TouchableOpacity>
      
      {item.apps && item.apps.length > 0 && (
        <>
          <View style={styles.appsContainer}>
            <Text style={styles.appsLabel}>📱 {item.apps.length} apps</Text>
            <View style={styles.appsList}>
              {item.apps.slice(0, 4).map((app: any, index: number) => {
                const iconSource = getImageSource(app.appIcon);
                return (
                  <View key={app.id || index} style={styles.miniAppBubble}>
                    {iconSource ? (
                      <Image source={{ uri: iconSource }} style={styles.miniAppIcon} />
                    ) : (
                      <View style={styles.miniAppIconPlaceholder}>
                        <Text style={styles.miniAppIconText}>{app.appName[0]}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
              {item.apps.length > 4 && (
                <View style={styles.miniAppBubble}>
                  <View style={styles.moreAppsCircle}>
                    <Text style={styles.moreAppsText}>+{item.apps.length - 4}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.ctaButtons}>
            <TouchableOpacity
              style={styles.ctaButtonSecondary}
              onPress={() => navigation.navigate('Profile', { username: item.username })}
            >
              <Text style={styles.ctaTextSecondary}>View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ctaButtonPrimary}
              onPress={() => navigation.navigate('Profile', { username: item.username })}
            >
              <Text style={styles.ctaTextPrimary}>See Apps</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      
      {(!item.apps || item.apps.length === 0) && (
        <View style={styles.emptyAppsContainer}>
          <Text style={styles.emptyAppsText}>No apps shared yet</Text>
          <TouchableOpacity
            style={styles.ctaButtonSecondary}
            onPress={() => navigation.navigate('Profile', { username: item.username })}
          >
            <Text style={styles.ctaTextSecondary}>View Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
    backgroundColor: '#F0F2FF',
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 28,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    padding: 0,
  },
  clearIcon: {
    fontSize: 20,
    color: '#999',
    padding: 5,
  },
  userCard: {
    padding: 20,
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#FFD369',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#FFD369',
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
  appsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 14,
    marginTop: 4,
  },
  appsLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    fontWeight: '600',
  },
  appsList: {
    flexDirection: 'row',
  },
  miniAppBubble: {
    alignItems: 'center',
    marginRight: 12,
  },
  miniAppIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  miniAppIconPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  miniAppIconText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  moreAppsCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6C63FF',
    borderStyle: 'dashed',
  },
  moreAppsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  ctaButtons: {
    flexDirection: 'row',
    marginTop: 14,
  },
  ctaButtonPrimary: {
    flex: 1,
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    marginLeft: 5,
  },
  ctaButtonSecondary: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#6C63FF',
    marginRight: 5,
  },
  ctaTextPrimary: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  ctaTextSecondary: {
    color: '#6C63FF',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyAppsContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  emptyAppsText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
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
    color: '#1A1A1A',
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
    backgroundColor: '#FFD369',
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 32,
    shadowColor: '#FFD369',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
