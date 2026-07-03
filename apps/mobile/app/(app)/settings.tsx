import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Card, CardTitle } from '../../components/Card';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { strings } from '../../lib/strings';
import { colors } from '../../theme/colors';

export default function SettingsScreen() {
  const { profile, signOut } = useAuth();

  const onExport = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('export-data');
      if (error) throw error;

      const path = `${FileSystem.cacheDirectory}schlaubox-export.json`;
      await FileSystem.writeAsStringAsync(path, JSON.stringify(data, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType: 'application/json' });
      } else {
        Alert.alert('Export erstellt', path);
      }
    } catch {
      Alert.alert(strings.errors.generic);
    }
  };

  const onDeleteAccount = () => {
    Alert.alert(strings.deleteAccount, strings.deleteAccountConfirm, [
      { text: strings.cancel, style: 'cancel' },
      {
        text: strings.deleteAccount,
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.functions.invoke('delete-account');
            if (error) throw error;
            await signOut();
            router.replace('/(auth)/login');
          } catch {
            Alert.alert(strings.errors.generic);
          }
        },
      },
    ]);
  };

  const onLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <CardTitle>Konto</CardTitle>
        <Text style={styles.meta}>{profile?.display_name ?? 'Elternteil'}</Text>
        {profile?.consent_given_at && (
          <Text style={styles.meta}>
            Einwilligung: {new Date(profile.consent_given_at).toLocaleDateString('de-DE')}
          </Text>
        )}
      </Card>

      <Card>
        <CardTitle>Datenschutz</CardTitle>
        <Text style={styles.body}>
          SchlauBox speichert Daten in der EU. Sie können Ihre Daten exportieren oder Ihr Konto
          vollständig löschen.
        </Text>
        <Button title={strings.privacy} variant="secondary" onPress={() => Linking.openURL('https://schlaubox.io')} />
        <Button title={strings.exportData} variant="secondary" onPress={onExport} />
        <Button title={strings.deleteAccount} variant="danger" onPress={onDeleteAccount} />
      </Card>

      <Button title={strings.logout} variant="ghost" onPress={onLogout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  meta: { color: colors.textMuted, fontSize: 15 },
  body: { color: colors.text, lineHeight: 22, fontSize: 15 },
});
