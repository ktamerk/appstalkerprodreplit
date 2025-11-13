import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Image } from 'react-native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';
import { getImageSource } from '../../utils/iconHelpers';

const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

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

  const renderApp = ({ item }: any) => {
    const iconSource = getImageSource(item.appIcon);
    return (
      <View style={styles.appCard}>
        <View style={styles.appIconWrapper}>
          {iconSource ? (
            <Image
              source={{ uri: iconSource }}
              style={styles.appIconImage}
            />
          ) : (
            <View style={styles.appIcon}>
              <Text style={styles.appIconText}>{item.appName[0]}</Text>
            </View>
          )}
        </View>
        <View style={styles.appInfo}>
          <Text style={styles.appName}>{item.appName}</Text>
        </View>
      </View>
    );
  };

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
        <View style={styles.avatarRow}>
          {profile.avatarUrl ? (
            <View style={styles.avatarContainer}>
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
            </View>
          ) : (
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, styles.gradientAvatar]}>
                <Text style={styles.avatarText}>
                  {profile.displayName[0].toUpperCase()}
                </Text>
              </View>
            </View>
          )}
          
          <View style={styles.statsCompact}>
            <View style={styles.statCompact}>
              <Text style={styles.statValueCompact}>{formatCount(profile.followersCount || 0)}</Text>
              <Text style={styles.statLabelCompact}>Followers</Text>
            </View>
            <View style={styles.statCompact}>
              <Text style={styles.statValueCompact}>{formatCount(profile.followingCount || 0)}</Text>
              <Text style={styles.statLabelCompact}>Following</Text>
            </View>
            <View style={styles.statCompact}>
              <Text style={styles.statValueCompact}>{formatCount(apps.length)}</Text>
              <Text style={styles.statLabelCompact}>Apps</Text>
            </View>
          </View>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.displayName}>{profile.displayName}</Text>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        </View>

        {!username && (
          <>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.editButton, styles.editButtonHalf]}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editButton, styles.editButtonHalf]}
                onPress={() => navigation.navigate('ManageApps')}
              >
                <Text style={styles.editButtonText}>Manage Apps</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
            </TouchableOpacity>
          </>
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
    backgroundColor: '#F0F2FF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientAvatar: {
    borderWidth: 3,
    borderColor: '#FFD369',
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#FFD369',
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileInfo: {
    marginBottom: 12,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsCompact: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
  statCompact: {
    alignItems: 'center',
  },
  statValueCompact: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statLabelCompact: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    width: '100%',
    paddingHorizontal: 20,
  },
  editButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  editButtonHalf: {
    flex: 1,
    paddingHorizontal: 15,
    marginHorizontal: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  settingsButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 20,
  },
  settingsButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#F0F2FF',
    marginTop: 10,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 18,
    paddingLeft: 2,
  },
  appCard: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f5f5f5',
  },
  appIconWrapper: {
    marginRight: 14,
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  appIconImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appIconText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    padding: 20,
  },
});
