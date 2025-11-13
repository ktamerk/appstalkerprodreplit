import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Switch,
  Image,
} from 'react-native';

interface NewApp {
  packageName: string;
  appName: string;
  appIcon?: string;
  platform: string;
}

interface NewAppPromptProps {
  visible: boolean;
  apps: NewApp[];
  onConfirm: (selectedApps: string[]) => void;
  onDismiss: () => void;
}

export default function NewAppPrompt({
  visible,
  apps,
  onConfirm,
  onDismiss,
}: NewAppPromptProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleApp = (packageName: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(packageName)) {
        next.delete(packageName);
      } else {
        next.add(packageName);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(apps.map((app) => app.packageName)));
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selected));
    setSelected(new Set());
  };

  const handleDismiss = () => {
    setSelected(new Set());
    onDismiss();
  };

  if (!visible || apps.length === 0) {
    return null;
  }

  const renderApp = ({ item }: { item: NewApp }) => {
    const isSelected = selected.has(item.packageName);

    return (
      <TouchableOpacity
        style={styles.appItem}
        onPress={() => toggleApp(item.packageName)}
      >
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
        <Switch
          value={isSelected}
          onValueChange={() => toggleApp(item.packageName)}
          trackColor={{ false: '#ccc', true: '#d4a5f5' }}
          thumbColor={isSelected ? '#6C63FF' : '#f4f3f4'}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>🎉 New Apps Detected!</Text>
            <Text style={styles.subtitle}>
              Choose which apps to show on your profile
            </Text>
          </View>

          <FlatList
            data={apps}
            renderItem={renderApp}
            keyExtractor={(item) => item.packageName}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.selectAllButton} onPress={selectAll}>
              <Text style={styles.selectAllText}>Select All</Text>
            </TouchableOpacity>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handleDismiss}
              >
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                  Skip
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleConfirm}
              >
                <Text style={styles.buttonText}>
                  Show Selected ({selected.size})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  list: {
    maxHeight: 400,
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
    backgroundColor: '#6C63FF',
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
    color: '#1A1A1A',
    marginBottom: 2,
  },
  appPackage: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  selectAllButton: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  selectAllText: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#6C63FF',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextSecondary: {
    color: '#6C63FF',
  },
});
