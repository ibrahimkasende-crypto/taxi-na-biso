import { supabase } from '../../lib/supabase';

const BUCKET = 'avatars';

export function withCacheBust(url: string): string {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${Date.now()}`;
}

export async function uploadOwnAvatar(userId: string, localUri: string, mime: string): Promise<string> {
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpeg';
  const path = `${userId}/profile.${ext}`;
  const response = await fetch(localUri);
  const blob = await response.blob();
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, blob, {
    upsert: true,
    contentType: mime,
  });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const avatarUrl = withCacheBust(data.publicUrl);

  const { error: updateError } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl } as never)
    .eq('id', userId);
  if (updateError) throw updateError;
  return avatarUrl;
}

export async function pickImageFromGallery(): Promise<{ uri: string; mime: string } | null> {
  try {
    // Module natif optionnel — absent de l’APK injecté actuel.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ImagePicker = require('expo-image-picker') as {
      requestMediaLibraryPermissionsAsync: () => Promise<{ granted: boolean }>;
      launchImageLibraryAsync: (opts: object) => Promise<{
        canceled: boolean;
        assets?: { uri: string; mimeType?: string }[];
      }>;
    };
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Autorisation galerie refusée.');
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets?.[0]) return null;
    const asset = result.assets[0];
    return { uri: asset.uri, mime: asset.mimeType ?? 'image/jpeg' };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Autorisation')) throw error;
    throw new Error('La galerie n’est pas disponible dans cette version. Réinstallez un build natif avec expo-image-picker.');
  }
}
