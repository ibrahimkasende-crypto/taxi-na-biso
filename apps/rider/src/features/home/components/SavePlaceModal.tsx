import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { TnbButton } from '../../../components/tnb/TnbButton';
import { colors, examplePlaces } from '../../../config/brand';
import type { Place } from '../../../lib/geocode';

type Props = {
  visible: boolean;
  title: string;
  current?: Place | null;
  onClose: () => void;
  onSave: (place: Place) => void;
};

export function SavePlaceModal({ visible, title, current, onClose, onSave }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>Choisissez une adresse à Kinshasa.</Text>
          {examplePlaces.map((place) => (
            <Pressable key={place.label} style={styles.row} onPress={() => onSave(place)}>
              <Text style={styles.rowText}>{place.label}</Text>
            </Pressable>
          ))}
          {current ? (
            <View style={{ marginTop: 12 }}>
              <TnbButton label="Utiliser la position actuelle" onPress={() => onSave(current)} />
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(17,24,39,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 28,
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.ink },
  sub: { color: colors.textMuted, marginTop: 6, marginBottom: 12 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rowText: { fontSize: 15, fontWeight: '600', color: colors.ink },
});
