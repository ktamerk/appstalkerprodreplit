import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>📱</Text>
        <Text style={styles.appName}>Appstalker</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.tagline}>Discover what apps people use.</Text>
        <Text style={styles.taglineSecondary}>Find your digital tribe.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>
          Appstalker is a social networking platform where you can share the applications you have installed on your phone with your followers. Discover new apps through the people you follow and connect with others who share similar app interests.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>✨</Text>
          <Text style={styles.featureText}>Share your installed apps with followers</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🔔</Text>
          <Text style={styles.featureText}>Real-time notifications for app installations</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>👥</Text>
          <Text style={styles.featureText}>Follow friends and discover their apps</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>❤️</Text>
          <Text style={styles.featureText}>Like profiles and build connections</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🔒</Text>
          <Text style={styles.featureText}>Control which apps you share</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Made With</Text>
        <Text style={styles.tech}>React Native • Node.js • PostgreSQL</Text>
        <Text style={styles.tech}>TypeScript • WebSocket • Drizzle ORM</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Appstalker</Text>
        <Text style={styles.footerText}>All rights reserved</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#f9f9f9',
  },
  logo: {
    fontSize: 64,
    marginBottom: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
    color: '#999',
    marginBottom: 16,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  taglineSecondary: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  tech: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  footer: {
    padding: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#ccc',
    marginBottom: 4,
  },
});
