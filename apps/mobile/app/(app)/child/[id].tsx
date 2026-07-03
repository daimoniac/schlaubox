import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SUBJECTS, type Subject } from '@schlaubox/shared';
import { Card } from '../../../components/Card';
import { SubjectPill } from '../../../components/SubjectPill';
import { useChild, useScans, effectiveSubject } from '../../../lib/api';
import { strings } from '../../../lib/strings';
import { colors } from '../../../theme/colors';

export default function ChildDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: child, isLoading } = useChild(id);
  const { data: scans } = useScans(id);
  const [filter, setFilter] = useState<Subject | 'all'>('all');

  if (isLoading || !child) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const filtered = (scans ?? []).filter((scan) => {
    if (filter === 'all') return true;
    const analysis = scan.analyses;
    if (!analysis) return false;
    return effectiveSubject(analysis) === filter;
  });

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={filtered}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.name}>{child.name}</Text>
          <Text style={styles.meta}>Geburtsjahr {child.birth_year}</Text>
          <Text style={styles.section}>{strings.subjects}</Text>
          <View style={styles.filters}>
            <Pressable onPress={() => setFilter('all')}>
              <Text style={[styles.filterText, filter === 'all' && styles.filterActive]}>Alle</Text>
            </Pressable>
            {SUBJECTS.map((subject) => (
              <SubjectPill
                key={subject}
                subject={subject}
                selected={filter === subject}
                onPress={() => setFilter(subject)}
              />
            ))}
          </View>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>Noch keine Tests in dieser Kategorie.</Text>}
      renderItem={({ item }) => {
        const analysis = item.analyses;
        const subject = analysis ? effectiveSubject(analysis) : null;
        return (
          <Pressable onPress={() => router.push(`/(app)/analysis/${item.id}`)}>
            <Card style={styles.scanCard}>
              <Text style={styles.date}>{new Date(item.scanned_at).toLocaleDateString('de-DE')}</Text>
              {subject && <SubjectPill subject={subject} />}
              {item.status === 'processing' && <Text style={styles.processing}>{strings.processing}</Text>}
            </Card>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, gap: 10 },
  header: { gap: 10, marginBottom: 8 },
  name: { fontSize: 24, fontWeight: '800', color: colors.navy },
  meta: { color: colors.textMuted },
  section: { fontSize: 16, fontWeight: '700', color: colors.navy, marginTop: 8 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  filterText: { paddingHorizontal: 10, color: colors.textMuted, fontWeight: '600' },
  filterActive: { color: colors.primary },
  empty: { color: colors.textMuted, marginTop: 12 },
  scanCard: { marginBottom: 8 },
  date: { color: colors.textMuted, marginBottom: 6 },
  processing: { color: colors.accent, marginTop: 6, fontWeight: '600' },
});
