import { StyleSheet, Text, View } from 'react-native';
import type { InsightLevel } from '@schlaubox/shared';
import { colors } from '../theme/colors';

const levelColors: Record<InsightLevel, string> = {
  stärke: colors.strength,
  schwäche: colors.weakness,
  neutral: colors.neutral,
};

const levelLabels: Record<InsightLevel, string> = {
  stärke: 'Stärke',
  schwäche: 'Schwäche',
  neutral: 'Neutral',
};

export function InsightChip({
  topic,
  level,
  explanation,
}: {
  topic: string;
  level: InsightLevel;
  explanation: string;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.topic}>{topic}</Text>
        <View style={[styles.badge, { backgroundColor: levelColors[level] }]}>
          <Text style={styles.badgeText}>{levelLabels[level]}</Text>
        </View>
      </View>
      <Text style={styles.explanation}>{explanation}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  topic: { fontSize: 16, fontWeight: '700', color: colors.navy, flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  explanation: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
});
