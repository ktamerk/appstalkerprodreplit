import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';

export default function HelpScreen() {
  const openEmail = () => {
    Linking.openURL('mailto:support@appstalker.com?subject=Help Request');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Getting Started</Text>
        <View style={styles.card}>
          <Text style={styles.question}>How do I share my apps?</Text>
          <Text style={styles.answer}>
            Appstalker automatically detects apps installed on your device. You can choose which apps to display on your profile from the "Manage Apps" section.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.question}>How do I follow people?</Text>
          <Text style={styles.answer}>
            Go to the Search tab, find users, and tap the Follow button on their profile. You'll see their app updates in your feed.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        <View style={styles.card}>
          <Text style={styles.question}>Can I hide specific apps?</Text>
          <Text style={styles.answer}>
            Yes! Go to your Profile → Manage Apps, and toggle off any apps you don't want to share publicly.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.question}>Who can see my apps?</Text>
          <Text style={styles.answer}>
            Only your followers can see which apps you have installed. You control your follower list by accepting or declining follow requests.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.card}>
          <Text style={styles.question}>What are notifications for?</Text>
          <Text style={styles.answer}>
            You'll receive real-time notifications when:
            - Someone you follow installs a new app
            - Someone follows you
            - Someone likes your profile
            - You receive a new friend request
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Support</Text>
        <View style={styles.card}>
          <Text style={styles.answer}>
            Need more help? Contact our support team:
          </Text>
          <TouchableOpacity style={styles.button} onPress={openEmail}>
            <Text style={styles.buttonText}>Email Support</Text>
          </TouchableOpacity>
        </View>
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
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
