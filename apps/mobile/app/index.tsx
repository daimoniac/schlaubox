import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { ConfigError } from '../components/ConfigError';
import { useAuth } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import { colors } from '../theme/colors';

export default function Index() {
  const { session, profile, loading } = useAuth();

  if (!isSupabaseConfigured) {
    return <ConfigError />;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!profile?.consent_given_at) {
    return <Redirect href="/(auth)/consent" />;
  }

  return <Redirect href="/(app)" />;
}
