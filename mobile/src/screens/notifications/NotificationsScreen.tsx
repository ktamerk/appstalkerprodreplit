import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';

export default function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.ALL);
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Load notifications error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
      setNotifications((prev) =>
        prev.map((n: any) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
      setNotifications((prev) =>
        prev.map((n: any) => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const renderNotification = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.isRead && styles.unread]}
      onPress={() => {
        markAsRead(item.id);
        if (item.relatedUser) {
          navigation.navigate('Profile', { username: item.relatedUser.username });
        }
      }}
    >
      {item.relatedUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.relatedUser.displayName[0].toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>
          <Text style={styles.username}>
            {item.relatedUser?.displayName || 'Someone'}
          </Text>{' '}
          {item.content}
        </Text>
        <Text style={styles.time}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
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
      {notifications.length > 0 && (
        <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
          <Text style={styles.markAllText}>Mark All as Read</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item: any) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
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
  markAllButton: {
    backgroundColor: '#fff',
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  markAllText: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  unread: {
    backgroundColor: '#f0f8ff',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  username: {
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6C63FF',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
