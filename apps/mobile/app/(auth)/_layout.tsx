import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, title: '' }}>
      <Stack.Screen name="login" options={{ title: 'Anmelden' }} />
      <Stack.Screen name="register" options={{ title: 'Registrieren' }} />
      <Stack.Screen name="consent" options={{ title: 'Datenschutz', headerBackVisible: false }} />
    </Stack>
  );
}
