import { Link } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppBackground } from '@/components/ui/ImageBackground';
import { supabase } from '@/utils/supabase';

export default function LandingScreen() {
  const [supabaseStatus, setSupabaseStatus] = useState<string | null>(null);
  const [supabaseTesting, setSupabaseTesting] = useState(false);
  const [supabaseTables, setSupabaseTables] = useState<string[] | null>(null);

  const handleTestSupabase = useCallback(async () => {
    try {
      setSupabaseTesting(true);
      setSupabaseStatus(null);
      setSupabaseTables(null);

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setSupabaseStatus(`Supabase error: ${error.message}`);
        return;
      }

      if (data?.session) {
        setSupabaseStatus('Connected: Supabase client is reachable and an active session exists.');
      } else {
        setSupabaseStatus('Connected: Supabase client is reachable but there is no active session (expected when logged out).');
      }

      // Optional tutorial step: call a helper RPC that lists tables.
      // You can create it in Supabase with:
      //
      // create or replace function public.list_tables()
      // returns table (table_name text)
      // language sql
      // security definer
      // set search_path = public
      // as $$
      //   select tablename::text as table_name
      //   from pg_tables
      //   where schemaname = 'public'
      //   order by tablename;
      // $$;
      //
      // grant execute on function public.list_tables() to anon;
      const { data: tablesData, error: tablesError } = await supabase.rpc('list_tables');

      if (tablesError) {
        setSupabaseStatus((prev) =>
          prev
            ? `${prev}\n\nTables step: ${tablesError.message}`
            : `Tables step: ${tablesError.message}`,
        );
      } else if (Array.isArray(tablesData)) {
        const names = (tablesData as Array<{ table_name: string }>).map((t: { table_name: string }) => t.table_name);
        setSupabaseTables(names);
        setSupabaseStatus((prev) =>
          prev
            ? `${prev}\n\nTables step: Loaded ${names.length} tables from the database.`
            : `Tables step: Loaded ${names.length} tables from the database.`,
        );
      } else if (tablesData) {
        setSupabaseStatus((prev) =>
          prev
            ? `${prev}\n\nTables step: Unexpected response shape from list_tables().`
            : 'Tables step: Unexpected response shape from list_tables().',
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setSupabaseStatus(`Supabase connection failed: ${message}`);
    } finally {
      setSupabaseTesting(false);
    }
  }, []);

  return (
    <AppBackground>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Supabase API integration tutorial
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            This screen helps you verify that your Expo app can talk to your Supabase project.
          </ThemedText>
        </View>

        {/* Step 1 – Environment */}
        <ThemedView style={styles.card}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            1. Check environment variables
          </ThemedText>
          <ThemedText style={styles.cardBody}>
            Make sure you have `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` set in your `.env` file
            and that you restarted Expo after changing them.
          </ThemedText>
          <ThemedText style={styles.cardHint}>
            These values are read at build time. If you update `.env`, stop the dev server and run it again.
          </ThemedText>
        </ThemedView>

        {/* Step 2 – Handshake */}
        <ThemedView style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              2. Run connection test
            </ThemedText>
            <TouchableOpacity
              onPress={handleTestSupabase}
              disabled={supabaseTesting}
              style={[styles.testButton, supabaseTesting && styles.testButtonDisabled]}
            >
              <ThemedText style={styles.testButtonText}>
                {supabaseTesting ? 'Testing…' : 'Run Supabase test'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText style={styles.cardBody}>
            This calls `supabase.auth.getSession()` on the client. If Supabase is reachable, you should see a success
            message below. If not, the error text will help you debug your config.
          </ThemedText>

          <ThemedText
            style={[
              styles.statusText,
              !supabaseStatus
                ? styles.statusIdle
                : supabaseStatus.toLowerCase().includes('failed') ||
                    supabaseStatus.toLowerCase().includes('error')
                  ? styles.statusError
                  : styles.statusSuccess,
            ]}
          >
            {!supabaseStatus
              ? 'No checks run yet. Tap “Run Supabase test” to start.'
              : supabaseStatus}
          </ThemedText>
        </ThemedView>

        {/* Step 3 – Example data access */}
        <ThemedView style={styles.card}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            3. Read data from Supabase
          </ThemedText>
          <ThemedText style={styles.cardBody}>
            As an example, this app calls an RPC function named `list_tables` to return table names. You can replace
            this with any query against your own tables (for example, `from('students').select('*')`).
          </ThemedText>

          {supabaseTables && supabaseTables.length > 0 ? (
            <View style={styles.tablesSection}>
              <ThemedText type="defaultSemiBold" style={styles.tablesTitle}>
                Tables returned ({supabaseTables.length})
              </ThemedText>
              <View style={styles.tablesList}>
                {supabaseTables.map((name) => (
                  <ThemedView key={name} style={styles.tableChip}>
                    <ThemedText style={styles.tableChipText}>{name}</ThemedText>
                  </ThemedView>
                ))}
              </View>
            </View>
          ) : (
            <ThemedText style={styles.cardHint}>
              After the connection test succeeds and your `list_tables` function is configured, any tables visible to
              your anon key will be listed here.
            </ThemedText>
          )}
        </ThemedView>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            This page is meant only for development and debugging your Supabase API integration.
          </ThemedText>

          <Link href="/student-list" asChild>
            <TouchableOpacity style={styles.studentsButton}>
              <ThemedText style={styles.studentsButtonText}>View students list</ThemedText>
            </TouchableOpacity>
          </Link>
          
        </View>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  header: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#E2E8F0',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(148, 163, 184, 0.95)',
  },

  card: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.35)',
  },
  cardTitle: {
    color: '#E2E8F0',
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(226, 232, 240, 0.85)',
    marginBottom: 8,
  },
  cardHint: {
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(148, 163, 184, 0.95)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  statusText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  statusIdle: {
    color: 'rgba(148, 163, 184, 0.95)',
  },
  statusSuccess: {
    color: '#22C55E',
  },
  statusError: {
    color: '#F97316',
  },

  tablesSection: {
    marginTop: 8,
  },
  tablesTitle: {
    marginBottom: 6,
    color: '#E2E8F0',
  },
  tablesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tableChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.6)',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    marginRight: 6,
    marginBottom: 6,
  },
  tableChipText: {
    fontSize: 11,
    color: '#CBD5F5',
  },

  footer: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(226, 232, 240, 0.55)',
  },
  studentsButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(56, 189, 248, 0.8)',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  studentsButtonText: {
    fontSize: 12,
    color: '#E0F2FE',
  },
  testButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(34, 211, 238, 0.6)',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    fontSize: 11,
    color: '#E0F2FE',
  },
  testStatusText: {
    marginTop: 4,
    fontSize: 11,
  },
  testStatusSuccess: {
    color: '#22C55E',
  },
  testStatusError: {
    color: '#F97316',
  },
});

