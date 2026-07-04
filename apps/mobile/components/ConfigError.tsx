import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function ConfigError() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SchlauBox</Text>
      <Text style={styles.heading}>App nicht konfiguriert</Text>
      <Text style={styles.body}>
        Dieser Build enthält keine Supabase-Verbindungsdaten. Bitte einen neuen Build mit gesetzten
        Umgebungsvariablen erstellen (siehe DEPLOY.md).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
    gap: 12,
  },
  title: { fontSize: 28, fontWeight: '800', color: colors.navy, textAlign: 'center' },
  heading: { fontSize: 18, fontWeight: '700', color: colors.primary, textAlign: 'center' },
  body: { fontSize: 15, lineHeight: 22, color: colors.textMuted, textAlign: 'center' },
});
