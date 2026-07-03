import { Pressable, StyleSheet, Text } from 'react-native';
import type { Subject } from '@schlaubox/shared';
import { SUBJECT_COLORS, SUBJECT_LABELS } from '@schlaubox/shared';
import { colors } from '../theme/colors';

interface SubjectPillProps {
  subject: Subject;
  selected?: boolean;
  onPress?: () => void;
}

export function SubjectPill({ subject, selected, onPress }: SubjectPillProps) {
  const color = SUBJECT_COLORS[subject];
  const content = (
    <Text style={[styles.text, selected && styles.textSelected]}>{SUBJECT_LABELS[subject]}</Text>
  );

  if (!onPress) {
    return (
      <Pressable style={[styles.pill, { backgroundColor: color }]} disabled>
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        { backgroundColor: selected ? color : colors.white, borderColor: color },
        !selected && styles.outline,
      ]}
    >
      <Text style={[styles.text, !selected && { color }]}>{SUBJECT_LABELS[subject]}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  outline: {
    borderWidth: 1.5,
  },
  text: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  textSelected: {
    color: colors.white,
  },
});
