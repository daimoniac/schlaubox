import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/Button';
import { Card, CardTitle } from '../../components/Card';
import { useChildren, uploadAndProcessScan } from '../../lib/api';
import { strings } from '../../lib/strings';
import { colors } from '../../theme/colors';

export default function ScanScreen() {
  const queryClient = useQueryClient();
  const { data: children } = useChildren();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (children?.length && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const compressImage = async (uri: string) => {
    const result = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 1600 } }], {
      compress: 0.75,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return result.uri;
  };

  const processImage = async (uri: string) => {
    if (!selectedChildId) {
      Alert.alert(strings.selectChild);
      return;
    }

    setLoading(true);
    try {
      const compressed = await compressImage(uri);
      const scanId = await uploadAndProcessScan(selectedChildId, compressed);
      await queryClient.invalidateQueries({ queryKey: ['scans'] });
      router.push(`/(app)/analysis/${scanId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : strings.errors.generic;
      Alert.alert(strings.errors.generic, message);
    } finally {
      setLoading(false);
    }
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(strings.errors.camera);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  };

  if (!children?.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{strings.noChildrenHint}</Text>
        <Button title={strings.addChild} onPress={() => router.push('/(app)/child/new')} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <CardTitle>{strings.selectChild}</CardTitle>
        <View style={styles.childList}>
          {children.map((child) => (
            <Button
              key={child.id}
              title={child.name}
              variant={selectedChildId === child.id ? 'primary' : 'secondary'}
              onPress={() => setSelectedChildId(child.id)}
            />
          ))}
        </View>
      </Card>

      <Text style={styles.hint}>Fotografieren Sie die Klassenarbeit oder wählen Sie ein Bild aus der Galerie.</Text>

      <Button title={strings.fromCamera} onPress={pickFromCamera} loading={loading} />
      <Button title={strings.fromGallery} variant="secondary" onPress={pickFromGallery} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  childList: { gap: 8 },
  hint: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  empty: { flex: 1, padding: 24, justifyContent: 'center', gap: 12 },
  emptyText: { color: colors.textMuted, fontSize: 16 },
});
