import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsScreenProps {
  navigation: any;
  onLogout: () => void;
}

export default function SettingsScreen({ navigation, onLogout }: SettingsScreenProps) {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['authToken', 'token', 'userId']);
            onLogout();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Activity</Text>
        
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('LikedProfiles')}
        >
          <Text style={styles.menuIcon}>❤️</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>Liked Profiles</Text>
            <Text style={styles.menuSubtext}>Profiles you've liked</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Help')}
        >
          <Text style={styles.menuIcon}>❓</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>Help & Support</Text>
            <Text style={styles.menuSubtext}>Get help with Appstalker</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('About')}
        >
          <Text style={styles.menuIcon}>ℹ️</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>About Appstalker</Text>
            <Text style={styles.menuSubtext}>Version 1.0.0</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.menuItem, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.menuIcon}>🚪</Text>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Discover what apps people use.</Text>
        <Text style={styles.footerText}>Find your digital tribe.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2FF',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: 13,
    color: '#999',
  },
  menuArrow: {
    fontSize: 24,
    color: '#ccc',
    fontWeight: '300',
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#ff4444',
  },
  footer: {
    padding: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 4,
  },
});
