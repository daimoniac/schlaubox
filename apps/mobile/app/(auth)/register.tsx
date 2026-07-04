import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../lib/auth';
import { getRegisterErrorMessage, isUserAlreadyRegisteredError } from '../../lib/auth-errors';
import { strings } from '../../lib/strings';
import { colors } from '../../theme/colors';

export default function RegisterScreen() {
  const { signUp, resendConfirmationEmail } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastError, setLastError] = useState<unknown>(null);

  const onSubmit = async () => {
    setError(null);
    setLastError(null);
    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
      Alert.alert(strings.register, strings.registerSuccess);
      router.replace('/(auth)/login');
    } catch (err) {
      setLastError(err);
      setError(getRegisterErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onResendConfirmation = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Bitte geben Sie zuerst Ihre E-Mail-Adresse ein.');
      return;
    }

    setResendLoading(true);
    try {
      await resendConfirmationEmail(trimmedEmail);
      Alert.alert(strings.resendConfirmation, strings.resendConfirmationSuccess);
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.form}>
        {error && (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <Input label={strings.displayName} value={displayName} onChangeText={setDisplayName} />
        <Input label={strings.email} value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label={strings.password} value={password} onChangeText={setPassword} secureTextEntry />
        <Button title={strings.register} onPress={onSubmit} loading={loading} />
        {lastError && isUserAlreadyRegisteredError(lastError) && (
          <Button
            title={strings.resendConfirmation}
            variant="secondary"
            loading={resendLoading}
            onPress={onResendConfirmation}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  form: { gap: 14 },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
    padding: 14,
  },
  errorText: { color: colors.error, fontSize: 15, lineHeight: 22, fontWeight: '500' },
});
