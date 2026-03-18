import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function MontoyaScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.label}>Student name: Montoya</ThemedText>
      <ThemedText style={styles.info}>Status: Active</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  label: {
    color: '#E2E8F0',
    marginBottom: 2,
  },
  info: {
    fontSize: 12,
    color: 'rgba(148, 163, 184, 0.95)',
  },
});

