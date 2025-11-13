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

  const getNotificationIcon = (content: string) => {
    if (content.includes('follow')) return '👤';
    if (content.includes('installed')) return '📱';
    if (content.includes('liked')) return '❤️';
    if (content.includes('friend request')) return '🤝';
    return '🔔';
  };

  const getNotificationColor = (content: string) => {
    if (content.includes('follow')) return '#6C63FF';
    if (content.includes('installed')) return '#FFD369';
    if (content.includes('liked')) return '#FF6B9D';
    if (content.includes('friend request')) return '#4ECDC4';
    return '#999';
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  const renderNotification = ({ item }: any) => {
    const iconEmoji = getNotificationIcon(item.content);
    const accentColor = getNotificationColor(item.content);
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.isRead && styles.unread,
          !item.isRead && { borderLeftColor: accentColor }
        ]}
        onPress={() => {
          markAsRead(item.id);
          if (item.relatedUser) {
            navigation.navigate('Profile', { username: item.relatedUser.username });
          }
        }}
      >
        <View style={[styles.iconBadge, { backgroundColor: accentColor + '20' }]}>
          <Text style={styles.iconEmoji}>{iconEmoji}</Text>
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={styles.notificationText}>
            <Text style={styles.username}>
              {item.relatedUser?.displayName || 'Someone'}
            </Text>{' '}
            {item.content}
          </Text>
          <Text style={styles.time}>
            {formatRelativeTime(item.createdAt)}
          </Text>
        </View>
        
        {!item.isRead && (
          <View style={[styles.unreadDot, { backgroundColor: accentColor }]} />
        )}
      </TouchableOpacity>
    );
  };

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
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <Text style={styles.markAllIcon}>✓</Text>
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        </View>
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
  headerContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  markAllButton: {
    flexDirection: 'row',
    backgroundColor: '#6C63FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  markAllIcon: {
    color: '#fff',
    fontSize: 16,
    marginRight: 6,
    fontWeight: 'bold',
  },
  markAllText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  unread: {
    backgroundColor: '#F0F2FF',
    borderLeftWidth: 4,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconEmoji: {
    fontSize: 24,
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
    fontSize: 11,
    color: '#bbb',
    marginTop: 5,
    fontWeight: '500',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
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
