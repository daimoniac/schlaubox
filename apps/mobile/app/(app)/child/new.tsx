import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { useCreateChild } from '../../../lib/api';
import { strings } from '../../../lib/strings';

export default function NewChildScreen() {
  const createChild = useCreateChild();
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState(String(new Date().getFullYear() - 8));

  const onSave = async () => {
    const year = parseInt(birthYear, 10);
    if (!name.trim() || Number.isNaN(year)) {
      Alert.alert('Bitte Name und gültiges Geburtsjahr eingeben.');
      return;
    }

    try {
      await createChild.mutateAsync({ name: name.trim(), birth_year: year });
      router.back();
    } catch {
      Alert.alert(strings.errors.generic);
    }
  };

  return (
    <View style={styles.container}>
      <Input label={strings.childName} value={name} onChangeText={setName} autoCapitalize="words" />
      <Input
        label={strings.birthYear}
        value={birthYear}
        onChangeText={setBirthYear}
        keyboardType="number-pad"
      />
      <Button title={strings.save} onPress={onSave} loading={createChild.isPending} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 14 },
});
