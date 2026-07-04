import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SUBJECTS, type Subject } from '@schlaubox/shared';
import { InsightChip } from '../../../components/InsightChip';
import { SubjectPill } from '../../../components/SubjectPill';
import { Button } from '../../../components/Button';
import { Card, CardTitle } from '../../../components/Card';
import {
  effectiveSubject,
  getSignedScanUrl,
  groupInsights,
  useOverrideSubject,
  useScan,
} from '../../../lib/api';
import { supabase } from '../../../lib/supabase';
import { strings } from '../../../lib/strings';
import { colors } from '../../../theme/colors';

export default function AnalysisScreen() {
  const { scanId } = useLocalSearchParams<{ scanId: string }>();
  const { data: scan, isLoading, refetch } = useScan(scanId);
  const overrideSubject = useOverrideSubject();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  useEffect(() => {
    if (!scan) return;

    if (scan.status === 'processing') {
      const channel = supabase
        .channel(`scan-${scan.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'scans', filter: `id=eq.${scan.id}` },
          () => refetch(),
        )
        .subscribe();

      const interval = setInterval(() => refetch(), 5000);
      return () => {
        supabase.removeChannel(channel);
        clearInterval(interval);
      };
    }
  }, [scan, refetch]);

  useEffect(() => {
    if (scan?.storage_path) {
      getSignedScanUrl(scan.storage_path).then(setImageUrl).catch(() => setImageUrl(null));
    }
  }, [scan?.storage_path]);

  if (isLoading || !scan) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const analysis = Array.isArray(scan.analyses) ? scan.analyses[0] : scan.analyses;

  if (scan.status === 'processing') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.processing}>{strings.processing}</Text>
      </View>
    );
  }

  if (scan.status === 'failed' || !analysis) {
    return (
      <View style={styles.center}>
        <Text style={styles.failed}>{scan.error_message ?? strings.scanFailed}</Text>
        <Button title={strings.retry} onPress={() => router.back()} />
      </View>
    );
  }

  const subject = effectiveSubject(analysis);
  const insights = groupInsights(analysis.topic_insights ?? []);

  const onOverride = async (next: Subject) => {
    try {
      await overrideSubject.mutateAsync({ analysisId: analysis.id, subject: next });
      setShowSubjectPicker(false);
      refetch();
    } catch {
      Alert.alert(strings.errors.generic);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />}

      <View style={styles.subjectRow}>
        <SubjectPill subject={subject} />
        <Button title={strings.overrideSubject} variant="ghost" onPress={() => setShowSubjectPicker(true)} />
      </View>

      {analysis.grade_or_score && (
        <Text style={styles.grade}>
          {strings.grade}: {analysis.grade_or_score}
        </Text>
      )}

      {analysis.summary_de && (
        <Card>
          <CardTitle>Zusammenfassung</CardTitle>
          <Text style={styles.summary}>{analysis.summary_de}</Text>
        </Card>
      )}

      {insights.strengths.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.strengths}</Text>
          {insights.strengths.map((item) => (
            <InsightChip key={item.id} topic={item.topic} level={item.level} explanation={item.explanation_de} />
          ))}
        </View>
      )}

      {insights.weaknesses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.weaknesses}</Text>
          {insights.weaknesses.map((item) => (
            <InsightChip key={item.id} topic={item.topic} level={item.level} explanation={item.explanation_de} />
          ))}
        </View>
      )}

      <Modal visible={showSubjectPicker} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{strings.overrideSubject}</Text>
            <View style={styles.pillGrid}>
              {SUBJECTS.map((s) => (
                <SubjectPill key={s} subject={s} onPress={() => onOverride(s)} />
              ))}
            </View>
            <Button title={strings.cancel} variant="secondary" onPress={() => setShowSubjectPicker(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  processing: { marginTop: 12, color: colors.accent, fontWeight: '600' },
  failed: { color: colors.error, fontSize: 16, textAlign: 'center' },
  image: { width: '100%', height: 220, borderRadius: 12, backgroundColor: colors.white },
  subjectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  grade: { fontSize: 18, fontWeight: '700', color: colors.primary },
  summary: { fontSize: 15, lineHeight: 22, color: colors.text },
  section: { gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.navy },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: colors.white, padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.navy },
  pillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
