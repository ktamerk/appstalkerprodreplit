import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';

export default function LikedProfilesScreen({ navigation }: any) {
  const [likedProfiles, setLikedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLikedProfiles();
  }, []);

  const loadLikedProfiles = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PROFILE.LIKED);
      setLikedProfiles(response.data.profiles);
    } catch (error) {
      console.error('Load liked profiles error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProfile = ({ item }: any) => (
    <TouchableOpacity
      style={styles.profileCard}
      onPress={() => navigation.navigate('Profile', { username: item.username })}
    >
      {item.avatarUrl ? (
        <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.displayName[0].toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.profileInfo}>
        <Text style={styles.displayName}>{item.displayName}</Text>
        <Text style={styles.username}>@{item.username}</Text>
        {item.bio && <Text style={styles.bio} numberOfLines={2}>{item.bio}</Text>}
      </View>
      <Text style={styles.likeIcon}>❤️</Text>
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
        data={likedProfiles}
        renderItem={renderProfile}
        keyExtractor={(item: any) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💙</Text>
            <Text style={styles.emptyText}>No liked profiles yet</Text>
            <Text style={styles.emptySubtext}>Like profiles to see them here</Text>
          </View>
        }
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
  profileCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#a8b5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
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
    marginBottom: 4,
  },
  bio: {
    fontSize: 13,
    color: '#999',
  },
  likeIcon: {
    fontSize: 24,
    marginLeft: 8,
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
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});
