import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

/** Read a local image URI into an ArrayBuffer. */
export async function readImageAsArrayBuffer(imageUri: string): Promise<ArrayBuffer> {
  // Web: blob/data URIs work with fetch; expo-file-system is native-only.
  if (Platform.OS === 'web') {
    const response = await fetch(imageUri);
    return response.arrayBuffer();
  }

  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
