import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../lib/auth';
import { getLoginErrorMessage } from '../../lib/auth-errors';
import { strings } from '../../lib/strings';
import { colors } from '../../theme/colors';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/');
    } catch (err) {
      setError(getLoginErrorMessage(err));
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
        {error && (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
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
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
    padding: 14,
  },
  errorText: { color: colors.error, fontSize: 15, lineHeight: 22, fontWeight: '500' },
  link: { textAlign: 'center', color: colors.primary, marginTop: 16, fontWeight: '600' },
});
