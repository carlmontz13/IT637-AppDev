import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppBackground } from '@/components/ui/ImageBackground';

// NOTE: In React Native / Expo you can't read the filesystem at runtime to
// automatically discover TSX files. Instead, we keep a simple registry here
// that imports each student component. When you add a new student file under
// `app/students`, add it to the `students` array below.

import { students } from '../generated/students-registry';


export default function StudentListScreen() {
  return (
    <AppBackground>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.headerCard}>
          <ThemedText type="title" style={styles.title}>
            Students monitoring
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            This page renders all registered student components from the `app/students` folder (except this
            `student-list` screen).
          </ThemedText>
        </ThemedView>

        {students.map(({ id, name, Component }) => (
          <ThemedView key={id} style={styles.studentCard}>
            <ThemedText type="defaultSemiBold" style={styles.studentName}>
              {name}
            </ThemedText>
            <ThemedView style={styles.studentContent}>
              <Component />
            </ThemedView>
          </ThemedView>
        ))}
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  headerCard: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    marginBottom: 16,
  },
  title: {
    color: '#E2E8F0',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(226, 232, 240, 0.85)',
  },
  studentCard: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    marginBottom: 14,
  },
  studentName: {
    color: '#E2E8F0',
    marginBottom: 8,
  },
  studentContent: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    padding: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
  },
});

