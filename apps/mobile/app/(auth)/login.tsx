import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../lib/auth';
import { strings } from '../../lib/strings';
import { colors } from '../../theme/colors';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/');
    } catch {
      Alert.alert(strings.errors.auth);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.brand}>{strings.appName}</Text>
      <Text style={styles.tagline}>{strings.tagline}</Text>
      <View style={styles.form}>
        <Input label={strings.email} value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label={strings.password} value={password} onChangeText={setPassword} secureTextEntry />
        <Button title={strings.login} onPress={onSubmit} loading={loading} />
      </View>
      <Link href="/(auth)/register" style={styles.link}>
        Noch kein Konto? {strings.register}
      </Link>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', gap: 12 },
  brand: { fontSize: 32, fontWeight: '800', color: colors.navy, textAlign: 'center' },
  tagline: { fontSize: 16, color: colors.accent, textAlign: 'center', marginBottom: 24 },
  form: { gap: 14 },
  link: { textAlign: 'center', color: colors.primary, marginTop: 16, fontWeight: '600' },
});
