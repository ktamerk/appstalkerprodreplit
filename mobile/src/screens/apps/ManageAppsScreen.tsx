import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Switch, 
  TextInput, 
  Image,
  ActivityIndicator 
} from 'react-native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';

interface App {
  id: string;
  packageName: string;
  appName: string;
  appIcon?: string;
  isVisible: boolean;
  platform: string;
}

export default function ManageAppsScreen({ navigation }: any) {
  const [apps, setApps] = useState<App[]>([]);
  const [filteredApps, setFilteredApps] = useState<App[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadApps();
  }, []);

  useEffect(() => {
    filterApps();
  }, [searchQuery, apps]);

  const loadApps = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.APPS.ME);
      setApps(response.data.apps);
    } catch (error) {
      console.error('Load apps error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApps = () => {
    if (!searchQuery.trim()) {
      setFilteredApps(apps);
      return;
    }

    const query = searchQuery.toLowerCase();
    setFilteredApps(
      apps.filter(app => 
        app.appName.toLowerCase().includes(query) ||
        app.packageName.toLowerCase().includes(query)
      )
    );
  };

  const toggleVisibility = async (app: App) => {
    const packageName = app.packageName;
    setUpdating(prev => new Set(prev).add(packageName));

    try {
      // Optimistic update
      const newVisibility = !app.isVisible;
      setApps(prevApps => 
        prevApps.map(a => 
          a.packageName === packageName 
            ? { ...a, isVisible: newVisibility }
            : a
        )
      );

      await api.post(API_ENDPOINTS.APPS.VISIBILITY_BULK, {
        updates: [{
          packageName: packageName,
          isVisible: newVisibility,
        }]
      });
    } catch (error) {
      console.error('Toggle visibility error:', error);
      // Rollback on error
      setApps(prevApps => 
        prevApps.map(a => 
          a.packageName === packageName 
            ? { ...a, isVisible: app.isVisible }
            : a
        )
      );
    } finally {
      setUpdating(prev => {
        const next = new Set(prev);
        next.delete(packageName);
        return next;
      });
    }
  };

  const toggleAllVisible = async () => {
    try {
      const updates = apps.map(app => ({
        packageName: app.packageName,
        isVisible: true,
      }));

      setApps(prevApps => prevApps.map(a => ({ ...a, isVisible: true })));
      
      await api.post(API_ENDPOINTS.APPS.VISIBILITY_BULK, { updates });
    } catch (error) {
      console.error('Show all error:', error);
      loadApps(); // Reload on error
    }
  };

  const toggleAllHidden = async () => {
    try {
      const updates = apps.map(app => ({
        packageName: app.packageName,
        isVisible: false,
      }));

      setApps(prevApps => prevApps.map(a => ({ ...a, isVisible: false })));
      
      await api.post(API_ENDPOINTS.APPS.VISIBILITY_BULK, { updates });
    } catch (error) {
      console.error('Hide all error:', error);
      loadApps(); // Reload on error
    }
  };

  const renderApp = ({ item }: { item: App }) => {
    const isUpdating = updating.has(item.packageName);
    
    return (
      <View style={styles.appItem}>
        <View style={styles.appInfo}>
          {item.appIcon ? (
            <Image source={{ uri: item.appIcon }} style={styles.appIcon} />
          ) : (
            <View style={[styles.appIcon, styles.appIconPlaceholder]}>
              <Text style={styles.appIconText}>{item.appName[0]}</Text>
            </View>
          )}
          <View style={styles.appText}>
            <Text style={styles.appName}>{item.appName}</Text>
            <Text style={styles.appPackage}>{item.packageName}</Text>
          </View>
        </View>
        {isUpdating ? (
          <ActivityIndicator size="small" color="#a8b5ff" />
        ) : (
          <Switch
            value={item.isVisible}
            onValueChange={() => toggleVisibility(item)}
            trackColor={{ false: '#ccc', true: '#d4a5f5' }}
            thumbColor={item.isVisible ? '#a8b5ff' : '#f4f3f4'}
          />
        )}
      </View>
    );
  };

  const visibleCount = apps.filter(a => a.isVisible).length;
  const hiddenCount = apps.length - visibleCount;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a8b5ff" />
        <Text style={styles.loadingText}>Loading apps...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Apps</Text>
        <Text style={styles.headerSubtitle}>
          {visibleCount} visible • {hiddenCount} hidden
        </Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search apps..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={toggleAllVisible}>
          <Text style={styles.actionButtonText}>Show All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]} onPress={toggleAllHidden}>
          <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>Hide All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredApps}
        renderItem={renderApp}
        keyExtractor={(item) => item.packageName}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No apps found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  searchInput: {
    margin: 15,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 10,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#a8b5ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#a8b5ff',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtonTextSecondary: {
    color: '#a8b5ff',
  },
  listContent: {
    padding: 15,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 12,
  },
  appIconPlaceholder: {
    backgroundColor: '#a8b5ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  appText: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  appPackage: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
