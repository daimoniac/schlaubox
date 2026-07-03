import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../lib/auth';
import { strings } from '../../lib/strings';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
      Alert.alert('Konto erstellt', 'Bitte bestätigen Sie ggf. Ihre E-Mail und melden Sie sich an.');
      router.replace('/(auth)/login');
    } catch {
      Alert.alert(strings.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.form}>
        <Input label={strings.displayName} value={displayName} onChangeText={setDisplayName} />
        <Input label={strings.email} value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label={strings.password} value={password} onChangeText={setPassword} secureTextEntry />
        <Button title={strings.register} onPress={onSubmit} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  form: { gap: 14 },
});
