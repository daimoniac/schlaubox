import { Link, router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { SubjectPill } from '../../components/SubjectPill';
import { useChildren, useScans, effectiveSubject } from '../../lib/api';
import { strings } from '../../lib/strings';
import { colors } from '../../theme/colors';

export default function HomeScreen() {
  const { data: children, isLoading: childrenLoading } = useChildren();
  const { data: scans, isLoading: scansLoading } = useScans();

  if (childrenLoading || scansLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!children?.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{strings.noChildren}</Text>
        <Text style={styles.emptyHint}>{strings.noChildrenHint}</Text>
        <Button title={strings.addChild} onPress={() => router.push('/(app)/child/new')} />
      </View>
    );
  }

  const recent = (scans ?? []).slice(0, 8);

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={recent}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Card>
            <CardTitle>Ihre Kinder</CardTitle>
            {children.map((child) => (
              <Pressable key={child.id} onPress={() => router.push(`/(app)/child/${child.id}`)}>
                <Text style={styles.childLink}>{child.name}</Text>
              </Pressable>
            ))}
            <Link href="/(app)/child/new" asChild>
              <Button title={strings.addChild} variant="secondary" />
            </Link>
          </Card>
          <Text style={styles.section}>{strings.recentScans}</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.emptyHint}>Noch keine Tests gescannt.</Text>}
      renderItem={({ item }) => {
        const analysis = item.analyses;
        const subject = analysis ? effectiveSubject(analysis) : null;
        return (
          <Pressable onPress={() => router.push(`/(app)/analysis/${item.id}`)}>
            <Card style={styles.scanCard}>
              <View style={styles.scanRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scanDate}>
                    {new Date(item.scanned_at).toLocaleDateString('de-DE')}
                  </Text>
                  {subject && <SubjectPill subject={subject} />}
                  {item.status === 'processing' && (
                    <Text style={styles.processing}>{strings.processing}</Text>
                  )}
                  {item.status === 'failed' && (
                    <Text style={styles.failed}>{strings.scanFailed}</Text>
                  )}
                </View>
                {analysis?.grade_or_score && (
                  <Text style={styles.grade}>{analysis.grade_or_score}</Text>
                )}
              </View>
            </Card>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, gap: 12 },
  header: { gap: 12, marginBottom: 8 },
  section: { fontSize: 18, fontWeight: '700', color: colors.navy },
  childLink: { fontSize: 16, color: colors.primary, fontWeight: '600', paddingVertical: 4 },
  empty: { flex: 1, padding: 24, justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.navy },
  emptyHint: { color: colors.textMuted, fontSize: 15 },
  scanCard: { marginBottom: 10 },
  scanRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scanDate: { fontSize: 14, color: colors.textMuted, marginBottom: 6 },
  processing: { color: colors.accent, marginTop: 6, fontWeight: '600' },
  failed: { color: colors.error, marginTop: 6, fontWeight: '600' },
  grade: { fontSize: 22, fontWeight: '800', color: colors.primary },
});
