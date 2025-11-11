import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Image } from 'react-native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';

export default function ProfileScreen({ route, navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = route?.params?.username;

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      let response;
      if (username) {
        response = await api.get(API_ENDPOINTS.PROFILE.USER(username));
      } else {
        response = await api.get(API_ENDPOINTS.PROFILE.ME);
      }
      
      setProfile(response.data.profile);
      setApps(response.data.apps || []);
    } catch (error) {
      console.error('Load profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderApp = ({ item }: any) => (
    <View style={styles.appCard}>
      {item.appIcon ? (
        <Image
          source={{ uri: item.appIcon }}
          style={styles.appIconImage}
        />
      ) : (
        <View style={styles.appIcon}>
          <Text style={styles.appIconText}>{item.appName[0]}</Text>
        </View>
      )}
      <View style={styles.appInfo}>
        <Text style={styles.appName}>{item.appName}</Text>
        <Text style={styles.packageName}>{item.packageName}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centerContainer}>
        <Text>Profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {profile.avatarUrl ? (
          <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.displayName[0].toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.displayName}>{profile.displayName}</Text>
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.followersCount || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.followingCount || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{apps.length}</Text>
            <Text style={styles.statLabel}>Apps</Text>
          </View>
        </View>

        {!username && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Installed Apps</Text>
        {apps.length > 0 ? (
          <FlatList
            data={apps}
            renderItem={renderApp}
            keyExtractor={(item: any) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>
            {profile.showApps ? 'No apps to display' : 'Apps are hidden'}
          </Text>
        )}
      </View>
    </ScrollView>
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#a8b5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  stats: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 15,
  },
  stat: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  editButton: {
    backgroundColor: '#a8b5ff',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  appCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#a8b5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appIconImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  appIconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  packageName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    padding: 20,
  },
});
