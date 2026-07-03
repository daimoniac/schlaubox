import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '../../components/Button';
import { useAcceptConsent } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { strings } from '../../lib/strings';
import { colors } from '../../theme/colors';

export default function ConsentScreen() {
  const { refreshProfile } = useAuth();
  const acceptConsent = useAcceptConsent();

  const onAccept = async () => {
    try {
      await acceptConsent.mutateAsync();
      await refreshProfile();
      router.replace('/');
    } catch {
      // handled by mutation
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{strings.consentTitle}</Text>
      <Text style={styles.body}>{strings.consentBody}</Text>
      <Button
        title={strings.consentAccept}
        onPress={onAccept}
        loading={acceptConsent.isPending}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 20 },
  title: { fontSize: 22, fontWeight: '700', color: colors.navy },
  body: { fontSize: 16, lineHeight: 24, color: colors.textMuted },
});
